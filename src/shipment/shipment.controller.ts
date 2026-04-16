import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipment: ShipmentService) {}

  @Get('options')
  getOptions(@Query('destination') destination: string) {
    return { success: true, data: this.shipment.getOptions(destination) };
  }

  @Post('estimate')
  estimate(@Body() body: { shippingAddress: string; courierId: string }) {
    const result = this.shipment.estimate(body.shippingAddress, body.courierId);
    return { success: true, data: result };
  }
}
