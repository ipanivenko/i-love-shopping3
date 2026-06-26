import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: { uid: string, role: Role }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.uid },
      select: {
        id: true,
        email: true,
        name: true,
        twoFactorConfirmedAt: true,
        role: true,
      },
    });

    return user;
  }
}
