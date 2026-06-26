import { Controller } from '@nestjs/common';
import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards'
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/decorators/role'
import { Role } from '@prisma/client'
import { CreateShippingMethodDto } from './dto/createMethodDto';
import { UpdateShippingMethodDto } from './dto/updateMethodDto';
import { ShippingMethodService } from './shipping-method.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/shipping-methods')
export class ShippingMethodController {
    constructor(private readonly service: ShippingMethodService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Post()
  create(@Body() dto: CreateShippingMethodDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShippingMethodDto,
  ) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id)
  }
}
