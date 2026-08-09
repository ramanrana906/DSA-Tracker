import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConceptsService } from './concepts.service';

@Controller('concepts')
export class ConceptsController {
  constructor(private readonly conceptsService: ConceptsService) {}

  @Post()
  create(@Body() createConceptDto: any) {
    return this.conceptsService.create(createConceptDto);
  }

  @Get()
  findAll() {
    return this.conceptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conceptsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConceptDto: any) {
    return this.conceptsService.update(+id, updateConceptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conceptsService.remove(+id);
  }
}
