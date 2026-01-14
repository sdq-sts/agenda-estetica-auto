import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { tenant: true },
    });

    if (!user || !user.ativo || !user.tenant.ativo) {
      throw new UnauthorizedException('Usuário ou tenant inativo');
    }

    return {
      userId: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
    };
  }
}
