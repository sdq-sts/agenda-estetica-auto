import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAgendamentoDto: CreateAgendamentoDto, @Request() req) {
    return this.agendamentosService.create(createAgendamentoDto, req.tenantId);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status: string | undefined,
    @Query('clienteId') clienteId: string | undefined,
    @Query('dataInicio') dataInicio: string | undefined,
    @Query('dataFim') dataFim: string | undefined,
    @Request() req,
  ) {
    return this.agendamentosService.findAll(
      paginationDto,
      req.tenantId,
      status,
      clienteId,
      dataInicio,
      dataFim,
    );
  }

  @Get('disponiveis')
  getHorariosDisponiveis(@Query('data') data: string, @Request() req) {
    return this.agendamentosService.getHorariosDisponiveis(data, req.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.agendamentosService.findOne(id, req.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAgendamentoDto: UpdateAgendamentoDto,
    @Request() req,
  ) {
    return this.agendamentosService.update(id, updateAgendamentoDto, req.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.agendamentosService.remove(id, req.tenantId);
  }
}
