import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll(@CurrentUser('id') userId: number) {
    return this.orderService.findAll(userId);
  }
}
