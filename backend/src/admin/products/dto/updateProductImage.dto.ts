import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class UpdateProductColorImageDto {
  @IsOptional()
  @IsString()
  alt?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number
}