"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = exports.UserStatus = exports.UserRole = void 0;
const common_1 = require("@nestjs/common");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "Administrador";
    UserRole["JOYERO"] = "Joyero";
    UserRole["DUENO"] = "Dueno";
    UserRole["LIDER"] = "Lider de Taller";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["OFFLINE"] = "Fuera de Turno";
    UserStatus["AVAILABLE"] = "Disponible";
    UserStatus["WORKING"] = "En Proceso";
    UserStatus["PAUSED"] = "En Pausa";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
let UsersService = class UsersService {
    users = [
        { id: '1', name: 'Ramiro', role: UserRole.JOYERO, status: UserStatus.OFFLINE, password: '123', history: [] },
        { id: '2', name: 'Deysi', role: UserRole.JOYERO, status: UserStatus.OFFLINE, password: '123', history: [] },
        { id: '3', name: 'Plata', role: UserRole.LIDER, status: UserStatus.OFFLINE, password: '123', history: [] },
        { id: '4', name: 'Danna', role: UserRole.ADMIN, status: UserStatus.AVAILABLE, password: '123', phone: '+573000000001', history: [] },
        { id: '5', name: 'Viralsquad', role: UserRole.ADMIN, status: UserStatus.AVAILABLE, password: 'admin', phone: '+573000000002', history: [] },
        { id: '6', name: 'David', role: UserRole.DUENO, status: UserStatus.AVAILABLE, password: '123', phone: '+573000000000', history: [] },
    ];
    findAll() {
        return this.users.map(({ password, ...user }) => user);
    }
    findOne(id) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            const { password, ...rest } = user;
            return rest;
        }
        return null;
    }
    validatePassword(id, pass) {
        const user = this.users.find(u => u.id === id);
        if (user && user.password === pass) {
            const { password, ...rest } = user;
            return rest;
        }
        return null;
    }
    updateStatus(id, status) {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map