import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateSupportTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  subject: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  message: string
}