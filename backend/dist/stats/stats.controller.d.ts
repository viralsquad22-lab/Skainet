import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getStats(): {
        totalLoss: number;
        ranking: {
            name: string;
            avgMinutes: number;
            completedCount: number;
        }[];
        incidentCount: number;
        totalProduced: number;
        activeWork: number;
    };
}
