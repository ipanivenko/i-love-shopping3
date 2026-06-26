import { Injectable, OnModuleInit } from '@nestjs/common'
import { RabbitmqService } from './rabbitmq.service'
import { OrdersService } from '../orders/orders.service'
import { EmailService } from '../email/email.service'
import { EncryptionService } from 'src/security/encryption.service'

@Injectable()
export class PaymentFailedConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async onModuleInit() {

    await this.rabbitmqService.consumePaymentFailed(async (data) => {

      const order = await this.ordersService.markOrderAsPaymentFailed(
        data.orderId,
      )

      const customerEmail = this.encryptionService.decrypt(
        order.customerInfo?.email,
      )

      if (!customerEmail) {
        return
      }

      await this.emailService.sendOrderPaymentFailedEmail({
        to: customerEmail,
        orderId: order.id,
      })
    })
  }
}