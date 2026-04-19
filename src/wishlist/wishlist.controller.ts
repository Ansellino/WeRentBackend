import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AddWishlistDto } from './dto/add-wishlist.dto';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user wishlist',
    description: 'Retrieve all products in the current user wishlist',
  })
  @ApiOkResponse({
    description: 'Wishlist retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'product-id-1',
            name: 'Product Name',
            price: 50000,
            image: 'image-url',
          },
        ],
      },
    },
  })
  async get(@CurrentUser() user: any) {
    return { success: true, data: await this.wishlist.get(user.id) };
  }

  @Post()
  @ApiOperation({
    summary: 'Add product to wishlist',
    description: 'Add a product to the current user wishlist',
  })
  @ApiBody({
    type: AddWishlistDto,
    description: 'Product ID to add to wishlist',
  })
  @ApiOkResponse({
    description: 'Product added to wishlist successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'wishlist-item-id',
          userId: 'user-id',
          productId: 'product-id',
        },
      },
    },
  })
  async add(@CurrentUser() user: any, @Body() dto: AddWishlistDto) {
    const data = await this.wishlist.add(user.id, dto.productId);
    return { success: true, data };
  }

  @Delete(':productId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Remove product from wishlist',
    description: 'Remove a product from the current user wishlist',
  })
  @ApiParam({
    name: 'productId',
    type: 'string',
    description: 'The ID of the product to remove',
  })
  @ApiOkResponse({
    description: 'Product removed from wishlist successfully',
    schema: {
      example: {
        success: true,
        data: {
          message: 'Removed from wishlist',
        },
      },
    },
  })
  async remove(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    await this.wishlist.remove(user.id, productId);
    return { success: true, data: { message: 'Removed from wishlist' } };
  }
}
