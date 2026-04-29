import { NotificationsService } from '../notifications/notifications.service';
export interface Alert {
    id: string;
    type: 'WEIGHT' | 'TIME' | 'SECURITY';
    severity: 'CRITICAL' | 'WARNING';
    message: string;
    timestamp: Date;
    orderId?: string;
    jewelerName: string;
}
export declare class AlertsService {
    private readonly notificationsService;
    private readonly logger;
    private alerts;
    constructor(notificationsService: NotificationsService);
    createAlert(data: Omit<Alert, 'id' | 'timestamp'>): Alert;
    findAll(): Alert[];
    private sendNotifications;
}
