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
  private alerts: Alert[] = [];

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
