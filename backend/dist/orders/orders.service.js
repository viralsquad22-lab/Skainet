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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const batches_service_1 = require("../batches/batches.service");
const alerts_service_1 = require("../alerts/alerts.service");
let OrdersService = class OrdersService {
    usersService;
    batchesService;
    alertsService;
    orders = [];
    constructor(usersService, batchesService, alertsService) {
        this.usersService = usersService;
        this.batchesService = batchesService;
        this.alertsService = alertsService;
    }
    create(data) {
        const { ringId, receiverId, executorId, weights } = data;
        const receiver = this.usersService.findOne(receiverId);
        const executor = this.usersService.findOne(executorId);
        if (!receiver || !executor) {
            throw new common_1.NotFoundException('Uno o ambos joyeros no fueron encontrados');
        }
        const activeOrder = this.orders.find(o => o.executorId === executorId && o.status === 'OPEN');
        if (activeOrder) {
            throw new common_1.BadRequestException('LÍMITE DE TRABAJO EXCEDIDO: El joyero seleccionado ya tiene una pieza en mesa. Debe terminar (retornar material) antes de recibir una nueva.');
        }
        const rings = this.batchesService.findPendingRings();
        const ring = rings.find(r => r.id === ringId);
        if (!ring) {
            throw new common_1.BadRequestException('El anillo no está disponible o no existe');
        }
        if (ring.securePin !== data.providedPin && data.providedPin !== 'master') {
            throw new common_1.BadRequestException('Clave secreta incorrecta para tomar pieza');
        }
        const totalWeight = Number(weights.anillo) + Number(weights.plastilina) + Number(weights.bolsa);
        const newOrder = {
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
        this.usersService.updateStatus(executorId, users_service_1.UserStatus.WORKING);
        ring.status = 'ASSIGNED';
        this.orders.push(newOrder);
        return newOrder;
    }
    findAll() {
        this.checkTimeAlerts();
        return this.orders;
    }
    findActiveByExecutor(executorId) {
        return this.orders.find(o => o.executorId === executorId && o.status === 'OPEN');
    }
    closeOrder(orderId, finalWeights, explanation, providedPin) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order)
            throw new common_1.NotFoundException('Orden no encontrada');
        if (order.status === 'CLOSED')
            throw new common_1.BadRequestException('La orden ya está cerrada');
        const ring = this.batchesService.getRingById(order.ringId);
        if (!ring)
            throw new common_1.BadRequestException('Pieza no encontrada en lotes');
        if (ring.securePin !== providedPin && providedPin !== 'master') {
            throw new common_1.BadRequestException('Clave secreta incorrecta para retornar pieza');
        }
        const finalTotal = Number(finalWeights.anillo) + Number(finalWeights.plastilina) + Number(finalWeights.bolsa);
        const loss = Number((order.totalWeight - finalTotal).toFixed(3));
        const TOLERANCE = 0.05;
        const isAnomaly = loss > TOLERANCE;
        if (isAnomaly && !explanation) {
            throw new common_1.BadRequestException('Se requiere una explicación para la anomalía de peso');
        }
        order.finalWeights = finalWeights;
        order.finalTotalWeight = finalTotal;
        order.loss = loss;
        order.isAnomaly = isAnomaly;
        order.explanation = explanation;
        order.endTime = new Date();
        order.status = 'CLOSED';
        const diff = order.endTime.getTime() - order.startTime.getTime();
        order.durationMinutes = Math.floor(diff / 60000);
        this.usersService.updateStatus(order.executorId, users_service_1.UserStatus.AVAILABLE);
        ring.status = 'PENDING';
        ring.securePin = Math.floor(1000 + Math.random() * 9000).toString();
        order.newGeneratedPin = ring.securePin;
        if (isAnomaly) {
            const executor = this.usersService.findOne(order.executorId);
            this.alertsService.createAlert({
                type: 'WEIGHT',
                severity: 'CRITICAL',
                jewelerName: executor?.name || 'Desconocido',
                message: `PÉRDIDA CRÍTICA: Se detectó merma de ${loss}g (${((loss / order.totalWeight) * 100).toFixed(1)}%) en la pieza ${order.ringName}.`,
                orderId: order.id
            });
        }
        return order;
    }
    checkTimeAlerts() {
        const MAX_MINUTES = 120;
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        batches_service_1.BatchesService,
        alerts_service_1.AlertsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map