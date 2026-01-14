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

  async create(createVeiculoDto: CreateVeiculoDto, tenantId: string) {
    // Check if placa already exists for this tenant
    const existingPlaca = await this.prisma.veiculo.findUnique({
      where: { tenantId_placa: { tenantId, placa: createVeiculoDto.placa } },
    });

    if (existingPlaca) {
      throw new ConflictException('Placa já cadastrada');
    }

    // Check if cliente exists and belongs to this tenant
    const clienteExists = await this.prisma.cliente.findFirst({
      where: { id: createVeiculoDto.clienteId, tenantId },
    });

    if (!clienteExists) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.prisma.veiculo.create({
      data: { ...createVeiculoDto, tenantId },
      include: {
        cliente: true,
      },
    });
  }

  async findAll(paginationDto: PaginationDto, tenantId: string, clienteId?: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where = clienteId ? { tenantId, clienteId } : { tenantId };

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

  async findOne(id: string, tenantId: string) {
    const veiculo = await this.prisma.veiculo.findFirst({
      where: { id, tenantId },
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

  async update(id: string, updateVeiculoDto: UpdateVeiculoDto, tenantId: string) {
    // Check if veiculo exists
    await this.findOne(id, tenantId);

    // Check for placa conflict (if updating)
    if (updateVeiculoDto.placa) {
      const existingPlaca = await this.prisma.veiculo.findUnique({
        where: { tenantId_placa: { tenantId, placa: updateVeiculoDto.placa } },
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

  async remove(id: string, tenantId: string) {
    // Check if veiculo exists
    await this.findOne(id, tenantId);

    await this.prisma.veiculo.delete({ where: { id } });
    return { message: 'Veículo deletado com sucesso' };
  }
}
