import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { ReviewDto } from './dto/review.dto'
import { ReviewService } from './review.service'

@Controller('reviews')
export class ReviewController {
	constructor(private readonly reviewService: ReviewService) {}

	@HttpCode(200)
	@Auth()
	@Post('leave/:productId')
	create(
		@CurrentUser('id') userId: number,
		@Param('productId') productId: string,
		@Body() dto: ReviewDto
	) {
		return this.reviewService.create(dto, userId, +productId)
	}

	@Auth()
	@Get(':id')
	byId(@Param('id') id: string) {
		return this.reviewService.byId(+id)
	}

	@Auth()
	@Get()
	findAll() {
		return this.reviewService.findAll()
	}

	@HttpCode(200)
	@Auth()
	@Put(':id')
	update(@Param('id') id: string, @Body() dto: ReviewDto) {
		return this.reviewService.update(+id, dto)
	}

	@HttpCode(200)
	@Auth()
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.reviewService.remove(+id)
	}

	@Get('average-by-product/:productId')
	async getAverageValueByProductId(@Param('productId') productId: string) {
		return this.reviewService.getAverageValueByProductId(+productId)
	}
}
