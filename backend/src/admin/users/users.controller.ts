import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common'
import { AdminUsersService } from './users.service'
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards'
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/decorators/role'
import { Role } from '@prisma/client'
import { UpdateAdminUserRoleDto } from './dto/update.role.dto'

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll() {
    return this.adminUsersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id)
  }

  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserRoleDto,
  ) {
    return this.adminUsersService.updateRole(id, dto.role)
  }
}