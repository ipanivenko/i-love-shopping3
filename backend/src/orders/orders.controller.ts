import { Controller, Post, Body, Get, Param, Headers, Query, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards';
import { CurrentUser } from 'src/decorators/current.user';
import { CreateOrderDto } from './dto/create-order.dto';
import { OptionalJwtAuthGuard } from 'src/auth/jwt.auth-guards.optional';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(
    @CurrentUser('id') userId: string | null,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(userId ?? null, dto)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyOrders(
    @CurrentUser('id') userId: string,
    @Query('status') status?: OrderStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.findMyOrders(userId, {
      status,
      from,
      to,
    })
  }

  @Patch('me/:orderId/cancel')
  @UseGuards(JwtAuthGuard)
  cancelMyOrder(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.cancelMyOrder(userId, orderId)
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  findMyOrderById(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.findMyOrderById(userId, orderId)
  }

  @Get(':id')
  findOrderById(
    @Param('id') orderId: string,
    @Headers('x-guest-token') guestToken?: string,
  ) {
    return this.ordersService.findOrderForCheckout(orderId, guestToken)
  }
}
