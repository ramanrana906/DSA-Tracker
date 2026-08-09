import { MistakesService } from './mistakes.service';
export declare class MistakesController {
    private readonly mistakesService;
    constructor(mistakesService: MistakesService);
    create(createMistakeDto: any): Promise<{
        createdAt: Date;
        id: number;
        userId: number;
        date: Date;
        problemId: number;
        category: string;
        description: string;
        lesson: string | null;
    }>;
    findAll(category?: string, problemId?: string): Promise<({
        problem: {
            title: string;
        };
    } & {
        createdAt: Date;
        id: number;
        userId: number;
        date: Date;
        problemId: number;
        category: string;
        description: string;
        lesson: string | null;
    })[]>;
    findOne(id: string): Promise<{
        problem: {
            title: string;
        };
    } & {
        createdAt: Date;
        id: number;
        userId: number;
        date: Date;
        problemId: number;
        category: string;
        description: string;
        lesson: string | null;
    }>;
    remove(id: string): Promise<{
        createdAt: Date;
        id: number;
        userId: number;
        date: Date;
        problemId: number;
        category: string;
        description: string;
        lesson: string | null;
    }>;
}
