import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PaginationService } from 'src/pagination/pagination.service'
import { PrismaService } from 'src/prisma.service'
import { slugGenerate } from 'src/utils/slug-generate'
import { enumProductSort, getAllProductDto } from './dto/get-all.product.dto'
import { ProductDto } from './dto/product.dto'
import { returnProductObject } from './return-product.object'

@Injectable()
export class ProductService {
	constructor(
		private prisma: PrismaService,
		private paginationService: PaginationService
	) {}

	async create(dto: ProductDto) {
		const isExist = await this.prisma.product.findUnique({
			where: {
				name: dto.name
			}
		})

		if (isExist)
			throw new BadRequestException(`product "${isExist.name}" already exist`)

		const newProduct = await this.prisma.product.create({
			data: {
				name: dto.name,
				description: dto.description,
				images: dto.images,
				price: dto.price,
				discount: dto.discount,
				slug: slugGenerate(dto.name),
				categoryId: dto.categoryId
			}
		})

		return newProduct
	}

	async findAll(dto: getAllProductDto = {}) {
		const { sort, searchTerm } = dto

		const prismaSort: Prisma.ProductOrderByWithRelationInput[] = []

		if (sort === enumProductSort.LOW_PRICE) {
			prismaSort.push({ price: 'asc' })
		} else if (sort === enumProductSort.HIGH_PRICE) {
			prismaSort.push({ price: 'desc' })
		} else if (sort === enumProductSort.RANK) {
			prismaSort.push({ rank: 'desc' })
		} else if (sort === enumProductSort.DISCOUNT) {
			prismaSort.push({ discount: 'desc' })
		} else if (sort === enumProductSort.OLDEST) {
			prismaSort.push({ createdAt: 'asc' })
		} else {
			prismaSort.push({ createdAt: 'desc' })
		}

		const prismaSearchTermFilter: Prisma.ProductWhereInput = searchTerm
			? {
					OR: [
						{
							category: {
								name: {
									contains: searchTerm,
									mode: 'insensitive'
								}
							}
						},
						{
							name: {
								contains: searchTerm,
								mode: 'insensitive'
							}
						},
						{
							description: {
								contains: searchTerm,
								mode: 'insensitive'
							}
						}
					]
				}
			: {}

		const { perPage, skip } = this.paginationService.getPagination(dto)

		const products = await this.prisma.product.findMany({
			where: prismaSearchTermFilter,
			orderBy: prismaSort,
			select: returnProductObject,
			// skip,
			take: perPage
		})

		return {
			products,
			length: await this.prisma.product.count({
				where: prismaSearchTermFilter
			})
		}
	}

	async byId(id: number) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			select: returnProductObject
		})
		if (!product) throw new NotFoundException('product not found')
		return product
	}

	async bySlug(slug: string) {
		const product = await this.prisma.product.findUnique({
			where: { slug },
			select: returnProductObject
		})

		if (!product) throw new NotFoundException('product not found')
		return product
	}

	async byCategory(dto: getAllProductDto = {}, categorySlug: string) {
		const { sort, searchTerm } = dto
		const prismaSort: Prisma.ProductOrderByWithRelationInput[] = []

		if (sort === enumProductSort.LOW_PRICE) {
			prismaSort.push({ price: 'asc' })
		} else if (sort === enumProductSort.HIGH_PRICE) {
			prismaSort.push({ price: 'desc' })
		} else if (sort === enumProductSort.RANK) {
			prismaSort.push({ rank: 'desc' })
		} else if (sort === enumProductSort.DISCOUNT) {
			prismaSort.push({ discount: 'desc' })
		} else if (sort === enumProductSort.OLDEST) {
			prismaSort.push({ createdAt: 'asc' })
		} else {
			prismaSort.push({ createdAt: 'desc' })
		}

		const { perPage, skip } = this.paginationService.getPagination(dto)

		const products = await this.prisma.product.findMany({
			where: {
				category: {
					slug: categorySlug
				}
			},
			orderBy: prismaSort,
			select: returnProductObject,
			// skip,
			take: perPage
		})

		return {
			products,
			length: products.length
		}
	}

	async getSimilar(slug: string) {
		const currentProduct = await this.bySlug(slug)

		if (!currentProduct) throw new NotFoundException('currentProduct not found')

		const products = await this.prisma.product.findMany({
			where: {
				name: currentProduct.category.name,
				NOT: {
					id: currentProduct.id
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			select: returnProductObject
		})
		return products
	}

	async update(id: number, dto: ProductDto) {
		const isSameProduct = await this.prisma.product.findUnique({
			where: {
				name: dto.name
			},
			select: returnProductObject
		})

		if (isSameProduct && id !== isSameProduct.id)
			throw new BadRequestException(`a product ${dto.name}'already exists`)

		return this.prisma.product.update({
			where: {
				id
			},
			data: {
				images: dto.images,
				name: dto.name,
				description: dto.description,
				categoryId: dto.categoryId,
				price: dto.price,
				slug: slugGenerate(dto.name),
				discount: dto.discount
			}
		})
	}

	async updateRank(productId: number) {
		const product = await this.byId(productId)
		const rankValue =
			product.reviews.reduce((acc, rev) => {
				return acc + rev.rating
			}, 0) / product.reviews.length

		return this.prisma.product.update({
			where: { id: productId },
			data: {
				rank: rankValue
			}
		})
	}

	async remove(id: number) {
		return await this.prisma.product.delete({ where: { id } })
	}
}
