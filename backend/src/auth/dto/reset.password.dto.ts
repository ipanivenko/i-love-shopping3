import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator'

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    rid: string;

    @IsNotEmpty()
    @IsString()
    token: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, {message: 'Password must be at least 8 characters long'})
    newPassword: string;
}