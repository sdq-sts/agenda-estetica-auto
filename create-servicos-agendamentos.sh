#!/bin/bash

cd backend

# ========================
# SERVICOS MODULE
# ========================

cat > src/servicos/dto/create-servico.dto.ts << 'EOF'
import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUrl,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateServicoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  categoria: string;

  @IsInt()
  @Min(1)
  duracaoMinutos: number;

  @IsNumber()
  @Min(0)
  preco: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean = true;

  @IsOptional()
  @IsUrl()
  imagemUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacoes?: string;
}
EOF

cat > src/servicos/dto/update-servico.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreateServicoDto } from './create-servico.dto';

export class UpdateServicoDto extends PartialType(CreateServicoDto) {}
EOF

cat > src/servicos/servicos.service.ts << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ServicosService {
  constructor(private prisma: PrismaService) {}

  async create(createServicoDto: CreateServicoDto) {
    return this.prisma.servico.create({
      data: createServicoDto,
    });
  }

  async findAll(paginationDto: PaginationDto, ativo?: boolean, categoria?: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ativo !== undefined) {
      where.ativo = ativo === true || ativo === 'true';
    }
    if (categoria) {
      where.categoria = categoria;
    }

    const [data, total] = await Promise.all([
      this.prisma.servico.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.servico.count({ where }),
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
    const servico = await this.prisma.servico.findUnique({
      where: { id },
    });

    if (!servico) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
    }

    return servico;
  }

  async update(id: string, updateServicoDto: UpdateServicoDto) {
    await this.findOne(id);

    return this.prisma.servico.update({
      where: { id },
      data: updateServicoDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete: just mark as inactive
    await this.prisma.servico.update({
      where: { id },
      data: { ativo: false },
    });

    return { message: 'Serviço desativado com sucesso' };
  }
}
EOF

cat > src/servicos/servicos.controller.ts << 'EOF'
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
import { ServicosService } from './servicos.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServicoDto: CreateServicoDto) {
    return this.servicosService.create(createServicoDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('ativo') ativo?: boolean,
    @Query('categoria') categoria?: string,
  ) {
    return this.servicosService.findAll(paginationDto, ativo, categoria);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServicoDto: UpdateServicoDto) {
    return this.servicosService.update(id, updateServicoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.servicosService.remove(id);
  }
}
EOF

cat > src/servicos/servicos.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { ServicosController } from './servicos.controller';

@Module({
  controllers: [ServicosController],
  providers: [ServicosService],
  exports: [ServicosService],
})
export class ServicosModule {}
EOF

# ========================
# AGENDAMENTOS MODULE
# ========================

cat > src/agendamentos/dto/create-agendamento.dto.ts << 'EOF'
import {
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AgendamentoServicoDto {
  @IsString()
  servicoId: string;

  @IsNumber()
  @Min(0)
  preco: number;
}

export class CreateAgendamentoDto {
  @IsDateString()
  dataHora: string;

  @IsString()
  clienteId: string;

  @IsOptional()
  @IsString()
  veiculoId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgendamentoServicoDto)
  servicos: AgendamentoServicoDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacoes?: string;
}
EOF

cat > src/agendamentos/dto/update-agendamento.dto.ts << 'EOF'
import { IsString, IsDateString, IsOptional, IsEnum, MaxLength } from 'class-validator';

enum StatusAgendamento {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
  NAO_COMPARECEU = 'NAO_COMPARECEU',
}

export class UpdateAgendamentoDto {
  @IsOptional()
  @IsEnum(StatusAgendamento)
  status?: StatusAgendamento;

  @IsOptional()
  @IsDateString()
  dataHora?: string;

  @IsOptional()
  @IsString()
  veiculoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacoes?: string;
}
EOF

echo "✅ Servicos and Agendamentos modules created!"
