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

  async create(createAgendamentoDto: CreateAgendamentoDto, tenantId: string) {
    const { clienteId, veiculoId, dataHora, servicos, observacoes } =
      createAgendamentoDto;

    // Validate cliente exists and belongs to tenant
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
    });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Validate veiculo exists, belongs to tenant and to cliente
    if (veiculoId) {
      const veiculo = await this.prisma.veiculo.findFirst({
        where: { id: veiculoId, tenantId },
      });
      if (!veiculo) {
        throw new NotFoundException('Veículo não encontrado');
      }
      if (veiculo.clienteId !== clienteId) {
        throw new BadRequestException('Veículo não pertence ao cliente');
      }
    }

    // Validate all servicos exist and belong to tenant
    for (const s of servicos) {
      const servico = await this.prisma.servico.findFirst({
        where: { id: s.servicoId, tenantId },
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

    // Check for time conflicts (only within same tenant)
    const endTime = new Date(
      dataHoraDate.getTime() + duracaoTotal * 60 * 1000,
    );
    const conflictingAgendamento = await this.prisma.agendamento.findFirst({
      where: {
        tenantId,
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
        tenantId,
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
    tenantId: string,
    status?: string,
    clienteId?: string,
    dataInicio?: string,
    dataFim?: string,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
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

  async findOne(id: string, tenantId: string) {
    const agendamento = await this.prisma.agendamento.findFirst({
      where: { id, tenantId },
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

  async getHorariosDisponiveis(data: string, tenantId: string) {
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

        // Check for conflicts (only within same tenant)
        const conflito = await this.prisma.agendamento.findFirst({
          where: {
            tenantId,
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

  async update(id: string, updateAgendamentoDto: UpdateAgendamentoDto, tenantId: string) {
    await this.findOne(id, tenantId);

    // If updating dataHora, check for conflicts
    if (updateAgendamentoDto.dataHora) {
      const dataHoraDate = new Date(updateAgendamentoDto.dataHora);
      if (dataHoraDate < new Date()) {
        throw new BadRequestException('Data/hora deve ser futura');
      }

      const conflito = await this.prisma.agendamento.findFirst({
        where: {
          tenantId,
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

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    // Soft delete: change status to CANCELADO
    await this.prisma.agendamento.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });

    return { message: 'Agendamento cancelado com sucesso' };
  }
}
