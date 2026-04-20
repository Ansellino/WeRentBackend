import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsUrl,
  IsString,
  MaxLength,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class RegisterDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  name!: string

  @ApiProperty({ example: 'budi@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string

  @ApiProperty({
    example: 'https://avatar.com/budi.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL avatar tidak valid' })
  avatarUrl?: string
}