import {
  IsString,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateVeiculoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  marca: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  modelo: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  ano: number;

  @IsString()
  @MinLength(7)
  @MaxLength(8)
  placa: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  cor?: string;

  @IsString()
  clienteId: string;
}
