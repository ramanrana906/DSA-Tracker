import { PrismaService } from '../prisma/prisma.service';
import { ProblemsService } from './problems.service';

describe('ProblemsService spaced repetition lifecycle', () => {
  const dueAt = new Date('2026-08-14T10:00:00.000Z');
  const baseProblem = {
    id: 1,
    userId: 1,
    title: 'Search a 2D Matrix',
    status: 'DUE',
    stage: 1,
    firstSolvedAt: new Date('2026-08-09T10:00:00.000Z'),
    nextRevisionDate: dueAt,
    masteredAt: null,
    attempts: [],
    revisionLogs: [],
    mistakeEntries: [],
  };

  let prisma: {
    problem: { findUnique: jest.Mock; update: jest.Mock };
    attempt: { create: jest.Mock };
    revisionLog: { create: jest.Mock };
    mistakeEntry: { create: jest.Mock };
  };
  let service: ProblemsService;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-15T10:00:00.000Z'));
    prisma = {
      problem: {
        findUnique: jest.fn().mockResolvedValue({ ...baseProblem }),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...baseProblem, ...data })),
      },
      attempt: { create: jest.fn().mockResolvedValue({}) },
      revisionLog: { create: jest.fn().mockResolvedValue({}) },
      mistakeEntry: { create: jest.fn().mockResolvedValue({}) },
    };
    service = new ProblemsService(prisma as unknown as PrismaService);
  });

  afterEach(() => jest.useRealTimers());

  it('keeps the same revision and due date after a failed recall', async () => {
    const result = await service.logRevision(1, {
      outcome: 'FORGOT',
      assessment: 'COULDNT_SOLVE',
    });

    expect(prisma.revisionLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ stageBefore: 1, stageAfter: 1 }),
    }));
    expect(result).toMatchObject({ stage: 1, status: 'DUE', nextRevisionDate: dueAt });
  });

  it.each([
    [0, 1, '2026-08-19T10:00:00.000Z'],
    [1, 2, '2026-08-22T10:00:00.000Z'],
    [2, 3, '2026-09-14T10:00:00.000Z'],
  ])('advances stage %i and schedules stage %i from successful completion', async (stageBefore, stageAfter, expectedDate) => {
    prisma.problem.findUnique.mockResolvedValue({ ...baseProblem, stage: stageBefore });

    const result = await service.logRevision(1, { outcome: 'RECALLED', assessment: 'EFFORT' });

    expect(result).toMatchObject({
      stage: stageAfter,
      status: 'IN_PROGRESS',
      nextRevisionDate: new Date(expectedDate),
    });
  });

  it('marks the problem mastered after a successful Revision 4', async () => {
    prisma.problem.findUnique.mockResolvedValue({ ...baseProblem, stage: 3 });

    const result = await service.logRevision(1, { outcome: 'RECALLED', assessment: 'EASY' });

    expect(result).toMatchObject({ stage: 4, status: 'MASTERED', nextRevisionDate: null });
    expect(result.masteredAt).toEqual(new Date('2026-08-15T10:00:00.000Z'));
  });

  it('automatically schedules Revision 1 one day after the first solve', async () => {
    prisma.problem.findUnique.mockResolvedValue({
      ...baseProblem,
      stage: 0,
      status: 'UNSOLVED',
      firstSolvedAt: null,
      nextRevisionDate: null,
    });

    const result = await service.logAttempt(1, { outcome: 'SOLVED', timeTaken: 62 });

    expect(result.nextRevisionDate).toEqual(new Date('2026-08-16T10:00:00.000Z'));
    expect(result.status).toBe('IN_PROGRESS');
  });
});
