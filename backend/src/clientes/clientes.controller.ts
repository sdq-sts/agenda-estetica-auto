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
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClienteDto: CreateClienteDto, @Request() req) {
    return this.clientesService.create(createClienteDto, req.tenantId);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Request() req) {
    return this.clientesService.findAll(paginationDto, req.tenantId);
  }

  @Get('search')
  search(@Query('q') q: string, @Request() req) {
    return this.clientesService.search(q, req.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.clientesService.findOne(id, req.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto, @Request() req) {
    return this.clientesService.update(id, updateClienteDto, req.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.clientesService.remove(id, req.tenantId);
  }
}
