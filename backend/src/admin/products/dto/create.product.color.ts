import { IsHexColor, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateProductColorDto {
  @IsString()
  @IsNotEmpty()
  colorName: string

  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsHexColor()
  colorHex?: string
}