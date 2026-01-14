import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Se não tem usuário, deixar passar (AuthGuard vai bloquear)
    if (!request.user) {
      return true;
    }

    // Injetar tenantId no request para uso nos services
    request.tenantId = request.user.tenantId;

    return true;
  }
}
