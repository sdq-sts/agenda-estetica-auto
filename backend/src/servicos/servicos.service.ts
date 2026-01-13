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
