"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchesService = void 0;
const common_1 = require("@nestjs/common");
let BatchesService = class BatchesService {
    batches = [];
    create(entryWeight, exitWeight, ringsCount) {
        const batchId = `B-${Date.now()}`;
        const rings = [];
        for (let i = 1; i <= ringsCount; i++) {
            const securePin = Math.floor(1000 + Math.random() * 9000).toString();
            rings.push({
                id: `${batchId}-R${i}`,
                batchId,
                name: `Anillo ${i}`,
                status: 'PENDING',
                securePin,
            });
        }
        const newBatch = {
            id: batchId,
            entryWeight,
            exitWeight,
            ringsCount,
            rings,
            createdAt: new Date(),
        };
        this.batches.push(newBatch);
        return newBatch;
    }
    findAll() {
        return this.batches;
    }
    findPendingRings() {
        return this.batches.flatMap(b => b.rings).filter(r => r.status === 'PENDING');
    }
    getRingById(id) {
        return this.batches.flatMap(b => b.rings).find(r => r.id === id);
    }
};
exports.BatchesService = BatchesService;
exports.BatchesService = BatchesService = __decorate([
    (0, common_1.Injectable)()
], BatchesService);
//# sourceMappingURL=batches.service.js.map