import { Controller, Get, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from 'src/decorators/role'
import { Role } from '@prisma/client'

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getDashboard() {
    return this.adminService.getDashboard()
  }
}