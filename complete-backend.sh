#!/bin/bash

cd backend

# Create Agendamentos Service
cat > src/agendamentos/agendamentos.service.ts << 'EOF'
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AgendamentosService {
  constructor(private prisma: PrismaService) {}

  async create(createAgendamentoDto: CreateAgendamentoDto) {
    const { clienteId, veiculoId, dataHora, servicos, observacoes } =
      createAgendamentoDto;

    // Validate cliente exists
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Validate veiculo exists and belongs to cliente
    if (veiculoId) {
      const veiculo = await this.prisma.veiculo.findUnique({
        where: { id: veiculoId },
      });
      if (!veiculo) {
        throw new NotFoundException('Veículo não encontrado');
      }
      if (veiculo.clienteId !== clienteId) {
        throw new BadRequestException('Veículo não pertence ao cliente');
      }
    }

    // Validate all servicos exist
    for (const s of servicos) {
      const servico = await this.prisma.servico.findUnique({
        where: { id: s.servicoId },
      });
      if (!servico) {
        throw new NotFoundException(
          `Serviço com ID ${s.servicoId} não encontrado`,
        );
      }
      if (!servico.ativo) {
        throw new BadRequestException(`Serviço ${servico.nome} está inativo`);
      }
    }

    // Check for conflicts
    const dataHoraDate = new Date(dataHora);
    if (dataHoraDate < new Date()) {
      throw new BadRequestException('Data/hora deve ser futura');
    }

    // Calculate total duration
    const servicoIds = servicos.map((s) => s.servicoId);
    const servicosData = await this.prisma.servico.findMany({
      where: { id: { in: servicoIds } },
    });
    const duracaoTotal = servicosData.reduce(
      (sum, s) => sum + s.duracaoMinutos,
      0,
    );

    // Check for time conflicts
    const endTime = new Date(
      dataHoraDate.getTime() + duracaoTotal * 60 * 1000,
    );
    const conflictingAgendamento = await this.prisma.agendamento.findFirst({
      where: {
        dataHora: {
          gte: dataHoraDate,
          lt: endTime,
        },
        status: {
          notIn: ['CANCELADO', 'NAO_COMPARECEU'],
        },
      },
    });

    if (conflictingAgendamento) {
      throw new BadRequestException('Já existe um agendamento neste horário');
    }

    // Calculate valor total
    const valorTotal = servicos.reduce((sum, s) => sum + s.preco, 0);

    // Create agendamento
    const agendamento = await this.prisma.agendamento.create({
      data: {
        dataHora: dataHoraDate,
        clienteId,
        veiculoId,
        observacoes,
        valorTotal,
        servicos: {
          create: servicos.map((s) => ({
            servicoId: s.servicoId,
            preco: s.preco,
          })),
        },
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            telefone: true,
          },
        },
        veiculo: true,
        servicos: {
          include: {
            servico: true,
          },
        },
      },
    });

    return agendamento;
  }

  async findAll(
    paginationDto: PaginationDto,
    status?: string,
    clienteId?: string,
    dataInicio?: string,
    dataFim?: string,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (clienteId) {
      where.clienteId = clienteId;
    }
    if (dataInicio || dataFim) {
      where.dataHora = {};
      if (dataInicio) {
        where.dataHora.gte = new Date(dataInicio);
      }
      if (dataFim) {
        where.dataHora.lte = new Date(dataFim);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.agendamento.findMany({
        where,
        skip,
        take: limit,
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              telefone: true,
            },
          },
          veiculo: true,
          servicos: {
            include: {
              servico: true,
            },
          },
        },
        orderBy: { dataHora: 'asc' },
      }),
      this.prisma.agendamento.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const agendamento = await this.prisma.agendamento.findUnique({
      where: { id },
      include: {
        cliente: true,
        veiculo: true,
        servicos: {
          include: {
            servico: true,
          },
        },
        notificacoes: true,
      },
    });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    return agendamento;
  }

  async getHorariosDisponiveis(data: string) {
    const dataDate = new Date(data);
    const horarios: string[] = [];

    // Business hours: 8h - 18h, 30min intervals
    const startHour = 8;
    const endHour = 18;
    const intervalMinutes = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const horario = new Date(dataDate);
        horario.setHours(hour, minute, 0, 0);

        // Skip past times
        if (horario < new Date()) {
          continue;
        }

        // Check for conflicts
        const conflito = await this.prisma.agendamento.findFirst({
          where: {
            dataHora: horario,
            status: {
              notIn: ['CANCELADO', 'NAO_COMPARECEU'],
            },
          },
        });

        if (!conflito) {
          horarios.push(horario.toISOString());
        }
      }
    }

    return { data: horarios };
  }

  async update(id: string, updateAgendamentoDto: UpdateAgendamentoDto) {
    await this.findOne(id);

    // If updating dataHora, check for conflicts
    if (updateAgendamentoDto.dataHora) {
      const dataHoraDate = new Date(updateAgendamentoDto.dataHora);
      if (dataHoraDate < new Date()) {
        throw new BadRequestException('Data/hora deve ser futura');
      }

      const conflito = await this.prisma.agendamento.findFirst({
        where: {
          id: { not: id },
          dataHora: dataHoraDate,
          status: {
            notIn: ['CANCELADO', 'NAO_COMPARECEU'],
          },
        },
      });

      if (conflito) {
        throw new BadRequestException('Já existe um agendamento neste horário');
      }
    }

    return this.prisma.agendamento.update({
      where: { id },
      data: updateAgendamentoDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete: change status to CANCELADO
    await this.prisma.agendamento.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });

    return { message: 'Agendamento cancelado com sucesso' };
  }
}
EOF

