import { IsNotEmpty, IsString, IsNumber, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ProductAvailabilityQueryDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    size!: string

    @ApiProperty({ example: '2026-04-18' })
    @IsString()
    @IsNotEmpty()
    startDate!: string

    @ApiProperty()
    @Type(()=>Number)
    @IsNumber()
    @Min(1)
    @Max(30)
    rentalDays!: number
}