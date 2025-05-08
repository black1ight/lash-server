import { Prisma } from '@prisma/client'

export const returnUserObject: Prisma.UserSelect = {
	id: true,
	email: true,
	password: false,
	phone: true,
	avatarPath: true,
	orders: {
		include: {
			items: {
				include: {
					product: {
						select: {
							name: true,
							images: true
						}
					}
				}
			}
		}
	}
}
