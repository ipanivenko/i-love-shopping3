import { IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Transform } from 'class-transformer'

export class UploadProductColorImageDto {
  @IsOptional()
  @IsString()
  alt?: string

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  sortOrder: number
}