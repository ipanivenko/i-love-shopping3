import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { OptionalJwtAuthGuard } from 'src/auth/jwt.auth-guards.optional'
import { SupportService } from './support.service'
import { CreateSupportTicketDto } from './dto/create.question.dto'

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @UseGuards(OptionalJwtAuthGuard)
  createTicket(@Body() dto: CreateSupportTicketDto, @Req() req: any) {
    return this.supportService.createTicket(dto, req.user)
  }

  @Get('tickets/my')
  @UseGuards(OptionalJwtAuthGuard)
  findMyTickets(@Req() req: any, @Query('email') email?: string) {
    return this.supportService.findMyTickets(req.user, email)
  }
}