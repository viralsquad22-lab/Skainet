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
  private batches: Batch[] = [
    {
      id: 'B-101',
      entryWeight: 250.00,
      exitWeight: 242.50,
      ringsCount: 5,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      rings: [
        { id: 'B-101-R1', batchId: 'B-101', name: 'Anillo 1', status: 'COMPLETED', securePin: '1111' },
        { id: 'B-101-R2', batchId: 'B-101', name: 'Anillo 2', status: 'COMPLETED', securePin: '2222' },
        { id: 'B-101-R3', batchId: 'B-101', name: 'Anillo 3', status: 'COMPLETED', securePin: '3333' },
        { id: 'B-101-R4', batchId: 'B-101', name: 'Anillo 4', status: 'COMPLETED', securePin: '4444' },
        { id: 'B-101-R5', batchId: 'B-101', name: 'Anillo 5', status: 'COMPLETED', securePin: '5555' },
      ]
    },
    {
      id: 'B-102',
      entryWeight: 180.00,
      exitWeight: 176.80,
      ringsCount: 3,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      rings: [
        { id: 'B-102-R1', batchId: 'B-102', name: 'Anillo 1', status: 'COMPLETED', securePin: '6666' },
        { id: 'B-102-R2', batchId: 'B-102', name: 'Anillo 2', status: 'COMPLETED', securePin: '7777' },
        { id: 'B-102-R3', batchId: 'B-102', name: 'Anillo 3', status: 'PENDING', securePin: '8888' },
      ]
    }
  ];

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
