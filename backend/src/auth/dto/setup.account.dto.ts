import { IsOptional, IsString, MinLength } from 'class-validator';

export class SetupAccountDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  confirmPassword?: string;
}