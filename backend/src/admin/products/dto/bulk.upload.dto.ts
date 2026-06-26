import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { Gender, ProductStatus, ShoeSurface } from '@prisma/client'

export class BulkProductImageDto {
  @IsString()
  @IsNotEmpty()
  filename: string

  @IsString()
  @IsOptional()
  altText?: string

  @IsInt()
  @Min(1)
  sortOrder: number
}

export class BulkProductItemDto {
  @IsString()
  @IsNotEmpty()
  sizeEU: string

  @IsString()
  @IsOptional()
  sizeUS?: string

  @IsString()
  @IsOptional()
  sizeUK?: string

  @IsString()
  @IsOptional()
  barcode?: string

  @IsInt()
  @Min(0)
  stockQty: number
}

export class BulkProductColorDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  hexCode?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkProductImageDto)
  images: BulkProductImageDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkProductItemDto)
  items: BulkProductItemDto[]
}

export class BulkUploadProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  slug?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsInt()
  @Min(0)
  priceCents: number

  @IsString()
  @IsNotEmpty()
  currency: string

  @IsString()
  @IsNotEmpty()
  category: string

  @IsString()
  @IsNotEmpty()
  brand: string

  @IsEnum(ProductStatus)
  status: ProductStatus

  @IsEnum(Gender)
  gender: Gender

  @IsEnum(ShoeSurface)
  surface: ShoeSurface

  @IsNumber()
  @IsOptional()
  weightGrams?: number

  @IsNumber()
  @IsOptional()
  weightOunces?: number

  @IsNumber()
  @IsOptional()
  lengthMm?: number

  @IsNumber()
  @IsOptional()
  widthMm?: number

  @IsNumber()
  @IsOptional()
  heightMm?: number

  @IsNumber()
  @IsOptional()
  lengthIn?: number

  @IsNumber()
  @IsOptional()
  widthIn?: number

  @IsNumber()
  @IsOptional()
  heightIn?: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkProductColorDto)
  colors: BulkProductColorDto[]
}