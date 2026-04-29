export declare enum UserRole {
    ADMIN = "Administrador",
    JOYERO = "Joyero",
    DUENO = "Dueno",
    LIDER = "Lider de Taller"
}
export declare enum UserStatus {
    OFFLINE = "Fuera de Turno",
    AVAILABLE = "Disponible",
    WORKING = "En Proceso",
    PAUSED = "En Pausa"
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
export declare class UsersService {
    private users;
    findAll(): {
        id: string;
        name: string;
        role: UserRole;
        status: UserStatus;
        phone?: string;
        lastLogin?: Date;
        history: UserStatusLog[];
    }[];
    findOne(id: string): {
        id: string;
        name: string;
        role: UserRole;
        status: UserStatus;
        phone?: string;
        lastLogin?: Date;
        history: UserStatusLog[];
    } | null;
    validatePassword(id: string, pass: string): {
        id: string;
        name: string;
        role: UserRole;
        status: UserStatus;
        phone?: string;
        lastLogin?: Date;
        history: UserStatusLog[];
    } | null;
    updateStatus(id: string, status: UserStatus): User | null;
}
