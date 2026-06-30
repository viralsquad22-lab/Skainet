import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
export class UsersService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.user.count();
    if (count === 0) {
      await this.prisma.user.createMany({
        data: [
          { 
            id: '1', 
            name: 'Ramiro', 
            role: UserRole.JOYERO, 
            status: UserStatus.OFFLINE, 
            password: '123', 
            history: [] as any,
            securityQuestions: [
              { question: '¿Cuál es el nombre de tu primera mascota?', answer: 'Toby' },
              { question: '¿Cuál es tu comida favorita?', answer: 'Pizza' },
              { question: '¿Cuál es tu ciudad de nacimiento?', answer: 'Cali' }
            ] as any
          },
          { id: '2', name: 'Deysi', role: UserRole.JOYERO, status: UserStatus.OFFLINE, password: '123', history: [] as any, securityQuestions: [] as any },
          { id: '3', name: 'Plata', role: UserRole.LIDER, status: UserStatus.OFFLINE, password: '123', history: [] as any, securityQuestions: [] as any },
          { id: '4', name: 'Danna', role: UserRole.ADMIN, status: UserStatus.AVAILABLE, password: '123', phone: '+573000000001', history: [] as any, securityQuestions: [] as any },
          { 
            id: '5', 
            name: 'Viralsquad', 
            role: UserRole.ADMIN, 
            status: UserStatus.AVAILABLE, 
            password: 'admin', 
            phone: '+573000000002', 
            history: [] as any,
            securityQuestions: [
              { question: '¿Cuál es el nombre de tu primera mascota?', answer: 'Toby' },
              { question: '¿Cuál es tu comida favorita?', answer: 'Pizza' },
              { question: '¿Cuál es tu ciudad de nacimiento?', answer: 'Medellin' }
            ] as any
          },
          { id: '6', name: 'David', role: UserRole.DUENO, status: UserStatus.AVAILABLE, password: '123', phone: '+573000000000', history: [] as any, securityQuestions: [] as any },
        ]
      });
      console.log('Seed users completed successfully! 🌱');
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    // Exclude password in list view
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async validatePassword(id: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user && user.password === pass) {
      const { password, ...rest } = user;
      return rest;
    }
    return null;
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    const history = Array.isArray(user.history) ? [...(user.history as any)] : [];
    history.push({ status, timestamp: new Date().toISOString() });

    const updateData: any = { 
      status, 
      history: history as any
    };

    if (status === UserStatus.AVAILABLE) {
      updateData.lastLogin = new Date();
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async create(userData: Partial<User>) {
    if (!userData.id || !userData.name) {
      throw new Error('El ID y el Nombre son obligatorios');
    }
    const existing = await this.prisma.user.findUnique({ where: { id: userData.id } });
    if (existing) {
      throw new Error('El ID de usuario ya existe');
    }
    return this.prisma.user.create({
      data: {
        id: userData.id,
        name: userData.name,
        role: userData.role || UserRole.JOYERO,
        status: userData.status || UserStatus.OFFLINE,
        password: userData.password || '123',
        phone: userData.phone,
        history: (userData.history || []) as any,
        securityQuestions: (userData.securityQuestions || []) as any
      }
    });
  }

  async update(id: string, updateData: Partial<User>) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    return this.prisma.user.update({
      where: { id },
      data: {
        name: updateData.name,
        role: updateData.role,
        password: updateData.password,
        phone: updateData.phone,
        securityQuestions: updateData.securityQuestions as any
      }
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async validateRecovery(id: string, answers: string[]) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || !user.securityQuestions) return null;

    const questions = user.securityQuestions as any[];
    if (questions.length < 3) return null;

    const match = questions.every((q, index) => {
      const provided = answers[index] || '';
      return q.answer.trim().toLowerCase() === provided.trim().toLowerCase();
    });

    if (match) {
      return user;
    }
    return null;
  }
}
