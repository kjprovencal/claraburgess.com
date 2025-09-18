import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  ApproveUserDto,
  ChangePasswordDto,
  LoginDto,
  CreatePreApprovedUserDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import { UserStatus } from './entities/user.entity';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minute block
    endpoint: 'login',
  })
  async login(@Body() loginDto: LoginDto) {
    console.log(`[DEBUG] Login attempt for username: ${loginDto.username}`);
    
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    
    console.log(`[DEBUG] User validation result:`, user ? {
      id: user.id,
      username: user.username,
      status: user.status,
      role: user.role
    } : 'null');
    
    if (!user) {
      console.log(`[DEBUG] Login failed: Invalid credentials for ${loginDto.username}`);
      throw new BadRequestException('Invalid credentials');
    }
    
    console.log(`[DEBUG] Login successful for ${loginDto.username}`);
    return this.authService.login(user);
  }

  @Post('register')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 registration attempts per hour (more reasonable for legitimate users)
    blockDurationMs: 30 * 60 * 1000, // 30 minute block (shorter duration)
    endpoint: 'register',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('approve-user')
  async approveUser(
    @Request() req: RequestWithUser,
    @Body() approveDto: ApproveUserDto,
  ) {
    // Only admins can approve users
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.authService.approveUser(req.user.userId, approveDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending-users')
  async getPendingUsers(@Request() req: RequestWithUser) {
    // Only admins can see pending users
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.authService.getPendingUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-users')
  async getAllUsers(@Request() req: RequestWithUser) {
    // Only admins can see all users
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.authService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    // Return current user's profile
    return {
      id: req.user.userId,
      username: req.user.username,
      role: req.user.role,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-pre-approved-user')
  async createPreApprovedUser(
    @Request() req: RequestWithUser,
    @Body() createDto: CreatePreApprovedUserDto,
  ) {
    // Only admins can create pre-approved users
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.authService.createPreApprovedUser(req.user.userId, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pre-approved-users')
  async getPreApprovedUsers(@Request() req: RequestWithUser) {
    // Only admins can see pre-approved users
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.authService.getPreApprovedUsers();
  }

  @Post('request-password-reset')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 password reset requests per hour (more reasonable)
    blockDurationMs: 30 * 60 * 1000, // 30 minute block (shorter duration)
    endpoint: 'password-reset-request',
  })
  async requestPasswordReset(@Body() requestDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestDto);
  }

  @Post('reset-password')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 password reset attempts per 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minute block
    endpoint: 'password-reset',
  })
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }

  @Get('debug/admin-status')
  async getAdminStatus() {
    return this.authService.getAdminStatus();
  }
}
