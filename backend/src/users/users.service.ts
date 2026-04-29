import { Injectable } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'Administrador',
  JOYERO = 'Joyero',
  DUENO = 'Dueno',
  LIDER = 'Lider de Taller',
}

export enum UserStatus {
  OFFLINE = 'Fuera de Turno',
  AVAILABLE = 'Disponible',
  WORKING = 'En Proceso',
  PAUSED = 'En Pausa',
}

export interface UserStatusLog {
  status: UserStatus;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  phone?: string;
  lastLogin?: Date;
  history: UserStatusLog[];
}

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: '1', name: 'Ramiro', role: UserRole.JOYERO, status: UserStatus.OFFLINE, password: '123', history: [] },
    { id: '2', name: 'Deysi', role: UserRole.JOYERO, status: UserStatus.OFFLINE, password: '123', history: [] },
    { id: '3', name: 'Plata', role: UserRole.LIDER, status: UserStatus.OFFLINE, password: '123', history: [] },
    { id: '4', name: 'Danna', role: UserRole.ADMIN, status: UserStatus.AVAILABLE, password: '123', phone: '+573000000001', history: [] },
    { id: '5', name: 'Viralsquad', role: UserRole.ADMIN, status: UserStatus.AVAILABLE, password: 'admin', phone: '+573000000002', history: [] },
    { id: '6', name: 'David', role: UserRole.DUENO, status: UserStatus.AVAILABLE, password: '123', phone: '+573000000000', history: [] },
  ];

  findAll() {
    // No devolver contraseñas por seguridad en el listado general
    return this.users.map(({ password, ...user }) => user);
  }

  findOne(id: string) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      const { password, ...rest } = user;
      return rest;
    }
    return null;
  }

  validatePassword(id: string, pass: string) {
    const user = this.users.find(u => u.id === id);
    if (user && user.password === pass) {
      const { password, ...rest } = user;
      return rest;
    }
    return null;
  }

  updateStatus(id: string, status: UserStatus) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.status = status;
      user.history.push({ status, timestamp: new Date() });
      if (status === UserStatus.AVAILABLE) {
        user.lastLogin = new Date();
      }
      return user;
    }
    return null;
  }
}
