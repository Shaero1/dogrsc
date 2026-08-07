import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { CreateStoryDto, StoryListQueryDto, UpdateStoryDto } from './dto/story.dto';
import {
  PaginatedStoriesAdminResponseDto,
  StoryAdminResponseDto,
} from './dto/story-response.dto';
import { StoriesService } from './stories.service';

@ApiTags('admin-stories')
@Controller('admin/stories')
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class StoriesAdminController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List stories (admin)' })
  @ApiOkResponse({ type: PaginatedStoriesAdminResponseDto })
  findAll(
    @Query() query: StoryListQueryDto,
  ): Promise<PaginatedStoriesAdminResponseDto> {
    return this.storiesService.findAllAdmin(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create story' })
  @ApiCreatedResponse({ type: StoryAdminResponseDto })
  create(@Body() dto: CreateStoryDto): Promise<StoryAdminResponseDto> {
    return this.storiesService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get story by id (admin)' })
  @ApiOkResponse({ type: StoryAdminResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StoryAdminResponseDto> {
    return this.storiesService.findByIdAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update story' })
  @ApiOkResponse({ type: StoryAdminResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoryDto,
  ): Promise<StoryAdminResponseDto> {
    return this.storiesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete story (ADMIN only)' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.storiesService.delete(id);
  }
}
