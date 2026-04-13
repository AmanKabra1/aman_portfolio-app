import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';
import slugify from 'slugify';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto) {
    // Check if email exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if username exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: registerDto.username.toLowerCase() },
    });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user with portfolio and default theme
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username.toLowerCase(),
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        portfolio: {
          create: {
            slug: slugify(registerDto.username, { lower: true, strict: true }),
            isPublic: false,
            title: `${registerDto.firstName || registerDto.username}'s Portfolio`,
            theme: {
              create: {
                primaryColor: '#3B82F6',
                secondaryColor: '#10B981',
                backgroundColor: '#FFFFFF',
                textColor: '#1F2937',
                template: 'modern',
              },
            },
          },
        },
        settings: {
          create: {
            emailNotifications: true,
            profileVisibility: 'public',
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: 'User registered successfully',
      data: user,
    };
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        portfolio: {
          select: {
            id: true,
            slug: true,
            isPublic: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        portfolio: {
          select: {
            id: true,
            slug: true,
            isPublic: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    // If email is being changed, check if it's available
    if (updateProfileDto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: updateProfileDto.email },
      });

      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      data: user,
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async checkUsernameAvailability(username: string) {
    const existing = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    return {
      success: true,
      data: {
        available: !existing,
        username: username.toLowerCase(),
      },
    };
  }
}