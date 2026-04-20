import { PartialType } from '@nestjs/swagger';
import { EstimateShipmentDto } from './estimate-shipment.dto';

export class UpdateShipmentDto extends PartialType(EstimateShipmentDto) {}
