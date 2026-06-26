import { IsString, Length, Matches } from 'class-validator'

export class ValidateAddressDto {
  @IsString()
  @Length(5, 120)
  address: string

  @IsString()
  @Length(2, 80)
  city: string

  @IsString()
  @Matches(/^\d{4,6}$/)
  postcode: string

  @IsString()
  @Length(2, 80)
  country: string
}