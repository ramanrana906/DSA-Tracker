import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const FIRST_REVISION_INTERVAL_DAYS = 1;
const NEXT_REVISION_INTERVAL_DAYS: Record<number, number> = {
  1: 4,
  2: 7,
  3: 30,
};
const MASTERED_STAGE = 4;

// Adaptive spaced-repetition: `ease` scales the base interval for a stage.
// A confident recall stretches future gaps; a shaky one compresses them.
const EASE_MIN = 0.6;
const EASE_MAX = 1.8;
const EASE_EASY_DELTA = 0.15;
const EASE_MOSTLY_FORGOT_DELTA = -0.15;
const EASE_COULDNT_SOLVE_DELTA = -0.25;

const LEECH_THRESHOLD = 3;

function addDays(base: Date, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function clampEase(value: number) {
  return Math.min(EASE_MAX, Math.max(EASE_MIN, value));
}

function withDerivedStatus<T extends { status: string; nextRevisionDate: Date | null }>(problem: T): T {
  if (problem.status === 'MASTERED' || problem.status === 'UNSOLVED') return problem;
  const status = problem.nextRevisionDate && problem.nextRevisionDate <= new Date() ? 'DUE' : 'IN_PROGRESS';
  return { ...problem, status };
}

@Injectable()
export class ProblemsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const tagNames: string[] = Array.isArray(data.tags) ? data.tags.map((t: string) => t.trim()).filter(Boolean) : [];
    return this.prisma.problem.create({
      data: {
        title: data.title,
        link: data.link,
        topic: data.topic,
        pattern: data.pattern,
        difficulty: data.difficulty,
        sourceList: data.sourceList,
        problemStatement: data.problemStatement,
        exampleInput: data.exampleInput,
        exampleOutput: data.exampleOutput,
        constraints: data.constraints,
        solutionNotes: data.solutionNotes,
        triggerNote: data.triggerNote,
        userId: 1, // Hardcoded for MVP
        status: 'UNSOLVED',
        stage: 0,
        tags: tagNames.length
          ? {
              connectOrCreate: tagNames.map((name) => ({
                where: { userId_name: { userId: 1, name } },
                create: { name, userId: 1 },
              })),
            }
          : undefined,
      },
      include: { tags: true },
    });
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    const editableFields = [
      'title', 'link', 'topic', 'pattern', 'difficulty', 'sourceList',
      'problemStatement', 'exampleInput', 'exampleOutput', 'constraints',
      'solutionNotes', 'triggerNote',
    ];
    for (const field of editableFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (Array.isArray(data.tags)) {
      const tagNames: string[] = data.tags.map((t: string) => t.trim()).filter(Boolean);
      updateData.tags = {
        set: [],
        connectOrCreate: tagNames.map((name) => ({
          where: { userId_name: { userId: 1, name } },
          create: { name, userId: 1 },
        })),
      };
    }
    return this.prisma.problem.update({
      where: { id },
      data: updateData,
      include: { tags: true },
    });
  }

  async findAll(params: any) {
    const where: any = { userId: 1 };
    if (params.status) where.status = params.status;
    if (params.topic) where.topic = params.topic;
    if (params.pattern) where.pattern = params.pattern;
    if (params.difficulty) where.difficulty = params.difficulty;
    if (params.sourceList) where.sourceList = params.sourceList;
    if (params.tag) where.tags = { some: { name: params.tag } };
    if (params.search) where.title = { contains: params.search };

    const problems = await this.prisma.problem.findMany({
      where,
      include: {
        tags: true,
        revisionLogs: { where: { outcome: 'FORGOT' }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    return problems.map((problem) => {
      const forgotCount = problem.revisionLogs.length;
      const { revisionLogs, ...rest } = problem;
      return withDerivedStatus({
        ...rest,
        forgotCount,
        isLeech: forgotCount >= LEECH_THRESHOLD && problem.status !== 'MASTERED',
      });
    });
  }

  async listTags() {
    return this.prisma.tag.findMany({ where: { userId: 1 }, orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const problem = await this.prisma.problem.findUnique({
      where: { id, userId: 1 },
      include: {
        attempts: { orderBy: { date: 'desc' } },
        revisionLogs: { orderBy: { completedDate: 'desc' } },
        mistakeEntries: { orderBy: { date: 'desc' } },
        tags: true,
      }
    });
    if (!problem) throw new NotFoundException('Problem not found');
    const forgotCount = problem.revisionLogs.filter((r) => r.outcome === 'FORGOT').length;
    return withDerivedStatus({
      ...problem,
      forgotCount,
      isLeech: forgotCount >= LEECH_THRESHOLD && problem.status !== 'MASTERED',
    });
  }

  async findDueForRevision() {
    const now = new Date();

    return this.prisma.problem.findMany({
      where: {
        userId: 1,
        nextRevisionDate: { lte: now },
        status: { notIn: ['UNSOLVED', 'MASTERED'] }
      },
      orderBy: { nextRevisionDate: 'asc' }
    }).then((problems) => problems.map((problem) => ({ ...problem, status: 'DUE' })));
  }

  // 1. Fresh Attempt (SOLVED or STRUGGLED)
  async logAttempt(id: number, data: { outcome: 'SOLVED' | 'STRUGGLED', timeTaken?: number, approach?: string, thoughts?: string, complexity?: string, code?: string, triggerNote?: string, notes?: string, mistake?: { category: string, description: string } }) {
    const problem = await this.findOne(id);

    // Create attempt
    await this.prisma.attempt.create({
      data: {
        problemId: id,
        outcome: data.outcome,
        timeTaken: data.timeTaken ? Number(data.timeTaken) : null,
        approach: data.approach,
        thoughts: data.thoughts,
        complexity: data.complexity,
        code: data.code,
        triggerNote: data.triggerNote,
        notes: data.notes,
      }
    });

    if (data.mistake) {
      await this.prisma.mistakeEntry.create({
        data: {
          problemId: id,
          userId: 1, // Hardcoded for MVP
          category: data.mistake.category,
          description: data.mistake.description
        }
      });
    }

    // Update problem
    const updateData: any = {
      lastOutcome: data.outcome,
      triggerNote: data.triggerNote || problem.triggerNote,
    };

    if (data.outcome === 'SOLVED') {
      const solvedAt = problem.firstSolvedAt || new Date();
      const nextRevisionDate = addDays(solvedAt, FIRST_REVISION_INTERVAL_DAYS);
      updateData.status = 'IN_PROGRESS';
      updateData.stage = 0;
      updateData.firstSolvedAt = solvedAt;
      updateData.nextRevisionDate = nextRevisionDate;
      updateData.masteredAt = null;
    } else {
      updateData.status = problem.firstSolvedAt ? problem.status : 'UNSOLVED';
    }

    return this.prisma.problem.update({
      where: { id },
      data: updateData,
    });
  }

  // 2. Revision Attempt (RECALLED or FORGOT)
  async logRevision(id: number, data: { outcome: 'RECALLED' | 'FORGOT', assessment?: string, recallTime?: number, thoughts?: string, code?: string, approach?: string, timeComplexity?: string, spaceComplexity?: string, complexityReason?: string, mistake?: { category: string, description: string } }) {
    const problem = await this.findOne(id);
    if (!problem.nextRevisionDate) {
      throw new BadRequestException('Revision 1 must be scheduled before recording a revision');
    }
    if (problem.status === 'MASTERED' || problem.stage >= MASTERED_STAGE) {
      throw new BadRequestException('This problem is already mastered');
    }
    if (!problem.firstSolvedAt) {
      // Data was scheduled for revision but firstSolvedAt was never recorded; backfill it
      // from the revision schedule so the record stays internally consistent.
      problem.firstSolvedAt = addDays(problem.nextRevisionDate, -FIRST_REVISION_INTERVAL_DAYS);
    }

    const stageBefore = problem.stage;
    let stageAfter = stageBefore;
    let nextDate: Date | null = problem.nextRevisionDate;
    let status = 'DUE';
    let masteredAt: Date | null = null;
    const completedAt = new Date();

    // Adjust the ease multiplier from how the recall actually went, not just
    // whether it succeeded, so a confident recall earns a longer gap next
    // time and a shaky one gets checked again sooner.
    let ease = problem.ease;
    if (data.outcome === 'RECALLED') {
      ease = clampEase(ease + (data.assessment === 'EASY' ? EASE_EASY_DELTA : 0));
      stageAfter = stageBefore + 1;
      if (stageAfter >= MASTERED_STAGE) {
        stageAfter = MASTERED_STAGE;
        nextDate = null;
        status = 'MASTERED';
        masteredAt = completedAt;
      } else {
        const baseInterval = NEXT_REVISION_INTERVAL_DAYS[stageAfter];
        const scaledInterval = Math.max(1, Math.round(baseInterval * ease));
        nextDate = addDays(completedAt, scaledInterval);
        status = 'IN_PROGRESS';
      }
    } else {
      const delta = data.assessment === 'COULDNT_SOLVE' ? EASE_COULDNT_SOLVE_DELTA : EASE_MOSTLY_FORGOT_DELTA;
      ease = clampEase(ease + delta);
    }

    // Create Revision Log
    await this.prisma.revisionLog.create({
      data: {
        problemId: id,
        stageBefore,
        stageAfter,
        outcome: data.outcome,
        scheduledDate: problem.nextRevisionDate,
        assessment: data.assessment,
        recallTime: data.recallTime,
        thoughts: data.thoughts,
        code: data.code,
        approach: data.approach,
        timeComplexity: data.timeComplexity,
        spaceComplexity: data.spaceComplexity,
        complexityReason: data.complexityReason,
      }
    });

    if (data.mistake) {
      await this.prisma.mistakeEntry.create({
        data: {
          problemId: id,
          userId: 1,
          category: data.mistake.category,
          description: data.mistake.description
        }
      });
    }

    // Update Problem
    return this.prisma.problem.update({
      where: { id },
      data: {
        firstSolvedAt: problem.firstSolvedAt,
        stage: stageAfter,
        nextRevisionDate: nextDate,
        lastRevisionDate: completedAt,
        masteredAt,
        lastOutcome: data.outcome,
        status,
        ease,
      }
    });
  }
}
