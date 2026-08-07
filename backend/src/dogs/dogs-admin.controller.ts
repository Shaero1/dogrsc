import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { DogsService } from './dogs.service';
import { CreateDogDto, UpdateDogDto } from './dto/create-dog.dto';
import {
  DogAdminResponseDto,
  PaginatedDogsAdminResponseDto,
} from './dto/dog-admin-response.dto';
import { DogListQueryDto } from './dto/dog-list-query.dto';

@ApiTags('admin-dogs')
@Controller('admin/dogs')
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class DogsAdminController {
  constructor(private readonly dogsService: DogsService) {}

  @Get()
  @ApiOperation({ summary: 'List dogs (admin)' })
  @ApiOkResponse({ type: PaginatedDogsAdminResponseDto })
  findAll(
    @Query() query: DogListQueryDto,
  ): Promise<PaginatedDogsAdminResponseDto> {
    return this.dogsService.findAllAdmin(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create dog' })
  @ApiCreatedResponse({ type: DogAdminResponseDto })
  create(@Body() dto: CreateDogDto): Promise<DogAdminResponseDto> {
    return this.dogsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dog by id (admin)' })
  @ApiOkResponse({ type: DogAdminResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DogAdminResponseDto> {
    return this.dogsService.findByIdAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dog' })
  @ApiOkResponse({ type: DogAdminResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDogDto,
  ): Promise<DogAdminResponseDto> {
    return this.dogsService.update(id, dto);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Archive dog (ADMIN only)' })
  @ApiOkResponse({ type: DogAdminResponseDto })
  archive(@Param('id', ParseUUIDPipe) id: string): Promise<DogAdminResponseDto> {
    return this.dogsService.archive(id);
  }
}
