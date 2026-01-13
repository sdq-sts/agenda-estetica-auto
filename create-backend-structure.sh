#!/bin/bash

# This script creates the complete backend structure
# Run from the project root directory

cd backend

# Create Veiculos DTOs
cat > src/veiculos/dto/create-veiculo.dto.ts << 'EOF'
import {
  IsString,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateVeiculoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  marca: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  modelo: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  ano: number;

  @IsString()
  @MinLength(7)
  @MaxLength(8)
  placa: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  cor?: string;

  @IsString()
  clienteId: string;
}
EOF

cat > src/veiculos/dto/update-veiculo.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreateVeiculoDto } from './create-veiculo.dto';

export class UpdateVeiculoDto extends PartialType(CreateVeiculoDto) {}
EOF

# Create Veiculos Service
cat > src/veiculos/veiculos.service.ts << 'EOF'
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class VeiculosService {
  constructor(private prisma: PrismaService) {}

  async create(createVeiculoDto: CreateVeiculoDto) {
    const existingPlaca = await this.prisma.veiculo.findUnique({
      where: { placa: createVeiculoDto.placa },
    });

    if (existingPlaca) {
      throw new ConflictException('Placa já cadastrada');
    }

    const clienteExists = await this.prisma.cliente.findUnique({
      where: { id: createVeiculoDto.clienteId },
    });

    if (!clienteExists) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.prisma.veiculo.create({
      data: createVeiculoDto,
      include: {
        cliente: true,
      },
    });
  }

  async findAll(paginationDto: PaginationDto, clienteId?: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where = clienteId ? { clienteId } : {};

    const [data, total] = await Promise.all([
      this.prisma.veiculo.findMany({
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
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.veiculo.count({ where }),
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
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id },
      include: {
        cliente: true,
        agendamentos: {
          take: 10,
          orderBy: { dataHora: 'desc' },
          include: {
            servicos: {
              include: {
                servico: true,
              },
            },
          },
        },
      },
    });

    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
    }

    return veiculo;
  }

  async update(id: string, updateVeiculoDto: UpdateVeiculoDto) {
    await this.findOne(id);

    if (updateVeiculoDto.placa) {
      const existingPlaca = await this.prisma.veiculo.findUnique({
        where: { placa: updateVeiculoDto.placa },
      });

      if (existingPlaca && existingPlaca.id !== id) {
        throw new ConflictException('Placa já cadastrada');
      }
    }

    return this.prisma.veiculo.update({
      where: { id },
      data: updateVeiculoDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.veiculo.delete({ where: { id } });
    return { message: 'Veículo deletado com sucesso' };
  }
}
EOF

# Create Veiculos Controller
cat > src/veiculos/veiculos.controller.ts << 'EOF'
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
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVeiculoDto: CreateVeiculoDto) {
    return this.veiculosService.create(createVeiculoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Query('clienteId') clienteId?: string) {
    return this.veiculosService.findAll(paginationDto, clienteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.veiculosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVeiculoDto: UpdateVeiculoDto) {
    return this.veiculosService.update(id, updateVeiculoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.veiculosService.remove(id);
  }
}
EOF

# Create Veiculos Module
cat > src/veiculos/veiculos.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { VeiculosController } from './veiculos.controller';

@Module({
  controllers: [VeiculosController],
  providers: [VeiculosService],
  exports: [VeiculosService],
})
export class VeiculosModule {}
EOF

echo "✅ Backend structure created successfully!"
