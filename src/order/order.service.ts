import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { OrderDto } from './dto/order.dto'

@Injectable()
export class OrderService {
	constructor(private prisma: PrismaService) {}

	async create(dto: OrderDto, userId: number) {
		const orderItems = dto.items.map(item => ({
			quantity: item.quantity,
			price: item.price,
			product: {
				connect: {
					id: item.productId
				}
			}
		}))

		const total = dto.items.reduce((acc, item) => {
			return acc + item.price * item.quantity
		}, 0)

		const order = await this.prisma.order.create({
			data: {
				items: {
					create: orderItems
				},
				total,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})
	}

	async findAll() {
		return await this.prisma.order.findMany()
	}

	async findByUser(userId: number) {
		return await this.prisma.order.findMany({
			where: {
				userId
			},
			orderBy: {
				cretedAt: 'desc'
			}
		})
	}
}
