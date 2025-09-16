import {
  Injectable,
  OnApplicationBootstrap,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import {
  RegisterDto,
  ApproveUserDto,
  ChangePasswordDto,
  CreatePreApprovedUserDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async onApplicationBootstrap() {
    await this.createAdminUser();
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { username },
    });
    if (!!user?.password && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Only allow login for approved users
    if (user.status !== UserStatus.APPROVED) {
      throw new BadRequestException(
        'Account is not approved yet. Please wait for admin approval.',
      );
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if this is a pre-approved user completing registration FIRST
    const preApprovedUser = await this.usersRepository.findOne({
      where: {
        email: registerDto.email,
        isPreApproved: true,
        password: IsNull(), // No password set yet
      },
    });

    if (preApprovedUser) {
      // For pre-approved users, only check if the new username conflicts with OTHER users
      // (not with themselves, since they might want to change their username)
      const existingUsername = await this.usersRepository.findOne({
        where: {
          username: registerDto.username,
          id: Not(preApprovedUser.id), // Exclude the current user
        },
      });
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }

      // Update the pre-approved user with password
      preApprovedUser.password = await bcrypt.hash(registerDto.password, 10);
      preApprovedUser.username = registerDto.username; // Allow username change
      preApprovedUser.status = UserStatus.APPROVED;
      preApprovedUser.isEmailVerified = true;

      await this.usersRepository.save(preApprovedUser);

      const { password, ...result } = preApprovedUser;
      return {
        ...result,
        message: 'Registration completed! You can now log in.',
        requiresApproval: false,
      };
    }

    // For new users, check if username or email already exists
    const existingUsername = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Regular user registration - requires admin approval
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role: 'user',
      status: UserStatus.PENDING,
      isEmailVerified: false,
      isPreApproved: false,
    } as User);

    const savedUser = await this.usersRepository.save(user);

    // Send notification email to admin about new user registration
    try {
      await this.emailService.sendAdminNewUserNotification(
        savedUser.email,
        savedUser.username,
      );
      this.logger.log(
        `Admin notification sent for new user: ${savedUser.username}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send admin notification for user ${savedUser.username}:`,
        error,
      );
      // Don't fail registration if email fails
    }

    // Return user info without password
    const { password, ...result } = savedUser;
    return {
      ...result,
      message:
        'Registration successful! Please wait for admin approval before logging in.',
      requiresApproval: true,
    };
  }

  async approveUser(adminId: string, approveDto: ApproveUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id: approveDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === UserStatus.APPROVED) {
      throw new BadRequestException('User is already approved');
    }

    user.status = approveDto.status;

    if (approveDto.status === UserStatus.APPROVED) {
      user.approvedBy = adminId;
      user.approvedAt = new Date();
      user.isEmailVerified = true;
    } else if (approveDto.status === UserStatus.REJECTED) {
      user.rejectionReason = approveDto.rejectionReason || 'No reason provided';
    }

    await this.usersRepository.save(user);

    // Send email notification to user about approval/rejection
    try {
      if (approveDto.status === UserStatus.APPROVED) {
        await this.emailService.sendUserApprovalNotification(
          user.email,
          user.username,
        );
        this.logger.log(`Approval notification sent to user: ${user.username}`);
      } else if (approveDto.status === UserStatus.REJECTED) {
        await this.emailService.sendUserRejectionNotification(
          user.email,
          user.username,
          user.rejectionReason,
        );
        this.logger.log(
          `Rejection notification sent to user: ${user.username}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send notification to user ${user.username}:`,
        error,
      );
      // Don't fail approval if email fails
    }

    const { password, ...result } = user;
    return result;
  }

  async getPendingUsers() {
    return this.usersRepository.find({
      relations: ['approvedByUser'],
      where: {
        status: UserStatus.PENDING,
        isPreApproved: false, // Exclude pre-approved users
      },
      select: ['id', 'username', 'email', 'createdAt', 'role'],
      order: { createdAt: 'ASC' },
    });
  }

  async getAllUsers() {
    return this.usersRepository.find({
      relations: ['approvedByUser'],
      select: [
        'id',
        'username',
        'email',
        'createdAt',
        'role',
        'status',
        'approvedBy',
        'approvedAt',
        'rejectionReason',
        'isPreApproved',
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid =
      user.password &&
      (await bcrypt.compare(changePasswordDto.currentPassword, user.password));
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async createPreApprovedUser(
    adminId: string,
    createDto: CreatePreApprovedUserDto,
  ) {
    // For pre-approved users, we only need to check email conflicts
    // Username will be set when they complete registration
    const existingEmail = await this.usersRepository.findOne({
      where: { email: createDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Create pre-approved user without username or password
    // Both will be set when they complete registration
    const user = this.usersRepository.create({
      email: createDto.email,
      role: createDto.role || 'user',
      status: UserStatus.PENDING, // Will be approved when they complete registration
      isEmailVerified: true, // Pre-approved emails are considered verified
      isPreApproved: true,
      approvedBy: adminId,
      approvedAt: new Date(),
    });

    const savedUser = await this.usersRepository.save(user);

    const { password, ...result } = savedUser;
    return {
      ...result,
      message:
        'Pre-approved user created successfully. They can now complete registration with a username and password.',
    };
  }

  async getPreApprovedUsers() {
    return this.usersRepository.find({
      relations: ['approvedByUser'],
      where: {
        isPreApproved: true,
        password: IsNull(), // Only users without passwords
      },
      select: [
        'id',
        'username',
        'email',
        'role',
        'createdAt',
        'approvedBy',
        'approvedAt',
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async createAdminUser() {
    const existingAdmin = await this.usersRepository.findOne({
      where: { username: 'admin' },
    });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = this.usersRepository.create({
        username: 'admin',
        email: 'admin@clarasworld.com',
        password: hashedPassword,
        role: 'admin',
        status: UserStatus.APPROVED,
        isEmailVerified: true,
        approvedAt: new Date(),
      });
      await this.usersRepository.save(adminUser);
      console.log('Admin user created: admin/admin123');
    }
  }

  async requestPasswordReset(requestDto: RequestPasswordResetDto) {
    const user = await this.usersRepository.findOne({
      where: { email: requestDto.email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await this.usersRepository.save(user);

    this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
      token: resetToken, // Remove this in production
      expiresAt: resetExpires,
    };
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: {
        passwordResetToken: resetDto.token,
        passwordResetExpires: Not(IsNull()),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Update password and clear reset token
    user.password = await bcrypt.hash(resetDto.newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await this.usersRepository.save(user);

    return {
      message:
        'Password has been reset successfully. You can now log in with your new password.',
    };
  }
}
