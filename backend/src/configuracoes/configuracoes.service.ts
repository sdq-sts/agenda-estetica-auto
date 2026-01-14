import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfiguracoesService {
  constructor(private readonly prisma: PrismaService) {}

  // Buscar configuração por chave
  async findOne(chave: string, tenantId: string) {
    const config = await this.prisma.configuracao.findUnique({
      where: { tenantId_chave: { tenantId, chave } },
    });

    if (!config) {
      throw new NotFoundException(`Configuração '${chave}' não encontrada`);
    }

    return config;
  }

  // Upsert (criar ou atualizar) configuração
  async upsert(chave: string, valor: string, tenantId: string, descricao?: string) {
    return this.prisma.configuracao.upsert({
      where: { tenantId_chave: { tenantId, chave } },
      create: {
        chave,
        valor,
        descricao,
        tenantId,
      },
      update: {
        valor,
        descricao,
      },
    });
  }

  // Buscar todas as configurações de horário
  async findAllHorarios(tenantId: string) {
    const configs = await this.prisma.configuracao.findMany({
      where: {
        tenantId,
        chave: {
          startsWith: 'horario_',
        },
      },
    });

    // Formatar response
    const horarios: Record<string, string | null> = {};
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

    diasSemana.forEach((dia) => {
      const config = configs.find((c) => c.chave === `horario_${dia}`);
      horarios[dia] = config?.valor || null;
    });

    return horarios;
  }

  // Salvar horários padrão
  async saveHorariosPadrao(horarios: Record<string, string | null>, tenantId: string) {
    const promises = Object.entries(horarios).map(([dia, horario]) => {
      return this.upsert(
        `horario_${dia}`,
        horario || '',
        tenantId,
        `Horário de funcionamento - ${dia}`,
      );
    });

    await Promise.all(promises);

    return { message: 'Horários salvos com sucesso' };
  }
}
