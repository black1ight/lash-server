import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/pagination/dto/pagination.dto'

export enum enumProductSort {
	RANK = 'rank',
	DISCOUNT = 'discount',
	HIGH_PRICE = 'high-price',
	LOW_PRICE = 'low-price',
	NEWEST = 'newest',
	OLDEST = 'oldest'
}

export class getAllProductDto extends PaginationDto {
	@IsOptional()
	@IsEnum(enumProductSort)
	sort?: enumProductSort

	@IsOptional()
	@IsString()
	searchTerm?: string
}
