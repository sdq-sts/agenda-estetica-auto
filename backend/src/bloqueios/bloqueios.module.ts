import { Module } from '@nestjs/common';
import { BloqueiosController } from './bloqueios.controller';
import { BloqueiosService } from './bloqueios.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BloqueiosController],
  providers: [BloqueiosService],
  exports: [BloqueiosService],
})
export class BloqueiosModule {}
