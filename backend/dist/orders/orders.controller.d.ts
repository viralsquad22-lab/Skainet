import { OrdersService, OrderWeights } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(data: {
        ringId: string;
        receiverId: string;
        executorId: string;
        weights: OrderWeights;
        providedPin?: string;
    }): import("./orders.service").Order;
    findAll(): import("./orders.service").Order[];
    findActive(executorId: string): import("./orders.service").Order | undefined;
    close(id: string, body: {
        weights: OrderWeights;
        explanation?: string;
        providedPin?: string;
    }): import("./orders.service").Order;
}
