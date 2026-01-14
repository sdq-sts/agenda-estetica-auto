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
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVeiculoDto: CreateVeiculoDto, @Request() req) {
    return this.veiculosService.create(createVeiculoDto, req.tenantId);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Query('clienteId') clienteId: string | undefined, @Request() req) {
    return this.veiculosService.findAll(paginationDto, req.tenantId, clienteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.veiculosService.findOne(id, req.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVeiculoDto: UpdateVeiculoDto, @Request() req) {
    return this.veiculosService.update(id, updateVeiculoDto, req.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.veiculosService.remove(id, req.tenantId);
  }
}
