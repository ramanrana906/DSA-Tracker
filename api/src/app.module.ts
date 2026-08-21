import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProblemsModule } from './problems/problems.module';
import { ConceptsModule } from './concepts/concepts.module';
import { MistakesModule } from './mistakes/mistakes.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, ProblemsModule, ConceptsModule, MistakesModule, AnalyticsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
