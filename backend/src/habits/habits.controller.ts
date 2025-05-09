import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RequestWithUser } from '../auth/types/request.types';

@Controller('habits')
@UseGuards(FirebaseAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() createHabitDto: CreateHabitDto) {
    return this.habitsService.create(req.user.uid, createHabitDto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.habitsService.findAll(req.user.uid);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.habitsService.findOne(id, req.user.uid);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateHabitDto: Partial<CreateHabitDto>,
  ) {
    return this.habitsService.update(id, req.user.uid, updateHabitDto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.habitsService.remove(id, req.user.uid);
  }
} 