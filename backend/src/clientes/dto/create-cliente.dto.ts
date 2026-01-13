import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nome: string;

  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Telefone deve ter 10 ou 11 dígitos' })
  telefone: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'WhatsApp deve ter 10 ou 11 dígitos' })
  whatsapp?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  cpfCnpj?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacoes?: string;
}
