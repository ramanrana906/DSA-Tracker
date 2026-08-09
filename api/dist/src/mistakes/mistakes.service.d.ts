import { PrismaService } from '../prisma/prisma.service';
export declare class MistakesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        createdAt: Date;
        id: number;
        userId: number;
        date: Date;
        problemId: number;
        category: string;
        description: string;
        lesson: string | null;
    }>;
    findAll(params: any): Promise<({
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
    findOne(id: number): Promise<{
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
    remove(id: number): Promise<{
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
