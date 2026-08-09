import { PrismaService } from '../prisma/prisma.service';
export declare class ConceptsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        topic: string;
        pattern: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        coreIdea: string;
        template: string | null;
        variations: string | null;
        pitfalls: string | null;
    }>;
    findAll(): Promise<{
        topic: string;
        pattern: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        coreIdea: string;
        template: string | null;
        variations: string | null;
        pitfalls: string | null;
    }[]>;
    findOne(id: number): Promise<{
        topic: string;
        pattern: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        coreIdea: string;
        template: string | null;
        variations: string | null;
        pitfalls: string | null;
    }>;
    update(id: number, data: any): Promise<{
        topic: string;
        pattern: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        coreIdea: string;
        template: string | null;
        variations: string | null;
        pitfalls: string | null;
    }>;
    remove(id: number): Promise<{
        topic: string;
        pattern: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        coreIdea: string;
        template: string | null;
        variations: string | null;
        pitfalls: string | null;
    }>;
}
