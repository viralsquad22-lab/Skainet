import { Controller, Get, Patch, Post, Delete, Param, Body, NotFoundException, BadRequestException, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { UsersService, UserStatus } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    const user = await this.usersService.updateStatus(id, status);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  @Post('login')
  async login(@Body() body: { id: string; password: string }) {
    return this.authService.login(body.id, body.password);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateUserDto) {
    try {
      return await this.usersService.create(body as any);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    const user = await this.usersService.update(id, body);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    const success = await this.usersService.remove(id);
    if (!success) throw new NotFoundException('Usuario no encontrado');
    return { success };
  }

  @Post(':id/recovery')
  async validateRecovery(@Param('id') id: string, @Body('answers') answers: string[]) {
    const user = await this.usersService.validateRecovery(id, answers);
    if (!user) throw new BadRequestException('Las respuestas de seguridad son incorrectas o no coinciden.');
    return { 
      success: true, 
      password: user.password // Devolvemos la contraseña para que el usuario pueda verla o usarla para ingresar
    };
  }
}
