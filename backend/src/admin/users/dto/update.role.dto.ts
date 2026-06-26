import { IsEnum } from 'class-validator'
import { Role } from '@prisma/client'

export class UpdateAdminUserRoleDto {
  @IsEnum(Role)
  role: Role
}