import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductAvailabilityQueryDto } from './dto/product-availability-query.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'category', required: false, example: 'Dress' })
  @ApiQuery({ name: 'search', required: false, example: 'Kebaya' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(@Query() query: ProductQueryDto) {
    const result = await this.products.findAll(query)
    return { 
      success: true,
      ...result,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Product detail' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return { 
      success: true, 
      data: await this.products.findOne(id),
    }
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check size and date availability' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiQuery({ name: 'size', required: true, example: 'M' })
  @ApiQuery({ name: 'startDate', required: true, example: '2026-04-18' })
  @ApiQuery({ name: 'rentalDays', required: true, example: 3 })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid size or missing fields' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async availability(@Param('id') id: string, @Query() query: ProductAvailabilityQueryDto) {
    return { 
      success: true, 
      data: await this.products.checkAvailability(id, query), 
    }
  }

  @Get(':id/reviews/summary')
  @ApiOperation({ summary: 'Rating + fit scale summary' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Review summary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async reviewSummary(@Param('id') id: string) {
    return { 
      success: true, 
      data: await this.products.reviewSummary(id), 
    }
  }
}
