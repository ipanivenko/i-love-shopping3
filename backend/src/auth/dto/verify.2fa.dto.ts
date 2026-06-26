import { IsString, Matches } from 'class-validator';

export class Verify2faDto {
  @IsString()
  @Matches(/^[A-Za-z0-9\-]+$/, { message: 'Invalid code format' })
  code!: string;
}
