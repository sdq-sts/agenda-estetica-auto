import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, user.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.ativo || !user.tenant.ativo) {
      throw new UnauthorizedException('Usuário ou tenant inativo');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
        tenant: {
          id: user.tenant.id,
          nome: user.tenant.nome,
          slug: user.tenant.slug,
          plano: user.tenant.plano,
        },
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });
  }
}
