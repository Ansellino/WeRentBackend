import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('review-media')
  @ApiOperation({
    summary: 'Upload review image',
    description:
      'Upload an image file for a product review using Multer. The image will be stored and a URL will be returned.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, PNG, GIF, WebP)',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({
    description: 'Image uploaded successfully',
    schema: {
      example: {
        success: true,
        data: {
          url: 'https://example.com/uploads/review-media/12345.jpg',
          filename: '12345.jpg',
          size: 2048576,
          mimetype: 'image/jpeg',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { storage: require('multer').memoryStorage() }),
  )
  async uploadReviewMedia(@UploadedFile() file: Express.Multer.File) {
    return {
      success: true,
      data: await this.uploadService.uploadReviewMedia(file),
    };
  }
}
