import { IsInt, IsOptional, IsString, Min, IsArray, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Gender, ShoeSurface } from '@prisma/client';

export enum ProductSortBy {
  PRICE = 'price',
  RATING = 'rating',
  CREATED_AT = 'createdAt',
  RELEVANCE = 'relevance',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ProductsQueryDto {
  //pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 12;

  //filtering
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  brand?: string[]; // brand slug

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  category?: string[]; // category slug

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceMax?: number;

  @IsOptional()
  @Transform(({ value }) => {
    const values = Array.isArray(value) ? value : [value];

    const normalized = new Set(values);

    if (normalized.has(Gender.MEN) || normalized.has(Gender.WOMEN)) {
      normalized.add(Gender.UNISEX);
    }

    return [...normalized];
  })

  @IsArray()
  @IsEnum(Gender, { each: true })
  gender?: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsEnum(ShoeSurface, { each: true })
  surface?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ratingAvgMin?: number;

  //sorting
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  //for searching
  @IsOptional()
  @IsString()
  query?: string;
}