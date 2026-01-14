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
import { ServicosService } from './servicos.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServicoDto: CreateServicoDto, @Request() req) {
    return this.servicosService.create(createServicoDto, req.tenantId);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('ativo') ativo: boolean | undefined,
    @Query('categoria') categoria: string | undefined,
    @Request() req,
  ) {
    return this.servicosService.findAll(paginationDto, req.tenantId, ativo, categoria);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.servicosService.findOne(id, req.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServicoDto: UpdateServicoDto, @Request() req) {
    return this.servicosService.update(id, updateServicoDto, req.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.servicosService.remove(id, req.tenantId);
  }
}
