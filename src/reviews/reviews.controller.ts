import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt.guard';
import { ReviewQueryDto } from './dto/review-query.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('product/:productId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List reviews for a product' })
  async findAll(@Param('productId') productId: string, @Query() query: ReviewQueryDto, @CurrentUser() user?: any) {
    const result = await this.reviews.findAll(productId, query, user?.id)
    return { success: true, ...result }
  }

  @Post('product/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  async create(@Param('productId') productId: string, @Body() dto: CreateReviewDto, @CurrentUser() user: any) {
    return { success: true, data: await this.reviews.create(productId, user.id, dto) }
  }

  @Patch(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit review' })
  async update(@Param('reviewId') id: string, @Body() dto: UpdateReviewDto, @CurrentUser() user: any) {
    return { success: true, data: await this.reviews.update(id, user.id, dto) }
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete review'})
  async remove(@Param('reviewId') id: string, @CurrentUser() user: any) {
    await this.reviews.remove(id, user.id)
    return { success: true, data: { message: 'Review deleted' } }
  }
  
  @Post(':reviewId/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Toggle helpful on a review' })
  async toggleHelpful(@Param('reviewId') id: string, @CurrentUser() user: any) {
    return { success: true, data: await this.reviews.toggleHelpful(id, user.id) }
  }

  @Get(':reviewId/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user liked a review'})
  async checkHelpful(@Param('reviewId') id: string, @CurrentUser() user: any) {
    return { success: true, data: await this.reviews.checkHelpful(id, user.id) }
  }
}
