"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardAnalytics() {
        const userId = 1;
        const problems = await this.prisma.problem.findMany({
            where: { userId },
            include: { attempts: true, revisionLogs: true },
        });
        const totalProblems = problems.length;
        const solvedProblems = problems.filter(p => p.firstSolvedAt !== null).length;
        const masteredProblems = problems.filter(p => p.status === 'MASTERED').length;
        const masteryPercent = totalProblems === 0 ? 0 : Math.round((masteredProblems / totalProblems) * 100);
        const revisionsCompleted = await this.prisma.revisionLog.count({
            where: { problem: { userId } }
        });
        let totalAttempts = 0;
        problems.forEach(p => {
            totalAttempts += p.attempts.length + p.revisionLogs.length;
        });
        const avgAttempts = totalProblems === 0 ? 0 : (totalAttempts / totalProblems).toFixed(1);
        const topicMap = {};
        const patternMap = {};
        problems.forEach(p => {
            const topics = p.topic.split(',').map(t => t.trim());
            topics.forEach(t => {
                if (!topicMap[t])
                    topicMap[t] = { total: 0, solved: 0, mastered: 0, attempts: 0 };
                topicMap[t].total++;
                if (p.firstSolvedAt)
                    topicMap[t].solved++;
                if (p.status === 'MASTERED')
                    topicMap[t].mastered++;
                topicMap[t].attempts += p.attempts.length + p.revisionLogs.length;
            });
            if (p.pattern) {
                const patterns = p.pattern.split(',').map(pat => pat.trim());
                patterns.forEach(pat => {
                    if (!patternMap[pat])
                        patternMap[pat] = { total: 0, solved: 0, mastered: 0, attempts: 0 };
                    patternMap[pat].total++;
                    if (p.firstSolvedAt)
                        patternMap[pat].solved++;
                    if (p.status === 'MASTERED')
                        patternMap[pat].mastered++;
                    patternMap[pat].attempts += p.attempts.length + p.revisionLogs.length;
                });
            }
        });
        const topicProgress = Object.keys(topicMap).map(t => ({
            topic: t,
            total: topicMap[t].total,
            solved: topicMap[t].solved,
            mastery: Math.round((topicMap[t].mastered / topicMap[t].total) * 100),
            avgAttempts: (topicMap[t].attempts / topicMap[t].total).toFixed(1),
        })).sort((a, b) => b.total - a.total);
        const patternProgress = Object.keys(patternMap).map(p => ({
            pattern: p,
            total: patternMap[p].total,
            solved: patternMap[p].solved,
            mastery: Math.round((patternMap[p].mastered / patternMap[p].total) * 100),
            avgAttempts: (patternMap[p].attempts / patternMap[p].total).toFixed(1),
        })).sort((a, b) => b.total - a.total);
        const mistakes = await this.prisma.mistakeEntry.findMany({
            where: { userId },
        });
        const mistakeCatMap = {};
        mistakes.forEach(m => {
            mistakeCatMap[m.category] = (mistakeCatMap[m.category] || 0) + 1;
        });
        const totalMistakes = mistakes.length;
        const mistakeCategories = Object.keys(mistakeCatMap)
            .map(cat => ({
            name: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category: cat,
            count: mistakeCatMap[cat],
            pct: totalMistakes === 0 ? 0 : Math.round((mistakeCatMap[cat] / totalMistakes) * 100),
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
        const recentProblems = await this.prisma.problem.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        const allAttempts = await this.prisma.attempt.findMany({
            where: { problem: { userId } },
            orderBy: { date: 'desc' },
            select: { date: true },
        });
        const allRevisions = await this.prisma.revisionLog.findMany({
            where: { problem: { userId } },
            orderBy: { completedDate: 'desc' },
            select: { completedDate: true },
        });
        const activeDays = new Set();
        allAttempts.forEach(a => activeDays.add(new Date(a.date).toISOString().split('T')[0]));
        allRevisions.forEach(r => activeDays.add(new Date(r.completedDate).toISOString().split('T')[0]));
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (activeDays.has(key)) {
                streak++;
            }
            else if (i > 0) {
                break;
            }
        }
        return {
            kpi: {
                totalProblems,
                solvedProblems,
                masteryPercent,
                revisionsCompleted,
                avgAttempts,
            },
            topicProgress,
            patternProgress,
            mistakeCategories,
            recentProblems,
            streak,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map