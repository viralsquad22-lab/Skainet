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

export interface SecurityQuestion {
  question: string;
  answer: string;
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
  securityQuestions?: SecurityQuestion[];
}

@Injectable()
export class UsersService {
  private users: User[] = [
    { 
      id: '1', 
      name: 'Ramiro', 
      role: UserRole.JOYERO, 
      status: UserStatus.OFFLINE, 
      password: '123', 
      history: [],
      securityQuestions: [
        { question: '¿Cuál es el nombre de tu primera mascota?', answer: 'Toby' },
        { question: '¿Cuál es tu comida favorita?', answer: 'Pizza' },
        { question: '¿Cuál es tu ciudad de nacimiento?', answer: 'Cali' }
      ]
    },
    { id: '2', name: 'Deysi', role: UserRole.JOYERO, status: UserStatus.OFFLINE, password: '123', history: [] },
    { id: '3', name: 'Plata', role: UserRole.LIDER, status: UserStatus.OFFLINE, password: '123', history: [] },
    { id: '4', name: 'Danna', role: UserRole.ADMIN, status: UserStatus.AVAILABLE, password: '123', phone: '+573000000001', history: [] },
    { 
      id: '5', 
      name: 'Viralsquad', 
      role: UserRole.ADMIN, 
      status: UserStatus.AVAILABLE, 
      password: 'admin', 
      phone: '+573000000002', 
      history: [],
      securityQuestions: [
        { question: '¿Cuál es el nombre de tu primera mascota?', answer: 'Toby' },
        { question: '¿Cuál es tu comida favorita?', answer: 'Pizza' },
        { question: '¿Cuál es tu ciudad de nacimiento?', answer: 'Medellin' }
      ]
    },
    { id: '6', name: 'David', role: UserRole.DUENO, status: UserStatus.AVAILABLE, password: '123', phone: '+573000000000', history: [] },
  ];

  findAll() {
    return this.users.map(({ password, ...user }) => user);
  }

  findOne(id: string) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      const { password, ...rest } = user;
      return { ...rest, password }; // Devolver la contraseña en findOne para administración
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

  create(userData: Partial<User>) {
    if (!userData.id || !userData.name) {
      throw new Error('El ID y el Nombre son obligatorios');
    }
    const existing = this.users.find(u => u.id === userData.id);
    if (existing) {
      throw new Error('El ID de usuario ya existe');
    }
    const newUser: User = {
      id: userData.id,
      name: userData.name,
      role: userData.role || UserRole.JOYERO,
      status: userData.status || UserStatus.OFFLINE,
      password: userData.password || '123',
      phone: userData.phone,
      history: [],
      securityQuestions: userData.securityQuestions || []
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: string, updateData: Partial<User>) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    const user = this.users[userIndex];
    const updated = {
      ...user,
      ...updateData,
      id: user.id, // Impedir cambiar el ID para no romper órdenes
      history: user.history
    };
    this.users[userIndex] = updated;
    return updated;
  }

  remove(id: string) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;
    this.users.splice(userIndex, 1);
    return true;
  }

  validateRecovery(id: string, answers: string[]) {
    const user = this.users.find(u => u.id === id);
    if (!user || !user.securityQuestions || user.securityQuestions.length < 3) return null;

    const match = user.securityQuestions.every((q, index) => {
      const provided = answers[index] || '';
      return q.answer.trim().toLowerCase() === provided.trim().toLowerCase();
    });

    if (match) {
      return user; // Devuelve el usuario para poder mostrar la contraseña o restablecerla
    }
    return null;
  }
}
