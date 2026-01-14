import { IsString, IsDateString, IsOptional, IsEnum, MaxLength, IsNumber, Min, IsIn } from 'class-validator';

enum StatusAgendamento {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
  NAO_COMPARECEU = 'NAO_COMPARECEU',
}

export class UpdateAgendamentoDto {
  @IsOptional()
  @IsEnum(StatusAgendamento)
  status?: StatusAgendamento;

  @IsOptional()
  @IsDateString()
  dataHora?: string;

  @IsOptional()
  @IsString()
  veiculoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacoes?: string;

  // Payment fields
  @IsOptional()
  @IsString()
  @IsIn(['PENDENTE', 'PAGO', 'REEMBOLSADO'])
  statusPagamento?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PIX', 'DINHEIRO', 'CARTAO', 'DEBITO'])
  formaPagamento?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorPago?: number;
}
