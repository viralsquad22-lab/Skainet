import { Controller, Get, Patch, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { UsersService, UserStatus } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const user = this.usersService.findOne(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    const user = this.usersService.updateStatus(id, status);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  @Post('login')
  login(@Body() body: { id: string; password: string }) {
    const user = this.usersService.validatePassword(body.id, body.password);
    if (!user) throw new NotFoundException('Credenciales inválidas');
    return user;
  }
}