# Create Agendamentos Controller
cat > src/agendamentos/agendamentos.controller.ts << 'EOF'
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAgendamentoDto: CreateAgendamentoDto) {
    return this.agendamentosService.create(createAgendamentoDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
    @Query('clienteId') clienteId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.agendamentosService.findAll(
      paginationDto,
      status,
      clienteId,
      dataInicio,
      dataFim,
    );
  }

  @Get('disponiveis')
  getHorariosDisponiveis(@Query('data') data: string) {
    return this.agendamentosService.getHorariosDisponiveis(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agendamentosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAgendamentoDto: UpdateAgendamentoDto,
  ) {
    return this.agendamentosService.update(id, updateAgendamentoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.agendamentosService.remove(id);
  }
}
EOF

# Create Agendamentos Module
cat > src/agendamentos/agendamentos.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { AgendamentosController } from './agendamentos.controller';

@Module({
  controllers: [AgendamentosController],
  providers: [AgendamentosService],
  exports: [AgendamentosService],
})
export class AgendamentosModule {}
EOF

# Create App Controller
cat > src/app.controller.ts << 'EOF'
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Agenda Estética Auto - Backend',
    };
  }
}
EOF

# Create App Service
cat > src/app.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Agenda Estética Auto - Backend API';
  }
}
EOF

# Create App Module
cat > src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClientesModule } from './clientes/clientes.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { ServicosModule } from './servicos/servicos.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';

