import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { User } from 'src/generated/prisma/client';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's shopping cart" })
  @ApiOkResponse({ description: 'Returns the cart and all included items.' })
  async getCart(@CurrentUser() user: User) {
    return {
      success: true,
      data: await this.cart.getCart(user.id),
    };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a new item to the cart' })
  @ApiCreatedResponse({
    description:
      'The item has been successfully added or incremented in the cart.',
  })
  @ApiBadRequestResponse({
    description: 'Size not available for the selected product.',
  })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  @ApiConflictResponse({
    description: 'The item is unavailable for the selected rental dates.',
  })
  async addItem(@CurrentUser() user: User, @Body() dto: AddCartItemDto) {
    return {
      success: true,
      data: await this.cart.addItem(user.id, dto),
    };
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update an existing item in the cart' })
  @ApiOkResponse({
    description: 'The cart item has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  @ApiConflictResponse({
    description: 'The item is unavailable for the selected rental dates.',
  })
  async updateItem(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return {
      success: true,
      data: await this.cart.updateItem(user.id, id, dto),
    };
  }

  @Delete('items/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiOkResponse({
    description: 'The item was removed from the cart successfully.',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  async removeItem(@CurrentUser() user: User, @Param('id') id: string) {
    await this.cart.removeItem(user.id, id);
    return { success: true, data: { message: 'Item removed from cart' } };
  }
}
