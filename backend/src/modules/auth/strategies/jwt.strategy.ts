import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // ✅ FIRST check admin
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.id },
    });

    if (admin) {
      return {
        id: admin.id,
        email: admin.email,
        role: 'admin',
      };
    }

    // ✅ THEN check user
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (user) {
      return {
        id: user.id,
        email: user.email,
        role: 'user',
      };
    }

    throw new UnauthorizedException('Invalid token');
  }
}
