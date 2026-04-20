import { ApiProperty } from '@nestjs/swagger'

class UserDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  email!: string

  @ApiProperty({ nullable: true, required: false })
  avatarUrl?: string | null
}

export class AuthResponseDto {
  @ApiProperty()
  access_token!: string

  @ApiProperty()
  refresh_token!: string

  @ApiProperty({ type: UserDto })
  user!: UserDto
}