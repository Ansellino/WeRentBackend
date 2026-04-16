import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsUrl } from "class-validator"

export class RegisterDto {
  @IsNotEmpty()
  name!: string

  @IsEmail()
  email!: string

  @MinLength(6)
  password!: string

  @IsOptional()
  @IsUrl()
  avatarUrl?: string
}