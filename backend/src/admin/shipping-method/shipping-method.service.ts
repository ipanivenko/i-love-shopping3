import { Injectable } from '@nestjs/common';
import { PrismaService  } from 'prisma/prisma.service';
import { CreateShippingMethodDto } from './dto/createMethodDto';
import { UpdateShippingMethodDto } from './dto/updateMethodDto';

@Injectable()
export class ShippingMethodService {
    constructor(private readonly prisma: PrismaService) {}

  findActive() {
    return this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { priceCents: 'asc' },
    })
  }

  findAll() {
    return this.prisma.shippingMethod.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  create(dto: CreateShippingMethodDto) {
    return this.prisma.shippingMethod.create({
      data: dto,
    })
  }

  update(id: string, dto: UpdateShippingMethodDto) {
    return this.prisma.shippingMethod.update({
      where: { id },
      data: dto,
    })
  }

  async delete(id: string) {
  const usedByOrder = await this.prisma.orderShippingMethod.findFirst({
    where: { shippingMethodId: id },
    select: { id: true },
  })

  if (usedByOrder) {
    return this.prisma.shippingMethod.update({
      where: { id },
      data: { isActive: false },
    })
  }

  return this.prisma.shippingMethod.delete({
    where: { id },
  })
}
}
