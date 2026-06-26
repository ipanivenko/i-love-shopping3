import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'

import {
  Gender,
  ProductStatus,
  ShoeSurface,
} from '@prisma/client'

export class CreateAdminProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsInt()
  @Min(0)
  priceCents: number

  @IsString()
  @IsOptional()
  currency?: string

  @IsString()
  @IsNotEmpty()
  categoryId: string

  @IsString()
  @IsNotEmpty()
  brandId: string

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender

  @IsEnum(ShoeSurface)
  @IsOptional()
  surface?: ShoeSurface

  @IsInt()
  @Min(0)
  @IsOptional()
  weightGrams?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  weightOunces?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  lengthMm?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  widthMm?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  heightMm?: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  lengthIn?: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  widthIn?: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  heightIn?: number
}