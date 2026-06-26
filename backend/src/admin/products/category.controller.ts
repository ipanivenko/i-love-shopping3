import { Body, Controller, Get, Post, UseGuards, Patch, Param } from '@nestjs/common'
import { Role } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards'
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/decorators/role'
import { AdminCategoriesService } from './category.service'
import { CreateAdminCategoryDto } from './dto/create.category.dto'

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminCategoriesController {
  constructor(private readonly categoriesService: AdminCategoriesService) { }

  @Get()
  findAll() {
    return this.categoriesService.findAll()
  }

  @Post()
  create(@Body() dto: CreateAdminCategoryDto) {
    return this.categoriesService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateAdminCategoryDto) {
    return this.categoriesService.update(id, dto)
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.categoriesService.archive(id)
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.categoriesService.restore(id)
  }
}