import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

class GuestRecommendationItemDto {
  @IsString()
  skuId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class GuestRecommendationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestRecommendationItemDto)
  items: GuestRecommendationItemDto[];
}