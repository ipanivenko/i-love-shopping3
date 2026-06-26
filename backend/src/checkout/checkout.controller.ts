import { Body, Controller, Get, Patch, UseGuards, Post } from '@nestjs/common'
import { CheckoutService } from './checkout.service';
import { CurrentUser } from 'src/decorators/current.user';
import { UpdateCheckoutProfileDto } from './dto/update-checkout-profile.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards';
import { ValidateAddressDto } from './dto/validate-address.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) { }
  @UseGuards(JwtAuthGuard)
  @Get('prefill')
  getPrefill(@CurrentUser('id') userId: string) {
    return this.checkoutService.getPrefill(userId)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCheckoutProfileDto,
  ) {
    return this.checkoutService.updateProfile(userId, dto)
  }

  @Post('validate-address')
  validateAddress(@Body() dto: ValidateAddressDto) {
    return this.checkoutService.validateAddress(dto)
  }
}
