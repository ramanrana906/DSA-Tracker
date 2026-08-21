import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardAnalytics(): Promise<{
        kpi: {
            totalProblems: number;
            solvedProblems: number;
            masteryPercent: number;
            revisionsCompleted: number;
            avgAttempts: string | number;
        };
        topicProgress: {
            topic: string;
            total: number;
            solved: number;
            mastery: number;
            avgAttempts: string;
        }[];
        patternProgress: {
            pattern: string;
            total: number;
            solved: number;
            mastery: number;
            avgAttempts: string;
        }[];
        mistakeCategories: {
            name: string;
            category: string;
            count: number;
            pct: number;
        }[];
        recentProblems: {
            title: string;
            link: string | null;
            topic: string;
            pattern: string | null;
            difficulty: string;
            sourceList: string | null;
            problemStatement: string | null;
            exampleInput: string | null;
            exampleOutput: string | null;
            constraints: string | null;
            solutionNotes: string | null;
            status: string;
            stage: number;
            firstSolvedAt: Date | null;
            nextRevisionDate: Date | null;
            lastRevisionDate: Date | null;
            masteredAt: Date | null;
            lastOutcome: string | null;
            triggerNote: string | null;
            ease: number;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            userId: number;
        }[];
        streak: number;
        heatmap: {
            date: string;
            count: number;
        }[];
    }>;
}
