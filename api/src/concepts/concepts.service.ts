import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConceptsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.conceptNote.create({
      data: {
        ...data,
        userId: 1, // Hardcoded for MVP
      },
    });
  }

  async findAll() {
    return this.prisma.conceptNote.findMany({
      where: { userId: 1 },
      orderBy: { pattern: 'asc' },
    });
  }

  async findOne(id: number) {
    const concept = await this.prisma.conceptNote.findUnique({
      where: { id, userId: 1 },
    });
    if (!concept) throw new NotFoundException('Concept Note not found');
    return concept;
  }

  async update(id: number, data: any) {
    return this.prisma.conceptNote.update({
      where: { id, userId: 1 },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.conceptNote.delete({
      where: { id, userId: 1 },
    });
  }
}
