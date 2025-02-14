import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // console.log('\n=== RolesGuard Check ===');
    
    // Get metadata from both handler and class
    const handlerRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const classRoles = this.reflector.get<string[]>(ROLES_KEY, context.getClass());
    // console.log('Handler roles:', handlerRoles);
    // console.log('Class roles:', classRoles);
    
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // console.log('Combined required roles:', requiredRoles);
    
    if (!requiredRoles) {
      console.log('No roles required, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // console.log('\nRequest JWT payload:', request.user);
    
    // Kiểm tra user và role có tồn tại không
    if (!request.user) {
      // console.log('Error: User is missing in request');
      return false;
    }

    if (!request.user.role) {
      // console.log('Error: Role is missing in user object:', request.user);
      return false;
    }

    const hasRole = requiredRoles.includes(request.user.role);
    // console.log(`\nRole check: "${request.user.role}" in [${requiredRoles}] = ${hasRole}`);
    return hasRole;
  }
}
