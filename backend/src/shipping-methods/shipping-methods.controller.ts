import { Controller, Get } from '@nestjs/common';
import { ShippingMethodsService } from './shipping-methods.service';

@Controller('shipping-methods')
export class ShippingMethodsController {
  constructor(private readonly shippingMethodsService: ShippingMethodsService) { }
  @Get()
  findActive() {
    return this.shippingMethodsService.findActive()
  }
}
