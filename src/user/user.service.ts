import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { hash } from 'argon2'
import { PrismaService } from '../prisma.service'
import { UserDto } from './dto/user.dto'
import { returnUserObject } from './return-user.object'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async byId(id: number, selectObject: Prisma.UserSelect = {}) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: {
				...returnUserObject,
				favorites: {
					select: { product: true }
				},
				...selectObject
			}
		})
		if (!user) throw new Error('user not found')
		return user
	}

	async updateProfile(id: number, dto: UserDto) {
		const isSameUser = await this.prisma.user.findUnique({
			where: { email: dto.email }
		})

		if (isSameUser && id !== isSameUser.id) {
			throw new BadRequestException('email already in use')
		}

		const user = await this.byId(id)

		return this.prisma.user.update({
			where: { id },
			data: {
				email: dto.email,
				password: dto.password ? await hash(dto.password) : user.password,
				name: dto.name,
				phone: dto.phone,
				avatarPath: dto.avatarPath
			}
		})
	}

	async toggleFavorite(userId: number, productId: number) {
		return this.prisma.$transaction(async tx => {
			const favorite = await tx.favorite.findUnique({
				where: { userId_productId: { userId, productId } }
			})

			if (favorite) {
				await this.prisma.favorite.delete({
					where: {
						userId_productId: { userId, productId }
					}
				})
			} else {
				await this.prisma.favorite.create({
					data: { userId, productId }
				})
			}
			return 'success'
		})
	}
}
