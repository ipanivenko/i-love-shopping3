import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { CreateAdminBrandDto } from './dto/create.brand.dto'

@Injectable()
export class AdminBrandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async create(dto: CreateAdminBrandDto) {
    const slug = dto.slug ?? this.generateSlug(dto.name)

    const existing = await this.prisma.brand.findFirst({
      where: {
        OR: [{ name: dto.name }, { slug }],
      },
    })

    if (existing) {
      throw new BadRequestException('Brand already exists')
    }

    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
      },
    })
  }

  async update(id: string, dto: CreateAdminBrandDto) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    })

    if (!brand) {
      throw new NotFoundException('Brand not found')
    }

    const slug = dto.slug ?? this.generateSlug(dto.name)

    const existing = await this.prisma.brand.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: dto.name }, { slug }],
      },
    })

    if (existing) {
      throw new BadRequestException('Brand already exists')
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
      },
    })
  }

  async archive(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    })

    if (!brand) {
      throw new NotFoundException('Brand not found')
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
      },
    })
  }

  async restore(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    })

    if (!brand) {
      throw new NotFoundException('Brand not found')
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    })
  }

  private generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}