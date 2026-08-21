import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardAnalytics() {
    const userId = 1; // MVP Hardcoded

    // 1. Get all problems for the user
    const problems = await this.prisma.problem.findMany({
      where: { userId },
      include: { attempts: true, revisionLogs: true },
    });

    const totalProblems = problems.length;
    const solvedProblems = problems.filter(p => p.firstSolvedAt !== null).length;
    const masteredProblems = problems.filter(p => p.status === 'MASTERED').length;
    const masteryPercent = totalProblems === 0 ? 0 : Math.round((masteredProblems / totalProblems) * 100);

    // 2. Count Revisions
    const revisionsCompleted = await this.prisma.revisionLog.count({
      where: { problem: { userId } }
    });

    // 3. Avg Attempts
    let totalAttempts = 0;
    problems.forEach(p => {
      totalAttempts += p.attempts.length + p.revisionLogs.length;
    });
    const avgAttempts = totalProblems === 0 ? 0 : (totalAttempts / totalProblems).toFixed(1);

    // 4. Topic Progress
    const topicMap: Record<string, { total: number, solved: number, mastered: number, attempts: number }> = {};
    const patternMap: Record<string, { total: number, solved: number, mastered: number, attempts: number }> = {};

    problems.forEach(p => {
      // Topic
      const topics = p.topic.split(',').map(t => t.trim());
      topics.forEach(t => {
        if (!topicMap[t]) topicMap[t] = { total: 0, solved: 0, mastered: 0, attempts: 0 };
        topicMap[t].total++;
        if (p.firstSolvedAt) topicMap[t].solved++;
        if (p.status === 'MASTERED') topicMap[t].mastered++;
        topicMap[t].attempts += p.attempts.length + p.revisionLogs.length;
      });

      // Pattern
      if (p.pattern) {
        const patterns = p.pattern.split(',').map(pat => pat.trim());
        patterns.forEach(pat => {
          if (!patternMap[pat]) patternMap[pat] = { total: 0, solved: 0, mastered: 0, attempts: 0 };
          patternMap[pat].total++;
          if (p.firstSolvedAt) patternMap[pat].solved++;
          if (p.status === 'MASTERED') patternMap[pat].mastered++;
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

    // 5. Mistake Categories
    const mistakes = await this.prisma.mistakeEntry.findMany({
      where: { userId },
    });
    const mistakeCatMap: Record<string, number> = {};
    mistakes.forEach(m => {
      mistakeCatMap[m.category] = (mistakeCatMap[m.category] || 0) + 1;
    });
    const totalMistakes = mistakes.length;
    const mistakeCategories = Object.keys(mistakeCatMap)
      .map(cat => ({
        name: cat.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: cat,
        count: mistakeCatMap[cat],
        pct: totalMistakes === 0 ? 0 : Math.round((mistakeCatMap[cat] / totalMistakes) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // 6. Recent Problems (for "Recently Added" list)
    const recentProblems = await this.prisma.problem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 7. Streak calculation (count consecutive days with at least 1 attempt or revision)
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
    
    const activeDays = new Set<string>();
    const dayCounts: Record<string, number> = {};
    allAttempts.forEach(a => {
      const key = new Date(a.date).toISOString().split('T')[0];
      activeDays.add(key);
      dayCounts[key] = (dayCounts[key] || 0) + 1;
    });
    allRevisions.forEach(r => {
      const key = new Date(r.completedDate).toISOString().split('T')[0];
      activeDays.add(key);
      dayCounts[key] = (dayCounts[key] || 0) + 1;
    });

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (activeDays.has(key)) {
        streak++;
      } else if (i > 0) {
        break; // streak broken
      }
    }

    // 8. Contribution heatmap (last 371 days, oldest first, so the UI can lay
    // it out as a GitHub-style 53-week grid)
    const heatmap: { date: string; count: number }[] = [];
    for (let i = 370; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      heatmap.push({ date: key, count: dayCounts[key] || 0 });
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
      heatmap,
    };
  }
}
