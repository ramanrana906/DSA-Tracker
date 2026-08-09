import { ConceptsService } from './concepts.service';
export declare class ConceptsController {
    private readonly conceptsService;
    constructor(conceptsService: ConceptsService);
    create(createConceptDto: any): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, updateConceptDto: any): Promise<{
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
    remove(id: string): Promise<{
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
