import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { CreateAdminCategoryDto } from './dto/create.category.dto'

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) { }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })
  }

  async create(dto: CreateAdminCategoryDto) {
    const slug = dto.slug ?? this.generateSlug(dto.name)

    const existing = await this.prisma.category.findUnique({
      where: { slug },
    })

    if (existing) {
      throw new BadRequestException('Category slug already exists')
    }

    await this.validateParent(dto.parentId)

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        parentId: dto.parentId,
      },
    })
  }

  async update(id: string, dto: CreateAdminCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    const slug = dto.slug ?? this.generateSlug(dto.name)

    const existing = await this.prisma.category.findFirst({
      where: {
        id: { not: id },
        slug,
      },
    })

    if (existing) {
      throw new BadRequestException('Category slug already exists')
    }

    if (dto.parentId === id) {
      throw new BadRequestException('Category cannot be its own parent')
    }

    await this.validateParent(dto.parentId)

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
        parentId: dto.parentId,
      },
    })
  }

  async archive(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
      },
    })
  }

  async restore(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    })
  }

  private async validateParent(parentId?: string) {
    if (!parentId) return

    const parent = await this.prisma.category.findUnique({
      where: { id: parentId },
    })

    if (!parent) {
      throw new BadRequestException('Parent category not found')
    }
  }

  private generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}