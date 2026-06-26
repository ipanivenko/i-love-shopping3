import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { EmailService } from 'src/email/email.service'
import { OrdersService } from 'src/orders/orders.service'
import { RabbitmqService } from './rabbitmq.service'

type OrderCancellationRequestedMessage = {
    orderId: string
    paymentTransactionId: string
}

@Injectable()
export class OrderCancellationRequestedConsumer
    implements OnModuleInit {

    constructor(
        private readonly rabbitmqService: RabbitmqService,
        private readonly ordersService: OrdersService,
        private readonly emailService: EmailService,
    ) { }

    async onModuleInit() {
        await this.rabbitmqService.consume<OrderCancellationRequestedMessage>(
            'order-cancellation-requested-queue',
            async (message) => {
                await this.rabbitmqService.publish(
                    'order-refund-requested-queue',
                    {
                        orderId: message.orderId,
                        paymentTransactionId: message.paymentTransactionId,
                    },
                )

            },
        )
    }
}