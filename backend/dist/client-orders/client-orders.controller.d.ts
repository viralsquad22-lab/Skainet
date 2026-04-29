import { ClientOrdersService } from './client-orders.service';
export declare class ClientOrdersController {
    private readonly clientOrdersService;
    constructor(clientOrdersService: ClientOrdersService);
    findAll(): import("./client-orders.service").ClientOrder[];
    create(body: {
        clientName: string;
        design: string;
        estimatedWeight: number;
        email?: string;
        phone?: string;
    }): import("./client-orders.service").ClientOrder;
    updateStatus(id: string, body: {
        status: 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED';
        stepIndex?: number;
    }): import("./client-orders.service").ClientOrder | undefined;
}
