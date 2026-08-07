import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { DogsService } from './dogs.service';
import { DogListQueryDto } from './dto/dog-list-query.dto';
import {
  DogPublicResponseDto,
  PaginatedDogsPublicResponseDto,
} from './dto/dog-public-response.dto';

@ApiTags('dogs')
@Controller('dogs')
@Public()
export class DogsPublicController {
  constructor(private readonly dogsService: DogsService) {}

  @Get()
  @ApiOperation({ summary: 'List published dogs' })
  @ApiOkResponse({ type: PaginatedDogsPublicResponseDto })
  findAll(
    @Query() query: DogListQueryDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<PaginatedDogsPublicResponseDto> {
    return this.dogsService.findAllPublic(query, acceptLanguage);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get published dog by slug' })
  @ApiOkResponse({ type: DogPublicResponseDto })
  findBySlug(
    @Param('slug') slug: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<DogPublicResponseDto> {
    return this.dogsService.findBySlugPublic(slug, acceptLanguage);
  }
}