@Module({
  imports: [
    PrismaModule,
    ClientesModule,
    VeiculosModule,
    ServicosModule,
    AgendamentosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
EOF

# Create Seed file
cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Create services
  const servicos = await Promise.all([
    prisma.servico.create({
      data: {
        nome: 'Lavagem Simples',
        descricao: 'Lavagem externa completa do veículo',
        categoria: 'Lavagem',
        duracaoMinutos: 30,
        preco: 50,
        ativo: true,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Lavagem Completa',
        descricao: 'Lavagem externa e interna completa',
        categoria: 'Lavagem',
        duracaoMinutos: 60,
        preco: 100,
        ativo: true,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Polimento Técnico',
        descricao: 'Polimento profissional com cera de alta qualidade',
        categoria: 'Polimento',
        duracaoMinutos: 120,
        preco: 300,
        ativo: true,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Higienização Interna',
        descricao: 'Limpeza profunda do interior com aspiração e higienização',
        categoria: 'Higienização',
        duracaoMinutos: 90,
        preco: 150,
        ativo: true,
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Cristalização de Vidros',
        descricao: 'Aplicação de película protetora nos vidros',
        categoria: 'Proteção',
        duracaoMinutos: 45,
        preco: 200,
        ativo: true,
      },
    }),
  ]);

  console.log(`✅ ${servicos.length} serviços criados`);

  // Create clients
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: 'João Silva',
      telefone: '11999999999',
      whatsapp: '11999999999',
      email: 'joao.silva@email.com',
      observacoes: 'Cliente VIP - Prefere atendimento matutino',
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: 'Maria Santos',
      telefone: '11988888888',
      whatsapp: '11988888888',
      email: 'maria.santos@email.com',
    },
  });

  const cliente3 = await prisma.cliente.create({
    data: {
      nome: 'Pedro Oliveira',
      telefone: '11977777777',
    },
  });

  console.log('✅ 3 clientes criados');

  // Create vehicles
  const veiculo1 = await prisma.veiculo.create({
    data: {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2023,
      placa: 'ABC1234',
      cor: 'Prata',
      clienteId: cliente1.id,
    },
  });

  const veiculo2 = await prisma.veiculo.create({
    data: {
      marca: 'Honda',
      modelo: 'Civic',
      ano: 2024,
      placa: 'XYZ5678',
      cor: 'Preto',
      clienteId: cliente2.id,
    },
  });

  await prisma.veiculo.create({
    data: {
      marca: 'Volkswagen',
      modelo: 'Gol',
      ano: 2020,
      placa: 'DEF9012',
      cor: 'Branco',
      clienteId: cliente3.id,
    },
  });

  console.log('✅ 3 veículos criados');

  // Create appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  await prisma.agendamento.create({
    data: {
      dataHora: tomorrow,
      status: 'CONFIRMADO',
      clienteId: cliente1.id,
      veiculoId: veiculo1.id,
      valorTotal: 400,
      observacoes: 'Cliente pediu atenção especial aos bancos',
      servicos: {
        create: [
          {
            servicoId: servicos[1].id, // Lavagem Completa
            preco: 100,
          },
          {
            servicoId: servicos[2].id, // Polimento Técnico
            preco: 300,
          },
        ],
      },
    },
  });

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(10, 0, 0, 0);

  await prisma.agendamento.create({
    data: {
      dataHora: dayAfterTomorrow,
      status: 'PENDENTE',
      clienteId: cliente2.id,
      veiculoId: veiculo2.id,
      valorTotal: 250,
      servicos: {
        create: [
          {
            servicoId: servicos[0].id, // Lavagem Simples
            preco: 50,
          },
          {
            servicoId: servicos[4].id, // Cristalização
            preco: 200,
          },
        ],
      },
    },
  });

  console.log('✅ 2 agendamentos criados');

  console.log('\n🎉 Seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

# Update package.json to include seed script
cat > temp_package.json << 'EOF'
{
  "name": "agenda-estetica-backend",
  "version": "1.0.0",
  "description": "Backend API para Sistema de Agendamento de Estética Automotiva",
  "author": "",
  "private": true,
  "license": "ISC",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "dev": "nest start --watch",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:seed": "ts-node prisma/seed.ts",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/mapped-types": "^2.0.4",
    "@nestjs/platform-express": "^10.3.0",
    "@prisma/client": "^5.8.0",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.14",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.6",
    "@types/supertest": "^6.0.2",
    "@typescript-eslint/eslint-plugin": "^6.18.0",
    "@typescript-eslint/parser": "^6.18.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.2",
    "jest": "^29.7.0",
    "prettier": "^3.1.1",
    "prisma": "^5.8.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.3"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
EOF
mv temp_package.json package.json

echo "✅ Complete backend structure created!"
