import { PartialType } from '@nestjs/mapped-types'
import { CreateAdminProductDto } from './create.product'

export class UpdateAdminProductDto extends PartialType(CreateAdminProductDto) {}