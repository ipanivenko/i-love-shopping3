import { Controller, Param, Post, UseGuards, Headers, Req, Body } from '@nestjs/common'
import { CurrentUser } from 'src/decorators/current.user'
import { PaymentsService } from './payments.service'
import { Request } from 'express'
import { OptionalJwtAuthGuard } from 'src/auth/jwt.auth-guards.optional'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('orders/:orderId/payment-intent')
  @UseGuards(OptionalJwtAuthGuard)
  createPaymentIntent(
    @Param('orderId') orderId: string,
    @Body('guestToken') guestToken?: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.paymentsService.createStripePaymentIntent(
      orderId, 
      userId, 
      guestToken
    )}


  @Post('webhook')
  handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    console.log('WEBHOOK HIT')
    return this.paymentsService.handleStripeWebhook(req.body, signature)
  }

  @Post('orders/:orderId/expire')
  @UseGuards(OptionalJwtAuthGuard)
async expirePayment(
  @Param('orderId') orderId: string,
  @Body('guestToken') guestToken?: string,
  @CurrentUser('id') userId?: string,
) {
  console.log('Expire endpoint hit')
  console.log('Order:', orderId)
  console.log('Guest token:', guestToken)
  console.log('userId', userId)
  return this.paymentsService.expirePayment({
    orderId,
    guestToken,
    userId,
  })
}
}
