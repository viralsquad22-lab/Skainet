import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(id: string, pass: string) {
    const user = await this.usersService.validatePassword(id, pass);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = { sub: user.id, username: user.name, role: user.role };
    return {
      ...user,
      access_token: this.jwtService.sign(payload),
    };
  }
}
