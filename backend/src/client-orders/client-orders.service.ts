import { Injectable } from '@nestjs/common';

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

@Injectable()
export class ClientOrdersService {
  private orders: ClientOrder[] = [];

  constructor(private readonly notificationsService: NotificationsService) {}

  findAll() {
    return this.orders;
  }

  create(name: string, design: string, weight: number, email?: string, phone?: string) {
    const newOrder: ClientOrder = {
      id: `P-${Date.now().toString().slice(-4)}`,
      clientName: name,
      email,
      phone,
      design: design,
      estimatedWeight: weight,
      status: 'PENDING',
      currentStepIndex: 0,
      createdAt: new Date(),
    };
    this.orders.push(newOrder);

    // Notificación automática al cliente
    if (phone) {
      this.notificationsService.notifyClient(phone, name, newOrder.id);
    }

    return newOrder;
  }

  updateStatus(id: string, status: 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED', stepIndex?: number) {
    const order = this.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      if (stepIndex !== undefined) order.currentStepIndex = stepIndex;
    }
    return order;
  }
}
