import { Prisma } from '@prisma/client'
import { returnCategoryObject } from 'src/category/return-category.object'
import { returnReviewObject } from 'src/review/return-review.object'

export const returnProductObject: Prisma.ProductSelect = {
	id: true,
	name: true,
	description: true,
	price: true,
	slug: true,
	rank: true,
	discount: true,
	images: true,
	cretedAt: true,
	orderItems: true,
	category: { select: returnCategoryObject },
	reviews: { select: returnReviewObject }
}

export const returnProductObjectFullest: Prisma.ProductSelect = {
	...returnProductObject,
	reviews: { select: returnReviewObject },
	category: { select: returnCategoryObject }
}
