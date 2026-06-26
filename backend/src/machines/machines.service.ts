import { Injectable } from '@nestjs/common';
import { AlertsService } from '../alerts/alerts.service';

export interface Machine {
  id: string;
  name: string;
  type: 'LASER' | 'PRINTER' | 'CAD';
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'DOWN';
  cycles: number;
  maintenanceThreshold: number;
  lastMaintenance: Date;
}

@Injectable()
export class MachinesService {
  private machines: Machine[] = [
    { id: 'M-01', name: 'Láser de Marcado Fibra', type: 'LASER', status: 'OPERATIONAL', cycles: 420, maintenanceThreshold: 500, lastMaintenance: new Date() },
    { id: 'M-02', name: 'Impresora 3D Chitubox', type: 'PRINTER', status: 'OPERATIONAL', cycles: 85, maintenanceThreshold: 100, lastMaintenance: new Date() },
    { id: 'M-03', name: 'Estación Rhino 8', type: 'CAD', status: 'OPERATIONAL', cycles: 0, maintenanceThreshold: 1000, lastMaintenance: new Date() },
  ];

  constructor(private readonly alertsService: AlertsService) {}

  findAll() {
    return this.machines;
  }

  incrementCycles(id: string) {
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

  reportIssue(id: string, issue: string) {
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

  setOperational(id: string) {
    const machine = this.machines.find(m => m.id === id);
    if (machine) {
      machine.status = 'OPERATIONAL';
      machine.cycles = 0;
      machine.lastMaintenance = new Date();
    }
    return machine;
  }
}
