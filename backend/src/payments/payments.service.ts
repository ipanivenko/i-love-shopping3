//Important: this endpoint does not mark the order as paid.
//It only creates the payment intent.
//The order becomes PAID later from a Stripe webhook after Stripe confirms the money.

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'prisma/prisma.service'
import Stripe from 'stripe'
import { PaymentProvider, PaymentStatus, PaymentTransactionType, OrderStatus } from '@prisma/client'
import { OrdersService } from 'src/orders/orders.service'
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service'
import { EncryptionService } from 'src/security/encryption.service'
import { EmailService } from 'src/email/email.service'




@Injectable()
export class PaymentsService {
    private readonly stripe: InstanceType<typeof Stripe>

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
        private readonly ordersService: OrdersService,
        private readonly emailService: EmailService,
        private readonly encryptionService: EncryptionService,
        private readonly rabbitmqService: RabbitmqService,
    ) {
        const stripeSecretKey = this.config.get<string>('STRIPE_SECRET_KEY')


        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY is missing')
        }

        this.stripe = new Stripe(stripeSecretKey)
    }

    async createStripePaymentIntent(
        orderId: string,
        userId?: string,
        guestToken?: string,
    ) {
        const PAYMENT_TIMEOUT_MS = 30 * 60 * 1000

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                paymentTransactions: true,
                customerInfo: true,
                items: true,
            },
        })

        if (!order) {
            throw new NotFoundException('Order not found')
        }

        const isAuthenticatedOwner =
            order.userId != null && order.userId === userId

        const isGuestOwner =
            order.guestToken != null && order.guestToken === guestToken

        if (!isAuthenticatedOwner && !isGuestOwner) {
            throw new ForbiddenException('You cannot pay this order')
        }

        if (order.status !== 'PENDING_PAYMENT') {
            throw new BadRequestException('This order is not waiting for payment')
        }

        const expiresAt = order.createdAt.getTime() + PAYMENT_TIMEOUT_MS
        const isExpired = Date.now() > expiresAt

        if (isExpired) {
            await this.ordersService.expireOrderAndReleaseStock(order.id)

            throw new BadRequestException(
                'Payment time expired. Please create a new order.',
            )
        }

        const existingPayment = order.paymentTransactions.find(
            (tx) =>
                tx.provider === PaymentProvider.STRIPE &&
                tx.type === PaymentTransactionType.PAYMENT &&
                tx.status === PaymentStatus.PENDING &&
                tx.providerPaymentId,
        )

        if (existingPayment?.providerPaymentId) {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(
                existingPayment.providerPaymentId,
            )

            if (paymentIntent.status === 'succeeded') {
                await this.ordersService.markOrderAsPaid(order.id, existingPayment.providerPaymentId)

                await this.prisma.paymentTransaction.updateMany({
                    where: {
                        providerPaymentId: paymentIntent.id,
                    },
                    data: {
                        status: PaymentStatus.SUCCEEDED,
                    },
                })

                const customerEmail = this.encryptionService.decrypt(order.customerInfo?.email)

                if (customerEmail) {
                    try {
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
                    } catch (error) {
                        console.error('Failed to send order paid email:', error)
                    }
                }

                throw new BadRequestException(
                    'Payment was already completed. Please check your order confirmation.',
                )
            }

            if (paymentIntent.status === 'canceled') {
                await this.prisma.paymentTransaction.updateMany({
                    where: {
                        providerPaymentId: paymentIntent.id,
                    },
                    data: {
                        status: PaymentStatus.CANCELLED,
                    },
                })

                throw new BadRequestException(
                    'This payment was cancelled. Please create a new payment.',
                )
            }
            if (paymentIntent.status === 'requires_payment_method') {

                if (!paymentIntent.last_payment_error) {
                    return {
                        paymentIntentId: paymentIntent.id,
                        clientSecret: paymentIntent.client_secret,
                    }
                }

                await this.prisma.paymentTransaction.updateMany({
                    where: {
                        providerPaymentId: paymentIntent.id,
                    },
                    data: {
                        status: PaymentStatus.FAILED,
                        errorCode: paymentIntent.last_payment_error?.code ?? null,
                        errorMessage: paymentIntent.last_payment_error?.message ?? null,
                    },
                })

                const orderWithCustomer = await this.prisma.order.findUnique({
                    where: { id: order.id },
                    include: {
                        customerInfo: true,
                    },
                })

                const encryptedEmail = orderWithCustomer?.customerInfo?.email
                const customerEmail = encryptedEmail
                    ? this.encryptionService.decrypt(encryptedEmail)
                    : null

                if (customerEmail) {
                    try {
                        await this.emailService.sendOrderPaymentFailedEmail({
                            to: customerEmail,
                            orderId: order.id,
                        })
                    } catch (error) {
                        console.error('Failed to send payment failed email:', error)
                    }
                }

            } else {
                return {
                    paymentIntentId: paymentIntent.id,
                    clientSecret: paymentIntent.client_secret,
                }
            }
        }

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: order.totalCents,
            currency: order.currency.toLowerCase(),
            payment_method_types: ['card'],
            metadata: {
                orderId: order.id,
            },
        })

        await this.prisma.paymentTransaction.create({
            data: {
                orderId: order.id,
                provider: PaymentProvider.STRIPE,
                type: PaymentTransactionType.PAYMENT,
                status: PaymentStatus.PENDING,
                amountCents: order.totalCents,
                currency: order.currency,
                providerPaymentId: paymentIntent.id,
            },
        })

        return {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
        }
    }


    async handleStripeWebhook(
        rawBody: Buffer,
        signature: string,
    ) {
        let event: any
        const webHookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')

        try {
            event = this.stripe.webhooks.constructEvent(
                rawBody,
                signature,
                webHookSecret!,
            )
        } catch {
            throw new BadRequestException(
                'Invalid Stripe webhook signature',
            )
        }

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as any
                const orderId = paymentIntent.metadata.orderId

                if (!orderId) {
                    console.error('Missing orderId in payment intent metadata')
                    break
                }

                console.log(`Payment succeeded for order ${orderId}`)

                await this.rabbitmqService.publishPaymentSucceeded({
                    orderId,
                    paymentIntentId: paymentIntent.id,
                })

                break
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as any

                const orderId = paymentIntent.metadata.orderId

                if (!orderId) {
                    console.error('Missing orderId in payment intent metadata')
                    break
                }

                console.log(`Payment attempt failed for order ${orderId}`)

                await this.prisma.paymentTransaction.updateMany({
                    where: {
                        providerPaymentId: paymentIntent.id,
                    },
                    data: {
                        status: PaymentStatus.FAILED,
                        errorCode: paymentIntent.last_payment_error?.code ?? null,
                        errorMessage: paymentIntent.last_payment_error?.message ?? null,
                    },
                })

                await this.rabbitmqService.publishPaymentFailed({
                    orderId,
                    paymentIntentId: paymentIntent.id,
                    errorCode: paymentIntent.last_payment_error?.code ?? null,
                    errorMessage: paymentIntent.last_payment_error?.message ?? null,
                })

                break
            }

            case 'charge.refunded': {
                const charge = event.data.object as any

                await this.handleChargeRefunded(charge)

                break
            }

            default: {
                console.log(`Unhandled Stripe event: ${event.type}`)
                break
            }
        }

        return { received: true }
    }


    async expirePayment(params: {
        orderId: string
        guestToken?: string
        userId?: string
    }) {
        const { orderId, guestToken, userId } = params

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        })

        if (!order) {
            throw new NotFoundException('Order not found')
        }

        const isOwner =
            (userId && order.userId === userId) ||
            (!order.userId &&
                guestToken &&
                order.guestToken === guestToken)

        if (!isOwner) {
            throw new ForbiddenException('Access denied')
        }


        if (order.status !== OrderStatus.PENDING_PAYMENT) {
            return {
                ok: true,
                message: 'Order is not pending payment',
                status: order.status,
            }
        }

        if (!order.paymentExpiresAt) {
            throw new BadRequestException('Payment expiration date is missing')
        }

        if (order.paymentExpiresAt > new Date()) {
            throw new BadRequestException('Payment has not expired yet')
        }

        await this.ordersService.expireOrderAndReleaseStock(orderId)

        return {
            ok: true,
            status: OrderStatus.PAYMENT_EXPIRED,
        }
    }


    async refundOrderPayment(
        orderId: string,
        paymentTransactionId: string,
    ) {
        const payment =
            await this.prisma.paymentTransaction.findUnique({
                where: {
                    id: paymentTransactionId,
                },
            })

        if (!payment) {
            throw new NotFoundException(
                'Payment transaction not found',
            )
        }

        if (payment.orderId !== orderId) {
            throw new BadRequestException(
                'Payment does not belong to order',
            )
        }

        if (!payment.providerPaymentId) {
            throw new BadRequestException(
                'Missing Stripe payment id',
            )
        }

        await this.stripe.refunds.create({
            payment_intent: payment.providerPaymentId,
        })
    }

    async handleChargeRefunded(charge: any) {
        const paymentIntentId =
            typeof charge.payment_intent === 'string'
                ? charge.payment_intent
                : charge.payment_intent?.id

        if (!paymentIntentId) {
            return
        }

        const payment = await this.prisma.paymentTransaction.findFirst({
            where: {
                providerPaymentId: paymentIntentId,
            },
            include: {
                order: {
                    include: {
                        items: true,
                    },
                },
            },
        })

        if (!payment) {
            return
        }

        await this.prisma.$transaction(async (tx) => {
            for (const item of payment.order.items) {
                if (!item.skuId) continue

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

            await tx.paymentTransaction.update({
                where: {
                    id: payment.id,
                },
                data: {
                    status: PaymentStatus.REFUNDED,
                },
            })

            await tx.order.update({
                where: {
                    id: payment.orderId,
                },
                data: {
                    status: OrderStatus.REFUNDED,
                    orderStatusHistory: {
                        create: {
                            status: OrderStatus.REFUNDED,
                            note: 'Refund confirmed by Stripe',
                        },
                    },
                },
            })
        })
    }
}