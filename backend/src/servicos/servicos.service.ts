import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ServicosService {
  constructor(private prisma: PrismaService) {}

  async create(createServicoDto: CreateServicoDto, tenantId: string) {
    return this.prisma.servico.create({
      data: { ...createServicoDto, tenantId },
    });
  }

  async findAll(paginationDto: PaginationDto, tenantId: string, ativo?: boolean, categoria?: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (ativo !== undefined) {
      where.ativo = typeof ativo === 'string' ? ativo === 'true' : ativo;
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

  async findOne(id: string, tenantId: string) {
    const servico = await this.prisma.servico.findFirst({
      where: { id, tenantId },
    });

    if (!servico) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
    }

    return servico;
  }

  async update(id: string, updateServicoDto: UpdateServicoDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.servico.update({
      where: { id },
      data: updateServicoDto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    // Soft delete: just mark as inactive
    await this.prisma.servico.update({
      where: { id },
      data: { ativo: false },
    });

    return { message: 'Serviço desativado com sucesso' };
  }
}
