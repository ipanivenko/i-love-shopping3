import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import { CreateSupportTicketDto } from './dto/create.question.dto'

type AuthUser = {
  id: string
  email: string
  name?: string | null
} | null

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(dto: CreateSupportTicketDto, user: AuthUser) {
    return this.prisma.supportTicket.create({
      data: {
        userId: user?.id ?? null,
        name: user?.name ?? dto.name,
        email: user?.email ?? dto.email,
        subject: dto.subject,
        message: dto.message,
      },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        answer: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findMyTickets(user: AuthUser, email?: string) {
    if (!user && !email) {
      throw new ForbiddenException('Email is required for guest users.')
    }

    return this.prisma.supportTicket.findMany({
      where: user
        ? {
            OR: [{ userId: user.id }, { email: user.email }],
          }
        : {
            email,
          },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        subject: true,
        message: true,
        answer: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }
}