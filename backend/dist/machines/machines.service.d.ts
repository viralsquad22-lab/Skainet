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
export declare class MachinesService {
    private readonly alertsService;
    private machines;
    constructor(alertsService: AlertsService);
    findAll(): Machine[];
    incrementCycles(id: string): Machine | undefined;
    reportIssue(id: string, issue: string): Machine | undefined;
    setOperational(id: string): Machine | undefined;
}
