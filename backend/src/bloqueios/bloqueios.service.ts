import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloqueioDto } from './dto/create-bloqueio.dto';
import { UpdateBloqueioDto } from './dto/update-bloqueio.dto';

@Injectable()
export class BloqueiosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBloqueioDto: CreateBloqueioDto, tenantId: string) {
    const data: any = {
      tipo: createBloqueioDto.tipo,
      horaInicio: createBloqueioDto.horaInicio,
      horaFim: createBloqueioDto.horaFim,
      diaInteiro: createBloqueioDto.diaInteiro ?? false,
      motivo: createBloqueioDto.motivo,
      ativo: createBloqueioDto.ativo ?? true,
      tenantId,
    };

    if (createBloqueioDto.tipo === 'RECORRENTE' && createBloqueioDto.diaSemana !== undefined) {
      data.diaSemana = createBloqueioDto.diaSemana;
    }

    if (createBloqueioDto.tipo === 'PONTUAL' && createBloqueioDto.dataEspecifica) {
      data.dataEspecifica = new Date(createBloqueioDto.dataEspecifica);
    }

    return this.prisma.bloqueioHorario.create({ data });
  }

  async findAll(tenantId: string, tipo?: string, ativo?: boolean) {
    const where: any = { tenantId };

    if (tipo) {
      where.tipo = tipo;
    }

    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    return this.prisma.bloqueioHorario.findMany({
      where,
      orderBy: [
        { tipo: 'asc' },
        { dataEspecifica: 'asc' },
        { diaSemana: 'asc' },
      ],
    });
  }

  async findOne(id: string, tenantId: string) {
    const bloqueio = await this.prisma.bloqueioHorario.findFirst({
      where: { id, tenantId },
    });

    if (!bloqueio) {
      throw new NotFoundException(`Bloqueio #${id} não encontrado`);
    }

    return bloqueio;
  }

  // Buscar bloqueios para uma data específica (pontuais + recorrentes)
  async findByDate(date: Date, tenantId: string) {
    const diaSemana = date.getDay(); // 0-6
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bloqueios = await this.prisma.bloqueioHorario.findMany({
      where: {
        AND: [
          { tenantId },
          { ativo: true },
          {
            OR: [
              // Bloqueios pontuais para essa data
              {
                tipo: 'PONTUAL',
                dataEspecifica: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
              // Bloqueios recorrentes para esse dia da semana
              {
                tipo: 'RECORRENTE',
                diaSemana,
              },
            ],
          },
        ],
      },
    });

    return bloqueios;
  }

  async update(id: string, updateBloqueioDto: UpdateBloqueioDto, tenantId: string) {
    await this.findOne(id, tenantId); // Check if exists

    const data: any = {};

    if (updateBloqueioDto.tipo) data.tipo = updateBloqueioDto.tipo;
    if (updateBloqueioDto.horaInicio) data.horaInicio = updateBloqueioDto.horaInicio;
    if (updateBloqueioDto.horaFim) data.horaFim = updateBloqueioDto.horaFim;
    if (updateBloqueioDto.diaInteiro !== undefined) data.diaInteiro = updateBloqueioDto.diaInteiro;
    if (updateBloqueioDto.motivo !== undefined) data.motivo = updateBloqueioDto.motivo;
    if (updateBloqueioDto.ativo !== undefined) data.ativo = updateBloqueioDto.ativo;
    if (updateBloqueioDto.diaSemana !== undefined) data.diaSemana = updateBloqueioDto.diaSemana;
    if (updateBloqueioDto.dataEspecifica) data.dataEspecifica = new Date(updateBloqueioDto.dataEspecifica);

    return this.prisma.bloqueioHorario.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId); // Check if exists

    await this.prisma.bloqueioHorario.delete({
      where: { id },
    });
  }
}
