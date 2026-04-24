import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { ReviewsService } from './reviews.service'
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt.guard'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'

import { ReviewQueryDto } from './dto/review-query.dto'
import { CreateReviewDto } from './dto/create-review.dto'
import { UpdateReviewDto } from './dto/update-review.dto'

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  // ===== GET REVIEWS =====
  @Get('product/:productId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List reviews for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'rating',
    required: false,
    example: 5,
    description: 'Filter by rating (multi-value supported)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['newest', 'helpful'],
    example: 'newest',
  })
  @ApiQuery({
    name: 'hasMedia',
    required: false,
    example: false,
  })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async findAll(
    @Param('productId') productId: string,
    @Query() query: ReviewQueryDto,
    @CurrentUser() user?: any,
  ) {
    const result = await this.reviews.findAll(productId, query, user?.id)

    return {
      success: true,
      ...result,
    }
  }

  // ===== CREATE REVIEW =====
  @Post('product/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review (must have completed order)' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiBody({
    description: 'Review payload',
    examples: {
      basic: {
        summary: 'Basic review',
        value: {
          rating: 5,
          comment: 'Bagus banget!',
          fit: 'true',
          measurements: {
            bust: 86,
            waist: 68,
            hips: 90,
          },
          mediaUrls: [],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({
    status: 403,
    description: 'REVIEW_NOT_ELIGIBLE — No completed order found',
  })
  @ApiResponse({
    status: 409,
    description: 'ALREADY_REVIEWED — Already reviewed',
  })
  async create(
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: any,
  ) {
    return {
      success: true,
      data: await this.reviews.create(productId, user.id, dto),
    }
  }

  // ===== UPDATE =====
  @Patch(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own review' })
  @ApiParam({ name: 'reviewId', description: 'Review UUID' })
  @ApiBody({
    description: 'Fields to update',
    examples: {
      update: {
        summary: 'Update review',
        value: {
          rating: 4,
          comment: 'Lumayan, agak kecil di pinggang',
          fit: 'small',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'FORBIDDEN — Not your review',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND — Review not found',
  })
  async update(
    @Param('reviewId') id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: any,
  ) {
    return {
      success: true,
      data: await this.reviews.update(id, user.id, dto),
    }
  }

  // ===== DELETE =====
  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete own review' })
  @ApiParam({ name: 'reviewId', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async remove(
    @Param('reviewId') id: string,
    @CurrentUser() user: any,
  ) {
    await this.reviews.remove(id, user.id)

    return {
      success: true,
      data: { message: 'Review deleted' },
    }
  }

  // ===== HELPFUL =====
  @Post(':reviewId/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Toggle helpful on review' })
  @ApiParam({ name: 'reviewId', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Helpful toggled' })
  async toggleHelpful(
    @Param('reviewId') id: string,
    @CurrentUser() user: any,
  ) {
    return {
      success: true,
      data: await this.reviews.toggleHelpful(id, user.id),
    }
  }

  @Get(':reviewId/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check helpful status' })
  @ApiParam({ name: 'reviewId', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Helpful status retrieved' })
  async checkHelpful(
    @Param('reviewId') id: string,
    @CurrentUser() user: any,
  ) {
    return {
      success: true,
      data: await this.reviews.checkHelpful(id, user.id),
    }
  }
}