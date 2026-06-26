import { PartialType } from '@nestjs/mapped-types'
import { CreateShippingMethodDto } from './createMethodDto'

export class UpdateShippingMethodDto extends PartialType(CreateShippingMethodDto) {}