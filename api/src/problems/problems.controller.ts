import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Post()
  create(@Body() createProblemDto: any) {
    return this.problemsService.create(createProblemDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('topic') topic?: string,
    @Query('pattern') pattern?: string,
    @Query('difficulty') difficulty?: string,
    @Query('sourceList') sourceList?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.problemsService.findAll({ status, topic, pattern, difficulty, sourceList, tag, search });
  }

  @Get('due')
  findDueForRevision() {
    return this.problemsService.findDueForRevision();
  }

  @Get('tags')
  listTags() {
    return this.problemsService.listTags();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.problemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProblemDto: any) {
    return this.problemsService.update(+id, updateProblemDto);
  }

  @Post(':id/attempts')
  logAttempt(
    @Param('id') id: string,
    @Body() attemptData: { outcome: 'SOLVED' | 'STRUGGLED', timeTaken?: number, approach?: string, triggerNote?: string, notes?: string, mistake?: { category: string, description: string } }
  ) {
    return this.problemsService.logAttempt(+id, attemptData);
  }

  @Post(':id/revisions')
  logRevision(
    @Param('id') id: string,
    @Body() revisionData: { outcome: 'RECALLED' | 'FORGOT', assessment?: string, recallTime?: number, thoughts?: string, code?: string, approach?: string, timeComplexity?: string, spaceComplexity?: string, complexityReason?: string, mistake?: { category: string, description: string } }
  ) {
    return this.problemsService.logRevision(+id, revisionData);
  }
}
