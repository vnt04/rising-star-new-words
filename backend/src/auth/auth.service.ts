import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.usersService.createUser({
      email: dto.email,
      password: passwordHash,
      name: dto.name ?? null,
    });
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    const isValid = user && (await bcrypt.compare(dto.password, user.password));

    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { access_token };
  }
}
