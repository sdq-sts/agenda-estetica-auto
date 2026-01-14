import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { ServicosModule } from './servicos/servicos.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';
import { ConfiguracoesModule } from './configuracoes/configuracoes.module';
import { BloqueiosModule } from './bloqueios/bloqueios.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ClientesModule,
    VeiculosModule,
    ServicosModule,
    AgendamentosModule,
    ConfiguracoesModule,
    BloqueiosModule,
    WhatsAppModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
