import { IsInt, IsNotEmpty, IsNumberString, IsOptional, IsString, Min } from 'class-validator'

export class CreateProductSkuDto {
  @IsNumberString()
  sizeEU: string

  @IsOptional()
  @IsNumberString()
  sizeUS?: string

  @IsOptional()
  @IsNumberString()
  sizeUK?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  barcode?: string

  @IsInt()
  @Min(1)
  stockQty: number
}