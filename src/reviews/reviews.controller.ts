import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt.guard';
import { ReviewQueryDto } from './dto/review-query.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('product/:productId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List reviews for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'rating', required: false, example: 5, description: 'Filter by rating, multi-value: ?rating=4&rating=5' })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'helpful'], example: 'newest' })
  @ApiQuery({ name: 'hasMedia', required: false, example: false, description: 'Only reviews with photo/video' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async findAll(@Param('productId') productId: string, @Query() query: ReviewQueryDto, @CurrentUser() user?: any) {
    const result = await this.reviews.findAll(productId, query, user?.id)
    return { 
      success: true, 
      ...result, 
    }
  }

  @Post('product/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiBody({
    description: 'Review payload',
    examples: {
      example1: {
        summary: 'Basic review',
        value: {
          rating: 5,
          comment: "Dress ini luar biasa, kualitasnya sangat bagus dan potongannya sempurna!",
          fit: "true",
          measurements: { bust: 86, waist: 68, hips: 90 },
          mediaUrls: []
        }
      },
      example2: {
        summary: 'Review with media',
        value: {
          rating: 4,
          comment: "Kualitas bagus, sedikit ketat di bagian pinggang tapi overall oke.",
          fit: "small",
          measurements: { bust: 88, waist: 72, hips: 92 },
          mediaUrls: ["https://example.com/photo1.jpg"]
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 403, description: 'REVIEW_NOT_ELIGIBLE — No completed order found' })
  @ApiResponse({ status: 409, description: 'ALREADY_REVIEWED — User already reviewed this product' })
  @ApiResponse({ status: 400, description: 'VALIDATION_ERROR — Missing or invalid fields' })
  async create(@Param('productId') productId: string, @Body() dto: CreateReviewDto, @CurrentUser() user: any) {
    return { 
      success: true, 
      data: await this.reviews.create(productId, user.id, dto),
    }
  }

  @Patch(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit own review' })
  @ApiParam({ name: 'reviewId', description: 'Review UUID' })
  @ApiBody({
    description: 'Fields to update (all optional)',
    examples: {
      example1: {
        summary: 'Update rating and comment',
        value: {
          rating: 4,
          comment: "Setelah dipikir lagi, dress ini memang bagus tapi sizing agak kecil.",
          fit: "small"
        }
      },
      example2: {
        summary: 'Update comment only',
        value: {
          comment: "Update: setelah dicuci bahannya tetap bagus, highly recommended!"
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'FORBIDDEN — Cannot edit another user\'s review' })
  @ApiResponse({ status: 404, description: 'NOT_FOUND — Review not found' })
  async update(@Param('reviewId') id: string, @Body() dto: UpdateReviewDto, @CurrentUser() user: any) {
    return { 
      success: true, 
      data: await this.reviews.update(id, user.id, dto) 
    }
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete own review' })
  @ApiParam({ name: 'reviewId', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 403, description: 'FORBIDDEN — Cannot delete another user\'s review' })
  @ApiResponse({ status: 404, description: 'NOT_FOUND — Review not found' })
  async remove(@Param('reviewId') id: string, @CurrentUser() user: any) {
    await this.reviews.remove(id, user.id)
    return { 
      success: true, 
      data: { message: 'Review deleted' },
    }
  }
  
  @Post(':reviewId/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Toggle helpful on a review' })
  @ApiParam({ name: 'reviewId', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Helpful toggled successfully' })
  @ApiResponse({ status: 400, description: 'SELF_HELPFUL — Cannot mark your own review as helpful' })
  @ApiResponse({ status: 404, description: 'NOT_FOUND — Review not found' })
  async toggleHelpful(@Param('reviewId') id: string, @CurrentUser() user: any) {
    return { 
      success: true, 
      data: await this.reviews.toggleHelpful(id, user.id), 
    }
  }

  @Get(':reviewId/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user liked a review' })
  @ApiParam({ name: 'reviewId', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Helpful status retrieved' })
  @ApiResponse({ status: 404, description: 'NOT_FOUND — Review not found' })
  async checkHelpful(@Param('reviewId') id: string, @CurrentUser() user: any) {
    return { 
      success: true,
      data: await this.reviews.checkHelpful(id, user.id),
    }
  }
}
