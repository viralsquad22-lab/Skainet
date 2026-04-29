import { BatchesService } from './batches.service';
export declare class BatchesController {
    private readonly batchesService;
    constructor(batchesService: BatchesService);
    create(data: {
        entryWeight: number;
        exitWeight: number;
        ringsCount: number;
    }): import("./batches.service").Batch;
    findAll(): import("./batches.service").Batch[];
    findPendingRings(): import("./batches.service").Ring[];
}
