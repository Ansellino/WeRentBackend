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
import { WishlistService } from './wishlist.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AddWishlistDto } from './dto/add-wishlist.dto';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}
  @Get()
  async get(@CurrentUser() user: any) {
    return { success: true, data: await this.wishlist.get(user.id) };
  }

  @Post()
  async add(@CurrentUser() user: any, @Body() dto: AddWishlistDto) {
    const data = await this.wishlist.add(user.id, dto.productId);
    return { success: true, data };
  }

  @Delete(':productId')
  @HttpCode(200)
  async remove(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    await this.wishlist.remove(user.id, productId);
    return { success: true, data: { message: 'Removed from wishlist' } };
  }
}
