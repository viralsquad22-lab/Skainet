"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("../notifications/notifications.service");
let AlertsService = class AlertsService {
    notificationsService;
    logger = new common_1.Logger('VigilanteDigital');
    alerts = [];
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    createAlert(data) {
        const newAlert = {
            id: `ALT-${Date.now()}`,
            timestamp: new Date(),
            ...data,
        };
        this.alerts.push(newAlert);
        this.sendNotifications(newAlert);
        return newAlert;
    }
    findAll() {
        return this.alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    async sendNotifications(alert) {
        const icon = alert.severity === 'CRITICAL' ? '🚨' : '⚠️';
        const message = `${icon} ALERTA SKYNET: ${alert.message} | Joyero: ${alert.jewelerName}`;
        await this.notificationsService.notifyAdmins(message);
        this.logger.log(`[ALERTA PROCESADA] Notificación enviada a administración.`);
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map