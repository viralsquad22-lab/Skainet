import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class AlertsService {
  private readonly logger = new Logger('VigilanteDigital');
  private alerts: Alert[] = [
    {
      id: 'ALT-101',
      type: 'WEIGHT',
      severity: 'CRITICAL',
      jewelerName: 'Plata',
      message: 'PÉRDIDA CRÍTICA: Se detectó merma de 0.12g (0.8%) en la pieza Anillo 3 (Lote B-101).',
      orderId: 'ORD-103',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000)
    },
    {
      id: 'ALT-102',
      type: 'TIME',
      severity: 'WARNING',
      jewelerName: 'Ramiro',
      message: 'TIEMPO EXCEDIDO: El joyero lleva 125 min con la pieza Anillo 1 (Lote B-101).',
      orderId: 'ORD-101',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000)
    }
  ];

  constructor(private readonly notificationsService: NotificationsService) {}

  createAlert(data: Omit<Alert, 'id' | 'timestamp'>) {
    const newAlert: Alert = {
      id: `ALT-${Date.now()}`,
      timestamp: new Date(),
      ...data,
    };

    this.alerts.push(newAlert);
    this.sendNotifications(newAlert);
    return newAlert;
  }

  findAll() {
    return this.alerts.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private async sendNotifications(alert: Alert) {
    const icon = alert.severity === 'CRITICAL' ? '🚨' : '⚠️';
    const message = `${icon} ALERTA SKYNET: ${alert.message} | Joyero: ${alert.jewelerName}`;
    
    // Notificar a administración/dueño directamente al celular
    await this.notificationsService.notifyAdmins(message);
    
    this.logger.log(`[ALERTA PROCESADA] Notificación enviada a administración.`);
  }
}
