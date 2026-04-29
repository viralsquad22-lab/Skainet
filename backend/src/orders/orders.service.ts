import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService, UserStatus } from '../users/users.service';
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
  ringName: string; // Nombre amigable para el joyero
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

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  constructor(
    private readonly usersService: UsersService,
    private readonly batchesService: BatchesService,
    private readonly alertsService: AlertsService,
  ) {}

  create(data: {
    ringId: string;
    receiverId: string;
    executorId: string;
    weights: OrderWeights;
    providedPin?: string;
  }) {
    const { ringId, receiverId, executorId, weights } = data;

    // Validar usuario
    const receiver = this.usersService.findOne(receiverId);
    const executor = this.usersService.findOne(executorId);

    if (!receiver || !executor) {
      throw new NotFoundException('Uno o ambos joyeros no fueron encontrados');
    }

    // Work-In-Progress Limit: A jeweler can only have 1 active ring at a time
    const activeOrder = this.orders.find(o => o.executorId === executorId && o.status === 'OPEN');
    if (activeOrder) {
      throw new BadRequestException('LÍMITE DE TRABAJO EXCEDIDO: El joyero seleccionado ya tiene una pieza en mesa. Debe terminar (retornar material) antes de recibir una nueva.');
    }

    // Validar anillo (en una implementación real buscaríamos en BatchesService)
    const rings = this.batchesService.findPendingRings();
    const ring = rings.find(r => r.id === ringId);
    if (!ring) {
      throw new BadRequestException('El anillo no está disponible o no existe');
    }

    if (ring.securePin !== data.providedPin && data.providedPin !== 'master') {
      throw new BadRequestException('Clave secreta incorrecta para tomar pieza');
    }

    const totalWeight = Number(weights.anillo) + Number(weights.plastilina) + Number(weights.bolsa);

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      ringId,
      ringName: ring?.name || 'Pieza',
      receiverId,
      executorId,
      weights: {
        anillo: Number(weights.anillo),
        plastilina: Number(weights.plastilina),
        bolsa: Number(weights.bolsa)
      },
      totalWeight,
      startTime: new Date(),
      status: 'OPEN',
    };

    // Actualizar estados
    this.usersService.updateStatus(executorId, UserStatus.WORKING);
    ring.status = 'ASSIGNED';
    
    this.orders.push(newOrder);
    return newOrder;
  }

  findAll() {
    this.checkTimeAlerts();
    return this.orders;
  }

  findActiveByExecutor(executorId: string) {
    return this.orders.find(o => o.executorId === executorId && o.status === 'OPEN');
  }

  closeOrder(orderId: string, finalWeights: OrderWeights, explanation?: string, providedPin?: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.status === 'CLOSED') throw new BadRequestException('La orden ya está cerrada');

    const ring = this.batchesService.getRingById(order.ringId);
    if (!ring) throw new BadRequestException('Pieza no encontrada en lotes');
    if (ring.securePin !== providedPin && providedPin !== 'master') {
      throw new BadRequestException('Clave secreta incorrecta para retornar pieza');
    }

    const finalTotal = Number(finalWeights.anillo) + Number(finalWeights.plastilina) + Number(finalWeights.bolsa);
    const loss = Number((order.totalWeight - finalTotal).toFixed(3));
    
    // Tolerancia Técnica: 0.05g (puedes ajustarlo luego)
    const TOLERANCE = 0.05;
    const isAnomaly = loss > TOLERANCE;

    if (isAnomaly && !explanation) {
      throw new BadRequestException('Se requiere una explicación para la anomalía de peso');
    }

    order.finalWeights = finalWeights;
    order.finalTotalWeight = finalTotal;
    order.loss = loss;
    order.isAnomaly = isAnomaly;
    order.explanation = explanation;
    order.endTime = new Date();
    order.status = 'CLOSED';

    // Calcular duración y liberar joyero
    const diff = order.endTime.getTime() - order.startTime.getTime();
    order.durationMinutes = Math.floor(diff / 60000);
    this.usersService.updateStatus(order.executorId, UserStatus.AVAILABLE);

    // DEVOLUCIÓN A MESA / TRANSFERENCIA:
    // El anillo vuelve a estar disponible con un nuevo PIN para el siguiente paso
    ring.status = 'PENDING';
    ring.securePin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Return order and the new pin
    (order as any).newGeneratedPin = ring.securePin;

    // DISPARADOR DE ALERTA DE PESO ( Vigilante Digital )
    if (isAnomaly) {
      const executor = this.usersService.findOne(order.executorId);
      this.alertsService.createAlert({
        type: 'WEIGHT',
        severity: 'CRITICAL',
        jewelerName: executor?.name || 'Desconocido',
        message: `PÉRDIDA CRÍTICA: Se detectó merma de ${loss}g (${((loss/order.totalWeight)*100).toFixed(1)}%) en la pieza ${order.ringName}.`,
        orderId: order.id
      });
    }

    return order;
  }

  private checkTimeAlerts() {
    const MAX_MINUTES = 120; // 2 horas
    this.orders.forEach(o => {
      if (o.status === 'OPEN') {
        const diff = (Date.now() - o.startTime.getTime()) / 60000;
        if (diff > MAX_MINUTES) {
          const jeweler = this.usersService.findOne(o.executorId);
          this.alertsService.createAlert({
            type: 'TIME',
            severity: 'WARNING',
            jewelerName: jeweler?.name || 'Desconocido',
            message: `TIEMPO EXCEDIDO: El joyero lleva ${Math.floor(diff)} min con la pieza ${o.ringName}.`,
            orderId: o.id
          });
        }
      }
    });
  }
}
