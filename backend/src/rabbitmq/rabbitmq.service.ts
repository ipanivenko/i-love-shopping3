import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import * as amqp from 'amqplib'
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib'

export type PaymentSucceededMessage = {
  orderId: string
  paymentIntentId: string
}

export type PaymentFailedMessage = {
  orderId: string
  paymentIntentId: string
  errorCode?: string | null
  errorMessage?: string | null
}

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel
  private channel: Channel

  private readonly paymentSucceededQueue = 'payment.succeeded'
  private readonly paymentFailedQueue = 'payment.failed'

  async onModuleInit() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL!)
    this.channel = await this.connection.createChannel()

    await this.channel.assertQueue(this.paymentSucceededQueue, {
      durable: true,
    })

    await this.channel.assertQueue(this.paymentFailedQueue, {
      durable: true,
    })
  }

  async publishPaymentSucceeded(data: PaymentSucceededMessage) {
    this.publish(this.paymentSucceededQueue, data)
  }

  async publishPaymentFailed(data: PaymentFailedMessage) {
    this.publish(this.paymentFailedQueue, data)
  }

  async consumePaymentSucceeded(
    handler: (data: PaymentSucceededMessage) => Promise<void>,
  ) {
    await this.consume(this.paymentSucceededQueue, handler)
  }

  async consumePaymentFailed(
    handler: (data: PaymentFailedMessage) => Promise<void>,
  ) {
    await this.consume(this.paymentFailedQueue, handler)
  }

  async publish(queue: string, message: unknown) {
    await this.channel.assertQueue(queue, {
      durable: true,
    })

    this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
      },
    )
  }

  async consume<T>(
    queue: string,
    handler: (data: T) => Promise<void>,
  ) {
    await this.channel.assertQueue(queue, {
      durable: true,
    })

    await this.channel.consume(queue, async (msg: ConsumeMessage | null) => {
      if (!msg) return

      try {
        const data = JSON.parse(msg.content.toString()) as T

        await handler(data)

        this.channel.ack(msg)
      } catch (error) {
        console.error(`Failed to process ${queue} message:`, error)

        this.channel.nack(msg, false, false)
      }
    })
  }


  async onModuleDestroy() {
    await this.channel?.close()
    await this.connection?.close()
  }

  
}