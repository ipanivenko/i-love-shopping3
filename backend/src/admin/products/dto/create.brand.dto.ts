import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAdminBrandDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsOptional()
  slug?: string
}