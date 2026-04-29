"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachinesService = void 0;
const common_1 = require("@nestjs/common");
const alerts_service_1 = require("../alerts/alerts.service");
let MachinesService = class MachinesService {
    alertsService;
    machines = [
        { id: 'M-01', name: 'Láser de Marcado Fibra', type: 'LASER', status: 'OPERATIONAL', cycles: 420, maintenanceThreshold: 500, lastMaintenance: new Date() },
        { id: 'M-02', name: 'Impresora 3D Chitubox', type: 'PRINTER', status: 'OPERATIONAL', cycles: 85, maintenanceThreshold: 100, lastMaintenance: new Date() },
        { id: 'M-03', name: 'Estación Rhino 8', type: 'CAD', status: 'OPERATIONAL', cycles: 0, maintenanceThreshold: 1000, lastMaintenance: new Date() },
    ];
    constructor(alertsService) {
        this.alertsService = alertsService;
    }
    findAll() {
        return this.machines;
    }
    incrementCycles(id) {
        const machine = this.machines.find(m => m.id === id);
        if (machine) {
            machine.cycles++;
            if (machine.cycles >= machine.maintenanceThreshold) {
                this.alertsService.createAlert({
                    type: 'SECURITY',
                    severity: 'WARNING',
                    jewelerName: 'SISTEMA SKYNET',
                    message: `MANTENIMIENTO REQUERIDO: La máquina ${machine.name} ha alcanzado el límite de ciclos (${machine.cycles}).`,
                });
            }
        }
        return machine;
    }
    reportIssue(id, issue) {
        const machine = this.machines.find(m => m.id === id);
        if (machine) {
            machine.status = 'DOWN';
            this.alertsService.createAlert({
                type: 'SECURITY',
                severity: 'CRITICAL',
                jewelerName: 'TALLER',
                message: `FALLO DE MAQUINARIA: ${machine.name} reporta error: ${issue}. Producción detenida en este proceso.`,
            });
        }
        return machine;
    }
    setOperational(id) {
        const machine = this.machines.find(m => m.id === id);
        if (machine) {
            machine.status = 'OPERATIONAL';
            machine.cycles = 0;
            machine.lastMaintenance = new Date();
        }
        return machine;
    }
};
exports.MachinesService = MachinesService;
exports.MachinesService = MachinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alerts_service_1.AlertsService])
], MachinesService);
//# sourceMappingURL=machines.service.js.map