import { Injectable, OnModuleInit } from '@nestjs/common'
import { RabbitmqService } from './rabbitmq.service'
import { OrdersService } from '../orders/orders.service'
import { EmailService } from '../email/email.service'
import { EncryptionService } from 'src/security/encryption.service'

@Injectable()
export class PaymentSucceededConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
    private readonly encryptionService: EncryptionService,
  ) { }

  async onModuleInit() {
    await this.rabbitmqService.consumePaymentSucceeded(async (data) => {
      const order = await this.ordersService.markOrderAsPaid(data.orderId, data.paymentIntentId)

      const customerEmail = this.encryptionService.decrypt(
        order.customerInfo?.email,
      )

      if (!customerEmail) {
        return
      }

      await this.emailService.sendOrderPaidEmail({
        to: customerEmail,
        orderId: order.id,
        totalCents: order.totalCents,
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCents,
        items: order.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          priceCents: item.unitPriceCents,
        })),
        paymentBrand: 'Card',
        paidAt: new Date(),
      })
    })
  }
}