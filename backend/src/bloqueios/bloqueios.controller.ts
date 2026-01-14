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
import { BloqueiosService } from './bloqueios.service';
import { CreateBloqueioDto } from './dto/create-bloqueio.dto';
import { UpdateBloqueioDto } from './dto/update-bloqueio.dto';

@Controller('bloqueios')
export class BloqueiosController {
  constructor(private readonly bloqueiosService: BloqueiosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBloqueioDto: CreateBloqueioDto, @Request() req) {
    return this.bloqueiosService.create(createBloqueioDto, req.tenantId);
  }

  @Get()
  findAll(
    @Query('tipo') tipo: string | undefined,
    @Query('ativo') ativo: boolean | undefined,
    @Request() req,
  ) {
    return this.bloqueiosService.findAll(req.tenantId, tipo, ativo);
  }

  @Get('data/:data')
  findByDate(@Param('data') data: string, @Request() req) {
    return this.bloqueiosService.findByDate(new Date(data), req.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.bloqueiosService.findOne(id, req.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBloqueioDto: UpdateBloqueioDto, @Request() req) {
    return this.bloqueiosService.update(id, updateBloqueioDto, req.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.bloqueiosService.remove(id, req.tenantId);
  }
}
