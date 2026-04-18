import { IsNumber, IsOptional, IsString, Min } from "class-validator"
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ProductQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string
}