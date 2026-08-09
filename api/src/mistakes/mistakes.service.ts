import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MistakesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.mistakeEntry.create({
      data: {
        ...data,
        userId: 1, // Hardcoded for MVP
      },
    });
  }

  async findAll(params: any) {
    const where: any = { userId: 1 };
    if (params.category) where.category = params.category;
    if (params.problemId) where.problemId = Number(params.problemId);
    
    return this.prisma.mistakeEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { problem: { select: { title: true } } }
    });
  }

  async findOne(id: number) {
    const mistake = await this.prisma.mistakeEntry.findUnique({
      where: { id, userId: 1 },
      include: { problem: { select: { title: true } } }
    });
    if (!mistake) throw new NotFoundException('Mistake not found');
    return mistake;
  }

  async remove(id: number) {
    return this.prisma.mistakeEntry.delete({
      where: { id, userId: 1 },
    });
  }
}
