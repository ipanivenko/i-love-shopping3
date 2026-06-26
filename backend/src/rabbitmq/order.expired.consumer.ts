import { Injectable, OnModuleInit } from '@nestjs/common'
import { OrdersService } from '../orders/orders.service'
import { RabbitmqService } from './rabbitmq.service'

@Injectable()
export class OrdersConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly ordersService: OrdersService,
  ) {}

  async onModuleInit() {
    await this.rabbitmqService.consume<{ orderId: string }>(
      'order-payment-expired-queue',
      async ({ orderId }) => {
        await this.ordersService.expireOrderAndReleaseStock( orderId )
      },
    )
  }
}