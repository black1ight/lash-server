import { Prisma } from '@prisma/client'

export const returnReviewObject: Prisma.ReviewSelect = {
	user: {
		select: {
			id: true,
			email: true,
			name: true,
			avatarPath: true
		}
	},
	id: true,
	rating: true,
	text: true,
	createdAt: true,
	product: true
}
