import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ConfiguracoesService } from './configuracoes.service';

@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  // Buscar configuração por chave
  @Get(':chave')
  findOne(@Param('chave') chave: string, @Request() req) {
    return this.configuracoesService.findOne(chave, req.tenantId);
  }

  // Salvar/Atualizar configuração
  @Post(':chave')
  @HttpCode(HttpStatus.OK)
  upsert(@Param('chave') chave: string, @Body('valor') valor: string, @Body('descricao') descricao: string | undefined, @Request() req) {
    return this.configuracoesService.upsert(chave, valor, req.tenantId, descricao);
  }

  // Buscar todas as configurações de horário
  @Get()
  findAllHorarios(@Request() req) {
    return this.configuracoesService.findAllHorarios(req.tenantId);
  }

  // Salvar horários padrão (seg-dom)
  @Post('horarios/padrao')
  @HttpCode(HttpStatus.OK)
  saveHorariosPadrao(@Body() horarios: Record<string, string | null>, @Request() req) {
    return this.configuracoesService.saveHorariosPadrao(horarios, req.tenantId);
  }
}
