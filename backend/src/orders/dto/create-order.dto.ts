import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

class OrderCustomerInfoDto {
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string
}

class OrderShippingAddressDto {
  @IsString()
  @MaxLength(100)
  fullName: string


  @IsString()
  @MaxLength(30)
  phone?: string

  @IsString()
  @MaxLength(150)
  address: string

  @IsString()
  @MaxLength(80)
  city: string

  @IsString()
  @MaxLength(20)
  postcode: string

  @IsString()
  @MaxLength(80)
  country: string
}

class OrderItemDto {
  @IsString()
  skuId: string

  @IsInt()
  @Min(1)
  quantity: number
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => OrderCustomerInfoDto)
  customerInfo: OrderCustomerInfoDto

  @ValidateNested()
  @Type(() => OrderShippingAddressDto)
  shippingAddress: OrderShippingAddressDto

  @IsString()
  shippingMethodId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]
}