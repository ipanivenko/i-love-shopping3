import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAdminCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsOptional()
  slug?: string

  @IsString()
  @IsOptional()
  parentId?: string
}