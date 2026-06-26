import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ShippingMethodsService {
    constructor(private readonly prisma: PrismaService) {}

  async findActive() {
    const methods = await this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { priceCents: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        priceCents: true,
        currency: true,
        estimatedDaysMin: true,
        estimatedDaysMax: true,
      },
    })

    return { methods }
  }
}
