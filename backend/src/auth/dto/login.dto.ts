import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
