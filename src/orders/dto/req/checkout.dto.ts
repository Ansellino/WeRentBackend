import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiProperty({
    enum: ['dummy'],
    description:
      'The selected payment method. Currently only "dummy" is supported.',
  })
  @IsIn(['dummy'])
  paymentMethod!: string;

  @ApiProperty({
    example: '123 Adventure Lane, Cityville',
    description: 'The full destination address for the rental delivery.',
  })
  @IsString()
  @IsNotEmpty()
  shippingAddress!: string;

  @ApiProperty({
    example: 'jne-reg',
    description:
      'The ID of the selected courier service. Available: jne-reg, jne-yes, jnt-reg, sicepat, gosend.',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['jne-reg', 'jne-yes', 'jnt-reg', 'sicepat', 'gosend'])
  courierId!: string;
}
