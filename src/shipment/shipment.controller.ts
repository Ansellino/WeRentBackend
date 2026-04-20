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

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EstimateShipmentDto } from './dto/estimate-shipment.dto';

@UseGuards(JwtAuthGuard)
@ApiTags('Shipment')
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipment: ShipmentService) {}

  @Get('options')
  @ApiOperation({ summary: 'Get shipping options based on destination' })
  @ApiResponse({
    status: 201,
    description: 'Success mengestimasi biaya.',
    schema: {
      example: {
        success: true,
        data: {
          id: 'jne-reg',
          courier: 'JNE',
          service: 'REG',
          label: 'JNE Regular (2–3 days)',
          estimatedDays: 3,
          price: 18000,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Input tidak valid.' })
  getOptions(@Query('destination') destination: string) {
    return { success: true, data: this.shipment.getOptions(destination) };
  }

  @Post('estimate')
  @ApiOperation({ summary: 'Estimate shipping cost' })
  @ApiBody({ type: EstimateShipmentDto })
  @ApiResponse({
    status: 201,
    description: 'Success mengestimasi biaya.',
    schema: {
      example: {
        success: true,
        data: {
          id: 'jne-reg',
          price: 18000,
          estimatedDays: 3,
          label: 'JNE Regular (2–3 days)',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Input tidak valid.' })
  estimate(@Body() data: EstimateShipmentDto) {
    const result = this.shipment.estimate(data.shippingAddress, data.courierId);
    return { success: true, data: result };
  }
}
