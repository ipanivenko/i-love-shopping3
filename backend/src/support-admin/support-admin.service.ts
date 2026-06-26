import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import { SupportTicketStatus } from '@prisma/client'
import { AnswerSupportTicketDto } from './dto/answer-ticket.dto'

@Injectable()
export class SupportAdminService {
    constructor(private readonly prisma: PrismaService) { }

    findAllTickets() {
        return this.prisma.supportTicket.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        })
    }

    async findTicketById(ticketId: string) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: {
                id: ticketId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        })

        if (!ticket) {
            throw new NotFoundException('Support ticket not found')
        }

        return ticket
    }

    async answerTicket(ticketId: string, dto: AnswerSupportTicketDto) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: {
                id: ticketId,
            },
        })

        if (!ticket) {
            throw new NotFoundException('Support ticket not found')
        }

        if (ticket.status === SupportTicketStatus.CLOSED) {
            throw new BadRequestException('Cannot answer a closed ticket')
        }

        return this.prisma.supportTicket.update({
            where: {
                id: ticketId,
            },
            data: {
                answer: dto.answer,
                status: SupportTicketStatus.ANSWERED,
            },
        })
    }

    async closeTicket(ticketId: string) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: {
                id: ticketId,
            },
        })

        if (!ticket) {
            throw new NotFoundException('Support ticket not found')
        }

        return this.prisma.supportTicket.update({
            where: {
                id: ticketId,
            },
            data: {
                status: SupportTicketStatus.CLOSED,
            },
        })
    }

    async reopenTicket(ticketId: string) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: {
                id: ticketId,
            },
        })

        if (!ticket) {
            throw new NotFoundException('Support ticket not found')
        }

        return this.prisma.supportTicket.update({
            where: {
                id: ticketId,
            },
            data: {
                status: ticket.answer
                    ? SupportTicketStatus.ANSWERED
                    : SupportTicketStatus.OPEN,
            },
        })
    }

    async addTicketToFaq(ticketId: string) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: {
                id: ticketId,
            },
        })

        if (!ticket) {
            throw new NotFoundException('Support ticket not found')
        }

        if (!ticket.answer) {
            throw new BadRequestException(
                'This ticket cannot be added to FAQ because it has no answer yet',
            )
        }

        const question = ticket.message.trim()
        const answer = ticket.answer.trim()

        const existingFaq = await this.prisma.faq.findUnique({
            where: {
                question,
            },
        })

        if (existingFaq) {
            throw new ConflictException('This question already exists in FAQ')
        }

        return this.prisma.faq.create({
            data: {
                question,
                answer,
                isActive: true,
            },
        })
    }
}