import { IsNotEmpty, IsString, Matches, isNotEmpty } from 'class-validator';

export class Disable2faDto {
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code!: string;
}
