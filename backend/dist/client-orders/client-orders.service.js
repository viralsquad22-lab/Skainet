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
exports.ClientOrdersService = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("../notifications/notifications.service");
let ClientOrdersService = class ClientOrdersService {
    notificationsService;
    orders = [];
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    findAll() {
        return this.orders;
    }
    create(name, design, weight, email, phone) {
        const newOrder = {
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
        if (phone) {
            this.notificationsService.notifyClient(phone, name, newOrder.id);
        }
        return newOrder;
    }
    updateStatus(id, status, stepIndex) {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            if (stepIndex !== undefined)
                order.currentStepIndex = stepIndex;
        }
        return order;
    }
};
exports.ClientOrdersService = ClientOrdersService;
exports.ClientOrdersService = ClientOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], ClientOrdersService);
//# sourceMappingURL=client-orders.service.js.map