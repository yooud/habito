import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { AssignHabitDto } from './dto/assign-habit.dto';
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

  @Post(':id/assign')
  assignHabit(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() assignHabitDto: AssignHabitDto,
  ) {
    return this.habitsService.assignHabit(id, req.user.uid, assignHabitDto);
  }

  @Get('assigned/me')
  getAssignedHabits(@Req() req: RequestWithUser) {
    return this.habitsService.getAssignedHabits(req.user.uid);
  }

  @Patch('assigned/:id')
  updateAssignment(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Query('isActive') isActive: boolean,
  ) {
    return this.habitsService.updateAssignment(id, req.user.uid, isActive);
  }

  @Delete('assigned/:id')
  removeAssignment(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.habitsService.removeAssignment(id, req.user.uid);
  }
} 