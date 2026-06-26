import { Injectable, OnModuleInit } from '@nestjs/common'
import { PaymentsService } from 'src/payments/payments.service'
import { RabbitmqService } from './rabbitmq.service'
import { OrdersService } from 'src/orders/orders.service'
import { EmailService } from 'src/email/email.service'

@Injectable()
export class OrderRefundRequestedConsumer
  implements OnModuleInit {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
  ) { }

  async onModuleInit() {

    await this.rabbitmqService.consume<{
      orderId: string
      paymentTransactionId: string
    }>(
      'order-refund-requested-queue',

      async ({ orderId, paymentTransactionId }) => {
        await this.paymentsService.refundOrderPayment(
          orderId,
          paymentTransactionId,
        )

        const order = await this.ordersService.refundOrderAndReleaseStock(orderId)

        const customerEmail = order.customerInfo?.email
        console.log("email", customerEmail)

        if (customerEmail) {
          await this.emailService.sendOrderCancellationApprovedEmail({
            to: customerEmail,
            orderId: order.id,
          })
        }
      },
    )
  }
}