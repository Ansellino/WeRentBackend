import { Transform, Type } from "class-transformer"
import { IsBoolean, IsIn, IsNumber, IsOptional, Min } from "class-validator"

export class ReviewQueryDto {
    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    @Min(1)
    page?: number = 1
    
    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10
    
    @IsOptional()
    @Transform(({ value }) => [].concat(value).map(Number))
    rating?: number[]

    @IsOptional()
    @IsIn(['newest', 'helpful'])
    sort?: string = 'newest'

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    hasMedia?: boolean
}