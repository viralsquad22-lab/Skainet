import { Controller, Get, Patch, Post, Delete, Param, Body, NotFoundException, BadRequestException } from '@nestjs/common';
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

  @Post()
  create(@Body() body: any) {
    try {
      return this.usersService.create(body);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const user = this.usersService.update(id, body);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const success = this.usersService.remove(id);
    if (!success) throw new NotFoundException('Usuario no encontrado');
    return { success };
  }

  @Post(':id/recovery')
  validateRecovery(@Param('id') id: string, @Body('answers') answers: string[]) {
    const user = this.usersService.validateRecovery(id, answers);
    if (!user) throw new BadRequestException('Las respuestas de seguridad son incorrectas o no coinciden.');
    return { 
      success: true, 
      password: user.password // Devolvemos la contraseña para que el usuario pueda verla o usarla para ingresar
    };
  }
}
