import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { OrderDto } from './dto/order.dto'
import { OrderService } from './order.service'

@Controller('orders')
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('place')
	@Auth()
	create(@Body() dto: OrderDto, @CurrentUser('id') userId: number) {
		return this.orderService.create(dto, userId)
	}

	@Get()
	@Auth()
	findAll() {
		return this.orderService.findAll()
	}

	@Get(':id')
	@Auth()
	findByUser(@CurrentUser('id') userId: number) {
		return this.orderService.findByUser(userId)
	}
}
