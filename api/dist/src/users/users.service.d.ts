import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrentUser(): Promise<{
        createdAt: Date;
        id: number;
        name: string;
        email: string;
    }>;
    updateCurrentUser(data: {
        name?: string;
    }): Promise<{
        createdAt: Date;
        id: number;
        name: string;
        email: string;
    }>;
}
