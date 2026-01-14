import { PartialType } from '@nestjs/mapped-types';
import { CreateBloqueioDto } from './create-bloqueio.dto';

export class UpdateBloqueioDto extends PartialType(CreateBloqueioDto) {}
