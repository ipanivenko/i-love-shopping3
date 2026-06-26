import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

import { OrderStatus } from '@prisma/client'

export class RejectCancellationDto {
  @IsEnum(OrderStatus)

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string
}