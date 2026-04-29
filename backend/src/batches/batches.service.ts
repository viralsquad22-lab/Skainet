import { Injectable } from '@nestjs/common';

export interface Ring {
  id: string;
  batchId: string;
  name: string;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED';
  securePin: string;
}

export interface Batch {
  id: string;
  entryWeight: number;
  exitWeight: number;
  ringsCount: number;
  rings: Ring[];
  createdAt: Date;
}

@Injectable()
export class BatchesService {
  private batches: Batch[] = [];

  create(entryWeight: number, exitWeight: number, ringsCount: number) {
    const batchId = `B-${Date.now()}`;
    const rings: Ring[] = [];

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

    const newBatch: Batch = {
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

  getRingById(id: string) {
    return this.batches.flatMap(b => b.rings).find(r => r.id === id);
  }
}
