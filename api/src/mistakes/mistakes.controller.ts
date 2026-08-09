import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { MistakesService } from './mistakes.service';

@Controller('mistakes')
export class MistakesController {
  constructor(private readonly mistakesService: MistakesService) {}

  @Post()
  create(@Body() createMistakeDto: any) {
    return this.mistakesService.create(createMistakeDto);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('problemId') problemId?: string,
  ) {
    return this.mistakesService.findAll({ category, problemId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mistakesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mistakesService.remove(+id);
  }
}
