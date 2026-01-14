import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SendMessageDto {
  number: string;
  text: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly evolutionUrl: string;
  private readonly evolutionKey: string;
  private readonly instanceName = 'agenda-estetica';

  constructor(private configService: ConfigService) {
    this.evolutionUrl = this.configService.get<string>('EVOLUTION_API_URL');
    this.evolutionKey = this.configService.get<string>('EVOLUTION_API_KEY');
  }

  /**
   * Envia mensagem de texto via Evolution API
   */
  async enviarMensagem(telefone: string, mensagem: string): Promise<void> {
    try {
      // Formatar telefone (remover caracteres especiais e adicionar código do país se necessário)
      const numeroFormatado = this.formatarTelefone(telefone);

      const payload: SendMessageDto = {
        number: numeroFormatado,
        text: mensagem,
      };

      this.logger.log(`Enviando mensagem para ${numeroFormatado}`);

      const response = await fetch(
        `${this.evolutionUrl}/message/sendText/${this.instanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: this.evolutionKey,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Evolution API error: ${error}`);
      }

      this.logger.log(`Mensagem enviada com sucesso para ${numeroFormatado}`);
    } catch (error) {
      this.logger.error(
        `Erro ao enviar mensagem para ${telefone}: ${error.message}`,
      );
      // Não lançar erro para não quebrar o fluxo principal
      // Apenas loga o erro
    }
  }

  /**
   * Envia confirmação de agendamento
   */
  async enviarConfirmacaoAgendamento(dados: {
    telefone: string;
    nomeCliente: string;
    dataHora: Date;
    servicos: string[];
    valorTotal: number;
  }): Promise<void> {
    const { telefone, nomeCliente, dataHora, servicos, valorTotal } = dados;

    const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(dataHora);

    const mensagem = `✅ *Agendamento Confirmado!*

Olá ${nomeCliente}! Seu agendamento foi confirmado com sucesso.

📅 *Data/Hora:* ${dataFormatada}
🚗 *Serviços:* ${servicos.join(', ')}
💰 *Valor Total:* R$ ${valorTotal.toFixed(2)}

⚠️ *Importante:* Confirme o pagamento antecipado para garantir sua vaga.

Nos vemos em breve! 🚗✨`;

    await this.enviarMensagem(telefone, mensagem);
  }

  /**
   * Envia lembrete de agendamento (24h antes)
   */
  async enviarLembreteAgendamento(dados: {
    telefone: string;
    nomeCliente: string;
    dataHora: Date;
    servicos: string[];
  }): Promise<void> {
    const { telefone, nomeCliente, dataHora, servicos } = dados;

    const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
      timeStyle: 'short',
    }).format(dataHora);

    const mensagem = `🔔 *Lembrete de Agendamento*

Olá ${nomeCliente}!

Lembrando que amanhã você tem agendamento conosco:

⏰ *Horário:* ${horaFormatada}
🚗 *Serviços:* ${servicos.join(', ')}

Confirme sua presença respondendo esta mensagem.

Até amanhã! 🚗✨`;

    await this.enviarMensagem(telefone, mensagem);
  }

  /**
   * Envia notificação de cancelamento
   */
  async enviarNotificacaoCancelamento(dados: {
    telefone: string;
    nomeCliente: string;
    dataHora: Date;
    taxaCancelamento?: number;
  }): Promise<void> {
    const { telefone, nomeCliente, dataHora, taxaCancelamento } = dados;

    const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(dataHora);

    let mensagem = `❌ *Agendamento Cancelado*

Olá ${nomeCliente}, seu agendamento para ${dataFormatada} foi cancelado.`;

    if (taxaCancelamento && taxaCancelamento > 0) {
      mensagem += `

⚠️ *Taxa de cancelamento:* R$ ${taxaCancelamento.toFixed(2)}

Conforme nossa política, cancelamentos com menos de 24h de antecedência estão sujeitos a taxa.`;
    }

    mensagem += `

Se precisar reagendar, estamos à disposição!`;

    await this.enviarMensagem(telefone, mensagem);
  }

  /**
   * Envia notificação de pagamento confirmado
   */
  async enviarConfirmacaoPagamento(dados: {
    telefone: string;
    nomeCliente: string;
    valorPago: number;
    formaPagamento: string;
  }): Promise<void> {
    const { telefone, nomeCliente, valorPago, formaPagamento } = dados;

    const mensagem = `✅ *Pagamento Confirmado!*

Olá ${nomeCliente}!

Confirmamos o recebimento do seu pagamento:

💰 *Valor:* R$ ${valorPago.toFixed(2)}
💳 *Forma:* ${formaPagamento}

Seu agendamento está garantido!

Nos vemos em breve! 🚗✨`;

    await this.enviarMensagem(telefone, mensagem);
  }

  /**
   * Formata número de telefone para padrão internacional
   * Exemplos:
   * - 11999999999 -> 5511999999999
   * - (11) 99999-9999 -> 5511999999999
   */
  private formatarTelefone(telefone: string): string {
    // Remove tudo que não é número
    let numero = telefone.replace(/\D/g, '');

    // Se não tem código do país, adiciona 55 (Brasil)
    if (!numero.startsWith('55')) {
      numero = '55' + numero;
    }

    // Adiciona @ e sufixo do WhatsApp
    return numero + '@s.whatsapp.net';
  }

  /**
   * Verifica se a instância do WhatsApp está conectada
   */
  async verificarConexao(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.evolutionUrl}/instance/connectionState/${this.instanceName}`,
        {
          headers: {
            apikey: this.evolutionKey,
          },
        },
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.state === 'open';
    } catch (error) {
      this.logger.error(`Erro ao verificar conexão: ${error.message}`);
      return false;
    }
  }
}
