import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import { Role } from '@prisma/client'

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: this.userSelect(),
    })
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect(),
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async updateRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        twoFactorConfirmedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (
      (role === Role.ADMIN || role === Role.SUPPORT) &&
      !user.twoFactorConfirmedAt
    ) {
      throw new BadRequestException(
        'This user must enable 2FA before becoming admin or support',
      )
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: this.userSelect(),
    })
  }

  private userSelect() {
    return {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      isVerified: true,
      twoFactorConfirmedAt: true,
      createdAt: true,
      updatedAt: true,

      fullName: true,
      phone: true,
      address: true,
      city: true,
      postcode: true,
      country: true,

      _count: {
        select: {
          orders: true,
          reviews: true,
          sessions: true,
        },
      },
    }
  }
}