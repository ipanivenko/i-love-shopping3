import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { EmailService } from 'src/email/email.service'
import { OrdersService } from 'src/orders/orders.service'
import { RabbitmqService } from './rabbitmq.service'

type OrderCancellationAdminApprovalMessage = {
  orderId: string
  paymentTransactionId: string
  previousStatus: string
}

@Injectable()
export class OrderCancellationAdminApprovalConsumer implements OnModuleInit {
  private readonly logger = new Logger(OrderCancellationAdminApprovalConsumer.name)

  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.rabbitmqService.consume<OrderCancellationAdminApprovalMessage>(
      'order-cancellation-admin-approval-required-queue',
      async (message) => {
        this.logger.log(
          `Admin approval required for cancellation of order ${message.orderId}`,
        )

        const order = await this.ordersService.findMyOrderForSystem(
          message.orderId,
        )

        const customerEmail = order.customerInfo?.email

        if (customerEmail) {
          await this.emailService.sendOrderCancellationRequestedEmail({
            to: customerEmail,
            orderId: order.id,
          })
        }

        // No refund here.
        // Refund happens only after admin approves cancellation.
      },
    )
  }
}