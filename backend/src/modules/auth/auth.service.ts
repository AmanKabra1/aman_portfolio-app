import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '../users/dto/register.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const account = admin || user;

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      account.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const role = admin ? 'admin' : 'user';

    const token = this.jwtService.sign({
      id: account.id,
      email: account.email,
      role,
    });

    let userData: any = {
      id: account.id,
      email: account.email,
      role,
    };

    if (role === 'user') {
      const fullUser = await this.prisma.user.findUnique({
        where: { id: account.id },
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
              title: true,
            },
          },
        },
      });
      userData = fullUser;
    } else {
      userData.name = admin.name;
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userData,
      },
    };
  }

  async getMe(userId: number, role: string) {
    if (role === 'admin') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      if (!admin) {
        throw new UnauthorizedException('Admin not found');
      }

      return {
        success: true,
        message: 'Admin retrieved successfully',
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'admin',
        },
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        role: true,
        portfolio: {
          select: {
            id: true,
            slug: true,
            isPublic: true,
            title: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      message: 'User retrieved successfully',
      data: {
        ...user,
        role: user.role || 'user',
      },
    };
  }

  async registerAdmin(registerDto: RegisterDto) {
    // Check email exists
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email: registerDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        name: registerDto.firstName || 'Admin',
        email: registerDto.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      success: true,
      message: 'Admin registered successfully',
      data: admin,
    };
  }

  async register(registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }
}
