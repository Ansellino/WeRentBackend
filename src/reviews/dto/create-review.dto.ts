import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength, ValidateNested } from 'class-validator';

class MeasurementsDto {
    @ApiProperty()
    @IsInt()
    @Min(40)
    @Max(200)
    bust!: number

    @ApiProperty()
    @IsInt()
    @Min(40)
    @Max(200)
    waist!: number

    @ApiProperty()
    @IsInt()
    @Min(40)
    @Max(200)
    hips!: number
}

export class CreateReviewDto {
    @ApiProperty({ minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number
    
    @ApiProperty()
    @IsString()
    @MinLength(10)
    comment!: string

    @ApiProperty({ enum: ['small', 'true', 'large'] })
    @IsEnum(['small', 'true', 'large'])
    fit!: 'small'|'true'|'large'

    @ApiProperty({ type: MeasurementsDto })
    @ValidateNested()
    @Type(()=>MeasurementsDto)
    measurements!: MeasurementsDto

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    mediaUrls?: string[]
}
