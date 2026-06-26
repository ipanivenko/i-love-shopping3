import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'

export class CreateShippingMethodDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  code: string

  @IsString()
  @IsOptional()
  description?: string

  @IsInt()
  @Min(0)
  priceCents: number

  @IsString()
  @IsOptional()
  currency?: string

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedDaysMin?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedDaysMax?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}