import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductAvailabilityQueryDto } from './dto/product-availability-query.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products' })
  async findAll(@Query() query: ProductQueryDto) {
    const result = await this.products.findAll(query)
    return { 
      success: true,
      ...result,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Product detail' })
  async findOne(@Param('id') id: string) {
    return { 
      success: true, 
      data: await this.products.findOne(id),
    }
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check size and date availability' })
  async availability(@Param('id') id: string, @Query() query: ProductAvailabilityQueryDto) {
    return { 
      success: true, 
      data: await this.products.checkAvailability(id, query), 
    }
  }

  @Get(':id/reviews/summary')
  @ApiOperation({ summary: 'Rating + fit scale summary' })
  async reviewSummary(@Param('id') id: string) {
    return { 
      success: true, 
      data: await this.products.reviewSummary(id), 
    }
  }
}
