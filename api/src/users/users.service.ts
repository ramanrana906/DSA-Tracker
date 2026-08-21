import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CURRENT_USER_ID = 1; // Hardcoded for MVP

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getCurrentUser() {
    const user = await this.prisma.user.findUnique({
      where: { id: CURRENT_USER_ID },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateCurrentUser(data: { name?: string }) {
    const updateData: { name?: string } = {};
    if (typeof data.name === 'string' && data.name.trim()) updateData.name = data.name.trim();
    return this.prisma.user.update({
      where: { id: CURRENT_USER_ID },
      data: updateData,
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }
}
