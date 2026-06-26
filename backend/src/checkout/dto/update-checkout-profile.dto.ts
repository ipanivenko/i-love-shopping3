import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateCheckoutProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string

  @IsOptional()
  @IsString()
  @MaxLength(150)
  address?: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postcode?: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string
}