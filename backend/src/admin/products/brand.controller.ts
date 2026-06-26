import { Body, Controller, Get, Post, UseGuards, Patch, Param } from '@nestjs/common'
import { Role } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards'
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/decorators/role'
import { AdminBrandsService } from './brand.service'
import { CreateAdminBrandDto } from './dto/create.brand.dto'

@Controller('admin/brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminBrandsController {
  constructor(private readonly brandsService: AdminBrandsService) { }

  @Get()
  findAll() {
    return this.brandsService.findAll()
  }

  @Post()
  create(@Body() dto: CreateAdminBrandDto) {
    return this.brandsService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateAdminBrandDto) {
    return this.brandsService.update(id, dto)
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.brandsService.archive(id)
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.brandsService.restore(id)
  }
}