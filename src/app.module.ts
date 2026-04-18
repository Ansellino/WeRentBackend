import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { ShipmentModule } from './shipment/shipment.module';
import { UploadModule } from './upload/upload.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OrdersModule,
    CartModule,
    ShipmentModule,
    UploadModule,
    WishlistModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
