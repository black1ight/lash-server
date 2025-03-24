import { EnumOrderStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
	IsArray,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString
} from 'class-validator'

export class OrderDto {
	@IsOptional()
	@IsEnum(EnumOrderStatus, {
		message: 'status is required'
	})
	status: string

	@IsArray()
	@Type(() => OrderItemDto)
	items: OrderItemDto[]
}

export class OrderItemDto {
	@IsNumber({}, { message: 'Quantity must be a number' })
	quantity: number

	@IsNumber({}, { message: 'Price must be a number' })
	price: number

	@IsString({ message: 'Product id must be a string' })
	productId: string
}
