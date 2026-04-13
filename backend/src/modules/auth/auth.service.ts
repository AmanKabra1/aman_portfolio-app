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

    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: account.id,
          email: account.email,
          role,
        },
      },
    };
  }

  async getMe(adminId: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
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
      data: admin,
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
