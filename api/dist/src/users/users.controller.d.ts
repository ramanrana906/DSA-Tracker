import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCurrentUser(): Promise<{
        createdAt: Date;
        id: number;
        name: string;
        email: string;
    }>;
    updateCurrentUser(updateUserDto: {
        name?: string;
    }): Promise<{
        createdAt: Date;
        id: number;
        name: string;
        email: string;
    }>;
}
