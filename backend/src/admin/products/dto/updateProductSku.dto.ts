import { IsInt, IsNotEmpty, IsNumberString, IsOptional, IsString, Min } from 'class-validator'

export class UpdateProductSkuDto {
  @IsOptional()
  @IsNumberString()
  sizeEU?: string

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

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQty?: number
}