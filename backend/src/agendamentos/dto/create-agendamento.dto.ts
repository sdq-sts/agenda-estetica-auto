import {
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AgendamentoServicoDto {
  @IsString()
  servicoId: string;

  @IsNumber()
  @Min(0)
  preco: number;
}

export class CreateAgendamentoDto {
  @IsDateString()
  dataHora: string;

  @IsString()
  clienteId: string;

  @IsOptional()
  @IsString()
  veiculoId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgendamentoServicoDto)
  servicos: AgendamentoServicoDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacoes?: string;
}
