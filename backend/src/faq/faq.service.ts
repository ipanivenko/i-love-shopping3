import { Injectable } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.faq.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        question: true,
        answer: true,
        createdAt: true,
      },
    })
  }
}