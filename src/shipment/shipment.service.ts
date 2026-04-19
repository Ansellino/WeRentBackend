import { Injectable } from '@nestjs/common';

const COURIERS = [
  {
    id: 'jne-reg',
    courier: 'JNE',
    service: 'REG',
    label: 'JNE Regular (2–3 days)',
    estimatedDays: 3,
    price: 18000,
  },
  {
    id: 'jne-yes',
    courier: 'JNE',
    service: 'YES',
    label: 'JNE YES (next day)',
    estimatedDays: 1,
    price: 35000,
  },
  {
    id: 'jnt-reg',
    courier: 'JNT',
    service: 'REG',
    label: 'J&T Express (2–3 days)',
    estimatedDays: 3,
    price: 16000,
  },
  {
    id: 'sicepat',
    courier: 'SICEPAT',
    service: 'REG',
    label: 'SiCepat Regular (2–3 days)',
    estimatedDays: 3,
    price: 15000,
  },
  {
    id: 'gosend',
    courier: 'GOSEND',
    service: 'SDS',
    label: 'GoSend Same Day',
    estimatedDays: 1,
    price: 28000,
  },
];

@Injectable()
export class ShipmentService {
  getOptions(destination: string) {
    return COURIERS;
  }

  estimate(shippingAddress: string, courierId: string) {
    const courier = COURIERS.find((c) => c.id === courierId);
    if (!courier) return null;
    return courier;
  }
}
