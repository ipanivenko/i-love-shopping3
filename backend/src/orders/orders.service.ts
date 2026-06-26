import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { BadRequestException, NotFoundException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { EncryptionService } from 'src/security/encryption.service';
import { Cron } from '@nestjs/schedule';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service'


@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly rabbitmqService: RabbitmqService,
  ) { }

  @Cron('*/10 * * * *') // every 10 minute
  async expirePendingPaymentOrders() {
    const now = new Date()

    const expiredOrders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        paymentExpiresAt: {
          lte: now,
        },
      },
      take: 50,
    })


    if (expiredOrders.length === 0) {
      return
    }


    for (const order of expiredOrders) {
      try {
        await this.rabbitmqService.publish(
          'order-payment-expired-queue',
          {
            orderId: order.id,
          },
        )

      } catch (error) {
        this.logger.error(
          `Failed to publish expiration job for order ${order.id}`,
          error instanceof Error
            ? error.stack
            : String(error),
        )
      }
    }
  }

  async create(userId: string | null, dto: CreateOrderDto) {
    if (dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item')
    }

    const shippingMethod = await this.prisma.shippingMethod.findFirst({
      where: {
        id: dto.shippingMethodId,
        isActive: true,
      },
    })

    if (!shippingMethod) {
      throw new NotFoundException('Shipping method not found')
    }

    const skuIds = dto.items.map((item) => item.skuId)

    const skus = await this.prisma.productSku.findMany({
      where: {
        id: { in: skuIds },
      },
      include: {
        color: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
    })

    if (skus.length !== skuIds.length) {
      throw new BadRequestException('Some products are no longer available')
    }

    const orderItems = dto.items.map((item) => {
      const sku = skus.find((sku) => sku.id === item.skuId)

      if (!sku) {
        throw new BadRequestException('Invalid SKU')
      }

      if (sku.stockQty < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for ${sku.color.product.name}`,
        )
      }

      const unitPriceCents = sku.color.product.priceCents
      const lineTotalCents = unitPriceCents * item.quantity

      return {
        skuId: sku.id,
        quantity: item.quantity,

        productName: sku.color.product.name,
        productSlug: sku.color.product.slug,
        brandName: sku.color.product.brand?.name,
        imageUrl: sku.color.images[0]?.url,

        skuLabel: `EU ${sku.sizeEU}`,
        unitPriceCents,
        lineTotalCents,
      }
    })

    const subtotalCents = orderItems.reduce(
      (sum, item) => sum + item.lineTotalCents,
      0,
    )

    const shippingCents = shippingMethod.priceCents
    const totalCents = subtotalCents + shippingCents

    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const sku = skus.find((sku) => sku.id === item.skuId)

        if (!sku) {
          throw new BadRequestException('Invalid SKU')
        }

        const updatedSku = await tx.productSku.updateMany({
          where: {
            id: item.skuId,
            stockQty: {
              gte: item.quantity,
            },
          },
          data: {
            stockQty: {
              decrement: item.quantity,
            },
          },
        })

        if (updatedSku.count === 0) {
          throw new BadRequestException(
            `Not enough stock for ${sku.color.product.name}`,
          )
        }
      }

      let guestToken: string | null = null

      if (userId == null) {
        guestToken = crypto.randomUUID()
      }

      const order = await tx.order.create({
        data: {
          userId,
          guestToken,
          status: OrderStatus.PENDING_PAYMENT,
          paymentExpiresAt: new Date(Date.now() + 30 * 60 * 1000),

          subtotalCents,
          shippingCents,
          totalCents,
          currency: 'EUR',

          customerInfo: {
            create: {
              email: this.encryptionService.encryptRequired(dto.customerInfo.email),
              name: this.encryptionService.encrypt(dto.customerInfo.name),
            },
          },

          shippingAddress: {
            create: {
              fullName: this.encryptionService.encryptRequired(
                dto.shippingAddress.fullName,
              ),
              phone: this.encryptionService.encrypt(dto.shippingAddress.phone),
              address: this.encryptionService.encryptRequired(
                dto.shippingAddress.address,
              ),
              city: this.encryptionService.encryptRequired(dto.shippingAddress.city),

              postcode: dto.shippingAddress.postcode,
              country: dto.shippingAddress.country,
            },
          },

          shippingMethod: {
            create: {
              shippingMethodId: shippingMethod.id,
              name: shippingMethod.name,
              code: shippingMethod.code,
              priceCents: shippingMethod.priceCents,
            },
          },

          items: {
            create: orderItems,
          },
          orderStatusHistory: {
            create: {
              status: OrderStatus.PENDING_PAYMENT,
              note: 'Order created and waiting for payment',
            },
          },
        },
        include: {
          items: true,
          customerInfo: true,
          shippingAddress: true,
          shippingMethod: true,
          orderStatusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })


      return {
        order: this.decryptOrder(order),
        guestToken,
      }
    })
  }

  async findMyOrders(
    userId: string,
    filters?: {
      status?: OrderStatus
      from?: string
      to?: string
    },
  ) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,

        ...(filters?.status && {
          status: filters.status,
        }),

        ...((filters?.from || filters?.to) && {
          createdAt: {
            ...(filters.from && { gte: new Date(filters.from) }),
            ...(filters.to && { lte: new Date(filters.to) }),
          },
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: this.orderDetailsInclude(),
    })

    return orders.map((order) => this.decryptOrder(order))
  }

  async findMyOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
        customerInfo: true,
        shippingAddress: true,

        shippingMethod: {
          include: {
            shippingMethod: true,
          },
        },

        orderStatusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return this.decryptOrder(order)
  }

  async findOrderForCheckout(orderId: string, guestToken?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        shippingMethod: true,
      },
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    // Registered user order should not be public
    if (order.userId) {
      throw new UnauthorizedException('Login required to view this order')
    }

    // Guest order requires guest token
    if (!guestToken || guestToken !== order.guestToken) {
      throw new UnauthorizedException('Invalid guest token')
    }

    return this.decryptOrder(order)
  }

  async findMyOrderForSystem(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: this.orderDetailsInclude(),
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return this.decryptOrder(order)
  }

  private decryptOrder(order: any) {
    return {
      ...order,

      customerInfo: order.customerInfo
        ? {
          ...order.customerInfo,
          email: this.encryptionService.safeDecrypt(order.customerInfo.email),
          name: this.encryptionService.safeDecrypt(order.customerInfo.name),
        }
        : order.customerInfo,

      shippingAddress: order.shippingAddress
        ? {
          ...order.shippingAddress,
          fullName: this.encryptionService.safeDecrypt(
            order.shippingAddress.fullName,
          ),
          phone: this.encryptionService.safeDecrypt(
            order.shippingAddress.phone,
          ),
          address: this.encryptionService.safeDecrypt(
            order.shippingAddress.address,
          ),
          city: this.encryptionService.safeDecrypt(
            order.shippingAddress.city,
          ),
        }
        : order.shippingAddress,
    }
  }


  async cancelMyOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        paymentTransactions: true,
      },
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    if (order.status === OrderStatus.CANCEL_REQUESTED) {
      throw new BadRequestException('Cancellation already requested')
    }

    const cancellableStatuses: OrderStatus[] = [
      OrderStatus.PAYMENT_SUCCESSFUL,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ]

    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException('This order can no longer be cancelled')
    }

    const payment = order.paymentTransactions.find(
      (transaction) => transaction.status === PaymentStatus.SUCCEEDED,
    )

    if (!payment) {
      throw new BadRequestException('No successful payment found for this order')
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        previousStatusBeforeCancellation: order.status,
        status: OrderStatus.CANCEL_REQUESTED,
        orderStatusHistory: {
          create: {
            status: OrderStatus.CANCEL_REQUESTED,
            note:
              order.status === OrderStatus.PAYMENT_SUCCESSFUL
                ? 'Cancellation requested by customer before processing'
                : `Cancellation requested by customer while order was ${order.status}`,
          },
        },
      },
      include: this.orderDetailsInclude(),
    })

    const queueName =
      order.status === OrderStatus.PAYMENT_SUCCESSFUL
        ? 'order-cancellation-requested-queue'
        : 'order-cancellation-admin-approval-required-queue'

    await this.rabbitmqService.publish(queueName, {
      orderId: order.id,
      paymentTransactionId: payment.id,
      previousStatus: order.status,
    })

    return this.decryptOrder(updatedOrder)
  }


  async markOrderAsPaid(
    orderId: string,
    providerPaymentId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          customerInfo: true,
          items: true,
        },
      })

      if (!order) {
        throw new Error('Order not found.')
      }

      if (order.status === OrderStatus.PAYMENT_SUCCESSFUL) {
        return order
      }

      await tx.paymentTransaction.updateMany({
        where: {
          orderId,
          providerPaymentId,
        },
        data: {
          status: PaymentStatus.SUCCEEDED,
          errorCode: null,
          errorMessage: null,
        },
      })

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAYMENT_SUCCESSFUL,
          paidAt: new Date(),

          orderStatusHistory: {
            create: {
              status: OrderStatus.PAYMENT_SUCCESSFUL,
              note: 'Payment successfully confirmed',
            },
          },
        },
        include: {
          customerInfo: true,
          items: true,
          orderStatusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })

      if (order.userId) {
        const cart = await tx.cart.findUnique({
          where: { userId: order.userId },
        })

        if (cart) {
          await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
          })
        }
      }

      return updatedOrder
    })
  }

  async markOrderAsPaymentFailed(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          customerInfo: true,
        },
      })

      if (!order) {
        throw new Error('Order not found.')
      }

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        return order
      }

      await tx.paymentTransaction.updateMany({
        where: {
          orderId,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.FAILED,
        },
      })

      return tx.order.update({
        where: { id: orderId },
        data: {
          orderStatusHistory: {
            create: {
              status: OrderStatus.PENDING_PAYMENT,
              note: 'Payment attempt failed. Customer can retry before expiration.',
            },
          },
        },
        include: {
          customerInfo: true,
          orderStatusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })
    })
  }

  async expireOrderAndReleaseStock(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      })

      if (!order) {
        throw new Error('Order not found.')
      }

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        return order
      }

      for (const item of order.items) {
        if (!item.skuId) {
          continue
        }
        await tx.productSku.update({
          where: {
            id: item.skuId,
          },
          data: {
            stockQty: {
              increment: item.quantity,
            },
          },
        })
      }

      await tx.paymentTransaction.updateMany({
        where: {
          orderId,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.EXPIRED,
        },
      })

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAYMENT_EXPIRED,

          orderStatusHistory: {
            create: {
              status: OrderStatus.PAYMENT_EXPIRED,
              note: 'Payment window expired',
            },
          },
        },
        include: {
          orderStatusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })
    })
  }

  async refundOrderAndReleaseStock(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          customerInfo: true,
        },
      })

      if (!order) {
        throw new Error('Order not found.')
      }

      if (
        order.status !== OrderStatus.CANCEL_REQUESTED &&
        order.status !== OrderStatus.CANCELLED
      ) {
        if (order.customerInfo?.email) {
          const decryptedEmail = this.encryptionService.decrypt(
            order.customerInfo.email,
          )

          if (decryptedEmail) {
            order.customerInfo.email = decryptedEmail
          }
        }

        return order
      }

      for (const item of order.items) {
        if (!item.skuId) {
          continue
        }

        await tx.productSku.update({
          where: {
            id: item.skuId,
          },
          data: {
            stockQty: {
              increment: item.quantity,
            },
          },
        })
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.REFUNDED,
          orderStatusHistory: {
            create: {
              status: OrderStatus.REFUNDED,
              note: 'Order cancelled, refund processed and stock restored',
            },
          },
        },
        include: {
          customerInfo: true,
          orderStatusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })

      if (updatedOrder.customerInfo?.email) {
        const decryptedEmail = this.encryptionService.decrypt(
          updatedOrder.customerInfo.email,
        )

        if (decryptedEmail) {
          updatedOrder.customerInfo.email = decryptedEmail
        }
      }

      return updatedOrder
    })
  }

  private orderDetailsInclude() {
    return {
      items: {
        include: {
          sku: {
            include: {
              color: {
                include: {
                  product: true,
                  images: {
                    orderBy: {
                      sortOrder: 'asc' as const,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },

      customerInfo: true,

      shippingAddress: true,

      shippingMethod: true,

      paymentTransactions: {
        orderBy: {
          createdAt: 'desc' as const,
        },
      },

      orderStatusHistory: {
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
    }
  }
}