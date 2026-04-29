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
export declare class BatchesService {
    private batches;
    create(entryWeight: number, exitWeight: number, ringsCount: number): Batch;
    findAll(): Batch[];
    findPendingRings(): Ring[];
    getRingById(id: string): Ring | undefined;
}
