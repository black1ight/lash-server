import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma.service';
import { slugGenerate } from 'src/utils/slug-generate';
import { enumProductSort, getAllProductDto } from './dto/get-all.product.dto';
import { ProductDto } from './dto/product.dto';
import {
  returnProductObject,
  returnProductObjectFullest,
} from './return-product.object';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async create(dto: ProductDto) {
    const isExist = await this.prisma.product.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (isExist)
      throw new BadRequestException(`product "${isExist.name}" already exist`);

    const newProduct = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        slug: slugGenerate(dto.name),
        categoryId: dto.categoryId,
      },
    });

    return newProduct;
  }

  async findAll(dto: getAllProductDto = {}) {
    const { sort, searchTerm } = dto;
    const prismaSort: Prisma.ProductOrderByWithRelationInput[] = [];

    if (sort === enumProductSort.LOW_PRICE) {
      prismaSort.push({ price: 'asc' });
    } else if (sort === enumProductSort.HIGH_PRICE) {
      prismaSort.push({ price: 'desc' });
    } else if (sort === enumProductSort.OLDEST) {
      prismaSort.push({ cretedAt: 'asc' });
    } else {
      prismaSort.push({ cretedAt: 'desc' });
    }

    const prismaSearchTermFilter: Prisma.ProductWhereInput = searchTerm
      ? {
          OR: [
            {
              category: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
              description: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const { perPage, skip } = this.paginationService.getPagination(dto);

    const products = await this.prisma.product.findMany({
      where: prismaSearchTermFilter,
      orderBy: prismaSort,
      skip,
      take: perPage,
    });

    return {
      products,
      length: await this.prisma.product.count({
        where: prismaSearchTermFilter,
      }),
    };
  }

  async byId(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: returnProductObjectFullest,
    });
    if (!product) throw new NotFoundException('product not found');
    return product;
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: returnProductObjectFullest,
    });
    if (!product) throw new NotFoundException('product not found');
    return product;
  }

  async byCategory(categorySlug: string) {
    const product = await this.prisma.product.findMany({
      where: {
        category: {
          slug: categorySlug,
        },
      },
      select: returnProductObjectFullest,
    });
    if (!product) throw new NotFoundException('product not found');
    return product;
  }

  async getSimilar(id: number) {
    const currentProduct = await this.byId(id);

    if (!currentProduct)
      throw new NotFoundException('currentProduct not found');

    const products = await this.prisma.product.findMany({
      where: {
        name: currentProduct.category.name,
        NOT: {
          id: currentProduct.id,
        },
      },
      orderBy: {
        cretedAt: 'desc',
      },
      select: returnProductObject,
    });
    return products;
  }

  async update(id: number, dto: ProductDto) {
    const isSameProduct = await this.prisma.product.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (isSameProduct && id !== isSameProduct.id)
      throw new BadRequestException(`a product ${dto.name}'already exists`);

    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        images: dto.images,
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        price: dto.price,
        slug: slugGenerate(dto.name),
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.product.delete({ where: { id } });
  }
}
