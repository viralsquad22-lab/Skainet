import { MachinesService } from './machines.service';
export declare class MachinesController {
    private readonly machinesService;
    constructor(machinesService: MachinesService);
    findAll(): import("./machines.service").Machine[];
    increment(id: string): import("./machines.service").Machine | undefined;
    report(id: string, issue: string): import("./machines.service").Machine | undefined;
    fix(id: string): import("./machines.service").Machine | undefined;
}
