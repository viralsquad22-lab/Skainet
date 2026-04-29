export interface ClientOrder {
    id: string;
    clientName: string;
    email?: string;
    phone?: string;
    design: string;
    estimatedWeight: number;
    status: 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED';
    currentStepIndex?: number;
    createdAt: Date;
}
export declare class ClientOrdersService {
    private readonly notificationsService;
    private orders;
    constructor(notificationsService: NotificationsService);
    findAll(): ClientOrder[];
    create(name: string, design: string, weight: number, email?: string, phone?: string): ClientOrder;
    updateStatus(id: string, status: 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED', stepIndex?: number): ClientOrder | undefined;
}
