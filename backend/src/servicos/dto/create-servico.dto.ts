import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUrl,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateServicoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  categoria: string;

  @IsInt()
  @Min(1)
  duracaoMinutos: number;

  @IsNumber()
  @Min(0)
  preco: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean = true;

  @IsOptional()
  @IsUrl()
  imagemUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacoes?: string;
}
