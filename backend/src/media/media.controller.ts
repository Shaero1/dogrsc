import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { MediaResponseDto } from './dto/media-response.dto';
import { DEFAULT_MEDIA_MAX_BYTES } from './media.constants';
import { MediaService } from './media.service';

type AuthenticatedRequest = Request & {
  user: { id: string; email: string; role: UserRole };
};

@ApiTags('admin-media')
@Controller('admin/media')
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: DEFAULT_MEDIA_MAX_BYTES,
        files: 1,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        entityType: { type: 'string', example: 'dog' },
        entityId: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload image media' })
  @ApiCreatedResponse({ type: MediaResponseDto })
  @ApiUnauthorizedResponse()
  @ApiPayloadTooLargeResponse()
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('entityType') entityType: string | undefined,
    @Body('entityId') entityId: string | undefined,
    @Req() req: AuthenticatedRequest,
  ): Promise<MediaResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.mediaService.create(
      {
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
        originalname: file.originalname,
      },
      req.user.id,
      entityType,
      entityId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media metadata and presigned URL' })
  @ApiOkResponse({ type: MediaResponseDto })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MediaResponseDto> {
    return this.mediaService.findById(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft-delete media' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.mediaService.softDelete(id, req.user);
  }
}
