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
