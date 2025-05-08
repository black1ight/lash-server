import { Injectable } from '@nestjs/common'
import * as dayjs from 'dayjs'
import 'dayjs/locale/uk'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/user.service'

dayjs.locale('uk')

const monthNames = [
	'січ',
	'лют',
	'бер',
	'квіт',
	'трав',
	'лип',
	'чер',
	'сер',
	'вер',
	'жов',
	'лис',
	'груд'
]

@Injectable()
export class StatisticsService {
	constructor(
		private prisma: PrismaService,
		private user: UserService
	) {}

	async getMainStatistics() {
		const totalRavegnue = await this.calculateTotalRavenue()
		const productsCount = await this.countProducts()
		const categoriesCount = await this.categoriesCount()
		const averageRating = await this.calculateAverageRating()

		return [
			{ id: 1, name: 'Надходження', value: totalRavegnue },
			{ id: 2, name: 'Товари', value: productsCount },
			{ id: 3, name: 'Категорії', value: categoriesCount },
			{ id: 4, name: 'Середній рейтинг', value: averageRating }
		]
	}

	async getMiddleStatistics() {
		const monthlySales = await this.calculateMonthlySales()
		const lastUsers = await this.getLastUsers()

		return { monthlySales, lastUsers }
	}

	private async calculateMonthlySales() {
		const startDate = dayjs().subtract(30, 'days').startOf('day').toDate()
		const endDate = dayjs().endOf('day').toDate()

		const salesRaw = await this.prisma.order.findMany({
			where: {
				createdAt: {
					gte: startDate,
					lte: endDate
				}
			},
			include: { items: true }
		})

		const formatDate = (date: Date): string => {
			return `${date.getDate()} ${monthNames[date.getMonth()]}`
		}

		const salesByDate = new Map<string, number>()

		salesRaw.forEach(order => {
			const formattedDate = formatDate(new Date(order.createdAt))
			const total = order.items.reduce((total, item) => {
				return total + item.price * item.quantity
			}, 0)
			if (salesByDate.has(formattedDate)) {
				salesByDate.set(formattedDate, salesByDate.get(formattedDate)! + total)
			} else {
				salesByDate.set(formattedDate, total)
			}
		})

		const monthlySales = Array.from(salesByDate, ([date, value]) => ({
			date,
			value
		}))

		return monthlySales
	}

	private async getLastUsers() {
		const lastUsers = await this.prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			take: 5,
			include: {
				orders: {
					select: {
						items: true
					}
				}
			}
		})

		return lastUsers.map(user => {
			const lastOrder = user.orders.at(-1)
			const total = lastOrder?.items.reduce((total, item) => {
				return total + item.price
			}, 0)
			return {
				id: user.id,
				name: user.name,
				email: user.email,
				avatarPath: user.avatarPath,
				total
			}
		})
	}

	private async calculateTotalRavenue() {
		const orders = await this.prisma.order.findMany({
			include: {
				items: true
			}
		})
		const totalRavegnue = orders.reduce((orderAcc, order) => {
			const total = order.items.reduce((itemsAcc, item) => {
				return itemsAcc + item.price * item.quantity
			}, 0)
			return orderAcc + total
		}, 0)

		return totalRavegnue
	}

	private async countProducts() {
		const productsCount = await this.prisma.product.count()
		return productsCount
	}

	private async categoriesCount() {
		const categoriesCount = await this.prisma.category.count()
		return categoriesCount
	}

	private async calculateAverageRating() {
		const averageRating = await this.prisma.review.aggregate({
			_avg: { rating: true }
		})
		return averageRating._avg.rating
	}
}
