import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator'

export class RegisterDto {
    @IsNotEmpty()
    @IsEmail({}, { message: 'Please provide a valid email' })
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsNotEmpty()
    @IsString()
    confirmPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    name: string;

    @IsNotEmpty()
    @IsString()
    captchaToken: string;
}