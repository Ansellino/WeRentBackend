import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // ================= REGISTER =================
  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'Register success',
    type: AuthResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.auth.register(dto);
  }

  // ================= UPDATE AVATAR =================
  @Put('update-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar updated successfully',
  })
  async updateAvatar(
    @CurrentUser() user: any,
    @Body() data: Partial<RegisterDto>,
  ) {
    return this.auth.updateProfile(user.id, data);
  }

  // ================= LOGIN =================
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login and receive JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login success',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.auth.login(dto);
  }

  // ================= ME =================
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  async me(@CurrentUser() user: any) {
    return this.auth.me(user.id);
  }

  // ================= REFRESH =================
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed',
    schema: {
      example: {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Refresh token required',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refresh_token);
  }

  // ================= LOGOUT =================
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  async logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refresh_token);
  }
}
