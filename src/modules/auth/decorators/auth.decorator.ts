import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ROLES_KEY } from './roles.decorator';

export function Auth(...roles: string[]) {
  // Nếu không có roles được truyền vào, chỉ sử dụng JwtAuthGuard
  if (roles.length === 0) {
    return UseGuards(JwtAuthGuard);
  }
  
  // Nếu có roles, sử dụng cả JwtAuthGuard và RolesGuard
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthGuard, RolesGuard)
  );
}
