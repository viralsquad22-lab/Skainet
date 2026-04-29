import { UsersService } from '../users/users.service';
import { BatchesService } from '../batches/batches.service';
import { AlertsService } from '../alerts/alerts.service';
export interface OrderWeights {
    anillo: number;
    plastilina: number;
    bolsa: number;
}
export interface Order {
    id: string;
    ringId: string;
    ringName: string;
    receiverId: string;
    executorId: string;
    weights: OrderWeights;
    totalWeight: number;
    startTime: Date;
    status: 'OPEN' | 'CLOSED';
    finalWeights?: OrderWeights;
    finalTotalWeight?: number;
    loss?: number;
    isAnomaly?: boolean;
    explanation?: string;
    endTime?: Date;
    durationMinutes?: number;
}
export declare class OrdersService {
    private readonly usersService;
    private readonly batchesService;
    private readonly alertsService;
    private orders;
    constructor(usersService: UsersService, batchesService: BatchesService, alertsService: AlertsService);
    create(data: {
        ringId: string;
        receiverId: string;
        executorId: string;
        weights: OrderWeights;
        providedPin?: string;
    }): Order;
    findAll(): Order[];
    findActiveByExecutor(executorId: string): Order | undefined;
    closeOrder(orderId: string, finalWeights: OrderWeights, explanation?: string, providedPin?: string): Order;
    private checkTimeAlerts;
}
