import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { RabbitmqService } from '../../rabbitmq/rabbitmq.service'
import { EncryptionService } from 'src/security/encryption.service'

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly encryptionService: EncryptionService,
  ) { }

  private orderInclude() {
    return {
      items: true,
      customerInfo: true,
      shippingAddress: true,
      shippingMethod: true,
      paymentTransactions: true,
      orderStatusHistory: {
        orderBy: {
          createdAt: 'desc' as const,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    }
  }

  private decryptOrder(order: any) {
    return {
      ...order,

      user: order.user
        ? {
          ...order.user,
          email: this.decryptValue('user.email', order.user.email),
          name: this.decryptValue('user.name', order.user.name),
        }
        : null,

      customerInfo: order.customerInfo
        ? {
          ...order.customerInfo,
          email: this.decryptValue(
            'customerInfo.email',
            order.customerInfo.email,
          ),
          name: this.decryptValue(
            'customerInfo.name',
            order.customerInfo.name,
          ),
        }
        : null,

      shippingAddress: order.shippingAddress
        ? {
          ...order.shippingAddress,
          fullName: this.decryptValue(
            'shippingAddress.fullName',
            order.shippingAddress.fullName,
          ),
          phone: this.decryptValue(
            'shippingAddress.phone',
            order.shippingAddress.phone,
          ),
          address: this.decryptValue(
            'shippingAddress.address',
            order.shippingAddress.address,
          ),
          city: this.decryptValue(
            'shippingAddress.city',
            order.shippingAddress.city,
          ),
        }
        : null,
    }
  }

  private decryptOrders(orders: any[]) {

    return orders.map((order, index) => {
      return this.decryptOrder(order)
    })
  }

  async findAll() {
    const orders = await this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: this.orderInclude(),
    })

    return this.decryptOrders(orders)
  }

  async findOne(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: this.orderInclude(),
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return this.decryptOrder(order)
  }

  async updateStatus(orderId: string, status: OrderStatus, note?: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
        orderStatusHistory: {
          create: {
            status,
            note: note ?? `Status updated by admin to ${status}`,
          },
        },
      },
      include: this.orderInclude(),
    })

    return this.decryptOrder(updatedOrder)
  }

  async approveCancellation(orderId: string, note?: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        paymentTransactions: true,
      },
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    if (order.status !== OrderStatus.CANCEL_REQUESTED) {
      throw new BadRequestException('This order has no cancellation request')
    }

    const payment = order.paymentTransactions.find(
      (transaction) => transaction.status === PaymentStatus.SUCCEEDED,
    )

    if (!payment) {
      throw new BadRequestException('No successful payment found for this order')
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.CANCELLED,
        previousStatusBeforeCancellation: null,
        orderStatusHistory: {
          create: {
            status: OrderStatus.CANCELLED,
            note: note ?? 'Cancellation approved by admin',
          },
        },
      },
      include: this.orderInclude(),
    })

    await this.rabbitmqService.publish('order-refund-requested-queue', {
      orderId: order.id,
      paymentTransactionId: payment.id,
      refundType: 'FULL',
    })

    return this.decryptOrder(updatedOrder)
  }

  async rejectCancellation(orderId: string, note?: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    if (order.status !== OrderStatus.CANCEL_REQUESTED) {
      throw new BadRequestException('This order has no cancellation request')
    }

    if (!order.previousStatusBeforeCancellation) {
      throw new BadRequestException(
        'Previous order status is missing, cannot reject cancellation safely',
      )
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: order.previousStatusBeforeCancellation,
        previousStatusBeforeCancellation: null,

        orderStatusHistory: {
          create: {
            status: order.previousStatusBeforeCancellation,
            note: note ?? 'Cancellation rejected by admin',
          },
        },
      },
      include: this.orderInclude(),
    })

    return this.decryptOrder(updatedOrder)
  }


  private decryptValue(field: string, value: unknown) {

    if (typeof value !== 'string') {
      return value
    }

    try {
      return this.encryptionService.safeDecrypt(value)
    } catch (error) {
      return value
    }
  }
}