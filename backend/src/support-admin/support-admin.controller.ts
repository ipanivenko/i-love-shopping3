import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import { SupportAdminService } from './support-admin.service'
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards'
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/decorators/role'
import { AnswerSupportTicketDto } from './dto/answer-ticket.dto'

@Controller('support-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPPORT')
export class SupportAdminController {
    constructor(private readonly supportService: SupportAdminService) { }

    @Get('tickets')
    findAllTickets() {
        return this.supportService.findAllTickets()
    }

    @Get('tickets/:id')
    findTicketById(@Param('id') ticketId: string) {
        return this.supportService.findTicketById(ticketId)
    }

    @Patch('tickets/:id/answer')
    answerTicket(
        @Param('id') ticketId: string,
        @Body() dto: AnswerSupportTicketDto,
    ) {
        return this.supportService.answerTicket(ticketId, dto)
    }

    @Patch('tickets/:id/close')
    closeTicket(@Param('id') ticketId: string) {
        return this.supportService.closeTicket(ticketId)
    }

    @Patch('tickets/:id/reopen')
    reopenTicket(@Param('id') ticketId: string) {
        return this.supportService.reopenTicket(ticketId)
    }

    @Post('tickets/:id/add-to-faq')
    addTicketToFaq(
        @Param('id') ticketId: string,
    ) {
        return this.supportService.addTicketToFaq(ticketId)
    }
}