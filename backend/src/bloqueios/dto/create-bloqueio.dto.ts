import { IsString, IsOptional, IsInt, IsBoolean, Min, Max, IsDateString } from 'class-validator';

export class CreateBloqueioDto {
  @IsString()
  tipo: 'PONTUAL' | 'RECORRENTE';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana?: number; // 0-6 (domingo-sábado)

  @IsOptional()
  @IsDateString()
  dataEspecifica?: string; // ISO 8601 date string

  @IsString()
  horaInicio: string; // "HH:mm"

  @IsString()
  horaFim: string; // "HH:mm"

  @IsOptional()
  @IsBoolean()
  diaInteiro?: boolean;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
