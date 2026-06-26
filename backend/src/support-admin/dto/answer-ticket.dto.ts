import { IsString, MinLength } from 'class-validator'

export class AnswerSupportTicketDto {
  @IsString()
  @MinLength(2)
  answer: string
}