import { PartialType } from '@nestjs/mapped-types'
import { CreateProductColorDto } from './create.product.color'

export class UpdateProductColorDto extends PartialType(CreateProductColorDto) {}