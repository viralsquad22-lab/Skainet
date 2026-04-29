import { UsersService, UserStatus } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): {
        id: string;
        name: string;
        role: import("./users.service").UserRole;
        status: UserStatus;
        phone?: string;
        lastLogin?: Date;
        history: import("./users.service").UserStatusLog[];
    }[];
    findOne(id: string): {
        id: string;
        name: string;
        role: import("./users.service").UserRole;
        status: UserStatus;
        phone?: string;
        lastLogin?: Date;
        history: import("./users.service").UserStatusLog[];
    };
    updateStatus(id: string, status: UserStatus): import("./users.service").User;
    login(body: {
        id: string;
        password: string;
    }): {
        id: string;
        name: string;
        role: import("./users.service").UserRole;
        status: UserStatus;
        phone?: string;
        lastLogin?: Date;
        history: import("./users.service").UserStatusLog[];
    };
}
