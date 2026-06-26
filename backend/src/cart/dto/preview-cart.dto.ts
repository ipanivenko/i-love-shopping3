import { IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PreviewCartItemDto {
  @IsString()
  @IsNotEmpty()
  skuId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class PreviewCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviewCartItemDto)
  items: PreviewCartItemDto[];
}