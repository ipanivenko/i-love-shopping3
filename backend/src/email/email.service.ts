import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  private readonly resend: Resend
  private readonly from: string

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.MAIL_FROM

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is missing')
    }

    if (!from) {
      throw new Error('MAIL_FROM is missing')
    }

    this.resend = new Resend(apiKey)
    this.from = from
  }

  async sendPasswordResetEmail(to: string, link: string) {
    return this.sendEmail({
      to,
      subject: 'Reset your password',
      html: `
        <p>MoveOn online shop requested a password reset for your account.</p>
        <p><a href="${link}"> Click here to reset your password</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    })
  }

  async sendOrderPaidEmail(params: {
    to: string
    orderId: string
    totalCents: number
    subtotalCents: number
    shippingCents: number
    buyerProtectionCents?: number
    paymentBrand?: string
    paymentLast4?: string
    paidAt?: Date
    items: {
      name: string
      quantity: number
      priceCents: number
    }[]
  }) {
    const total = (params.totalCents / 100).toFixed(2)
    const subtotal = (params.subtotalCents / 100).toFixed(2)
    const shipping = (params.shippingCents / 100).toFixed(2)

    const itemsHtml = params.items
      .map((item) => {
        const itemTotal = ((item.priceCents * item.quantity) / 100).toFixed(2)

        return `
        <tr>
          <td style="padding: 8px 0; color: #5f6b6b;">
            ${item.name} × ${item.quantity}
          </td>
          <td style="padding: 8px 0; text-align: right; color: #5f6b6b;">
            €${itemTotal}
          </td>
        </tr>
      `
      })
      .join('')

    return this.sendEmail({
      to: params.to,
      subject: 'Your MoveOn order is confirmed',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 680px;">
        <h2 style="margin-bottom: 24px;">Order confirmation</h2>

        <hr style="border: none; border-top: 1px solid #ddd;" />

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 16px 0; font-weight: bold;">Order</td>
            <td style="padding: 16px 0; text-align: right;">
              Order #${params.orderId}
            </td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #ddd;" />

        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}

          <tr>
            <td style="padding: 8px 0; color: #5f6b6b;">Subtotal</td>
            <td style="padding: 8px 0; text-align: right; color: #5f6b6b;">
              €${subtotal}
            </td>
          </tr>

          <tr>
            <td style="padding: 8px 0; color: #5f6b6b;">Postage</td>
            <td style="padding: 8px 0; text-align: right; color: #5f6b6b;">
              €${shipping}
            </td>
          </tr>

          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Paid</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">
              €${total}
            </td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #ddd;" />

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 16px 0; font-weight: bold;">Payment method</td>
            <td style="padding: 16px 0; text-align: right;">
              ${params.paymentBrand ?? 'Card'}
            </td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #ddd;" />

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 16px 0; font-weight: bold;">Payment date</td>
            <td style="padding: 16px 0; text-align: right;">
              ${params.paidAt
          ? params.paidAt.toLocaleString('en-GB')
          : new Date().toLocaleString('en-GB')
        }
            </td>
          </tr>
        </table>

        <p style="margin-top: 24px;">
          We will start preparing your order shortly.
        </p>
      </div>
    `,
    })
  }

  async sendOrderPaymentFailedEmail(params: {
    to: string
    orderId: string
  }) {
    return this.sendEmail({
      to: params.to,
      subject: `Payment failed for your MoveOn order`,
      html: `
        <p>Your payment could not be completed.</p>
        <p><strong>Order ID:</strong> ${params.orderId}</p>
        <p>You can return to your order and try again if the payment window is still open.</p>
      `,
    })
  }

  private async sendEmail(params: {
    to: string
    subject: string
    html: string
  }) {
    try {
      return await this.resend.emails.send({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      })
    } catch (error) {
      console.error('Email sending failed:', error)
      throw new InternalServerErrorException('Failed to send email')
    }
  }

  async sendOrderCancellationRequestedEmail({
    to,
    orderId,
  }: {
    to: string
    orderId: string
  }) {
    await this.sendEmail({
      to,
      subject: `We've received your cancellation request – Order ${orderId}`,
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827; margin-bottom: 24px;">
          Cancellation Request Received
        </h2>

        <p>
          Hello,
        </p>

        <p>
          We have successfully received your request to cancel order
          <strong>${orderId}</strong>.
        </p>

        <p>
          Our team will review your request and, if applicable, process your refund using the original payment method. You will receive another email once the cancellation has been completed.
        </p>

        <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0;">
          <strong>Order reference:</strong> ${orderId}
        </div>

        <p>
          If you have any questions or need further assistance, please don't hesitate to contact our customer support team.
        </p>

        <p>
          Thank you for shopping with us.
        </p>

        <p style="margin-top: 32px;">
          Kind regards,<br />
          <strong>The MoveOn Team</strong>
        </p>
      </div>
    `,
    })
  }

  async sendOrderCancellationApprovedEmail({
    to,
    orderId,
  }: {
    to: string
    orderId: string
  }) {
    await this.sendEmail({
      to,
      subject: `Your order ${orderId} has been cancelled`,
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; line-height: 1.6;">
        
        <div style="text-align: center; padding: 32px 24px;">
          <div style="font-size: 48px;">💸</div>

          <h1 style="margin: 16px 0 8px; color: #111827;">
            Your order has been cancelled
          </h1>

          <p style="margin: 0; color: #6b7280; font-size: 16px;">
            We've successfully processed your cancellation request.
          </p>
        </div>

        <div style="background: #f9fafb; border-radius: 12px; padding: 24px;">
          <p style="margin-top: 0;">
            This email confirms that order
            <strong>${orderId}</strong> has been cancelled.
          </p>

          <p>
            Your refund has been initiated and the payment will be returned to
            the original payment method used during checkout.
          </p>

          <p style="margin-bottom: 0;">
            Depending on your bank or card issuer, the refunded amount may take
            <strong>3–10 business days</strong> to appear in your account.
          </p>
        </div>

        <div style="padding: 24px 0;">
          <p>
            If you do not see the refund after this period, please contact our
            customer support team and we'll be happy to assist you.
          </p>

          <p>
            Thank you for shopping with us. We hope to serve you again soon.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb;" />

        <div style="padding-top: 16px; color: #6b7280; font-size: 13px; text-align: center;">
          <p style="margin: 0;">
            This is an automated message regarding your order.
          </p>

          <p style="margin: 8px 0 0;">
            © MoveOn
          </p>
        </div>
      </div>
    `,
    })
  }
}