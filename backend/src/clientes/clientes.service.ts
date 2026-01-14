import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto, tenantId: string) {
    // Check if telefone already exists
    const existingCliente = await this.prisma.cliente.findUnique({
      where: { tenantId_telefone: { tenantId, telefone: createClienteDto.telefone } },
    });

    if (existingCliente) {
      throw new ConflictException('Telefone já cadastrado');
    }

    // Check if email already exists (if provided)
    if (createClienteDto.email) {
      const existingEmail = await this.prisma.cliente.findUnique({
        where: { tenantId_email: { tenantId, email: createClienteDto.email } },
      });

      if (existingEmail) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    return this.prisma.cliente.create({
      data: { ...createClienteDto, tenantId },
    });
  }

  async findAll(paginationDto: PaginationDto, tenantId: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where: { tenantId },
        skip,
        take: limit,
        include: {
          veiculos: true,
          _count: {
            select: { agendamentos: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cliente.count({ where: { tenantId } }),
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
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, tenantId },
      include: {
        veiculos: true,
        agendamentos: {
          take: 10,
          orderBy: { dataHora: 'desc' },
          include: {
            veiculo: true,
            servicos: {
              include: {
                servico: true,
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    return cliente;
  }

  async search(q: string, tenantId: string) {
    const clientes = await this.prisma.cliente.findMany({
      where: {
        tenantId,
        OR: [
          { nome: { contains: q } },
          { telefone: { contains: q } },
          { email: { contains: q } },
          {
            veiculos: {
              some: {
                placa: { contains: q },
              },
            },
          },
        ],
      },
      include: {
        veiculos: true,
      },
      take: 20,
    });

    return { data: clientes };
  }

  async update(id: string, updateClienteDto: UpdateClienteDto, tenantId: string) {
    // Check if cliente exists
    await this.findOne(id, tenantId);

    // Check for telefone conflict (if updating)
    if (updateClienteDto.telefone) {
      const existingCliente = await this.prisma.cliente.findUnique({
        where: { tenantId_telefone: { tenantId, telefone: updateClienteDto.telefone } },
      });

      if (existingCliente && existingCliente.id !== id) {
        throw new ConflictException('Telefone já cadastrado');
      }
    }

    // Check for email conflict (if updating)
    if (updateClienteDto.email) {
      const existingEmail = await this.prisma.cliente.findUnique({
        where: { tenantId_email: { tenantId, email: updateClienteDto.email } },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  async remove(id: string, tenantId: string) {
    // Check if cliente exists
    await this.findOne(id, tenantId);

    // Check if cliente has active agendamentos
    const activeAgendamentos = await this.prisma.agendamento.findFirst({
      where: {
        tenantId,
        clienteId: id,
        status: {
          in: ['PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO'],
        },
      },
    });

    if (activeAgendamentos) {
      throw new ConflictException(
        'Não é possível deletar cliente com agendamentos ativos',
      );
    }

    await this.prisma.cliente.delete({
      where: { id },
    });

    return { message: 'Cliente deletado com sucesso' };
  }
}
