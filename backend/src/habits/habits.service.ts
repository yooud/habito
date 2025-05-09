import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Habit } from '../schemas/habit.schema';
import { User } from '../schemas/user.schema';
import { HabitSchedule } from '../schemas/habit-schedule.schema';
import { CreateHabitDto } from './dto/create-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private habitModel: Model<Habit>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(HabitSchedule.name) private habitScheduleModel: Model<HabitSchedule>,
  ) {}

  private async validateFamilyMembership(uid: string) {
    const user = await this.userModel.findOne({ uid });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.familyId) {
      throw new BadRequestException('User is not associated with any family');
    }
    return user;
  }

  private async validateHabitAccess(habitId: string, userFamilyId: Types.ObjectId) {
    const habit = await this.habitModel.findById(habitId);
    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    // Check if the habit creator is in the same family
    const creator = await this.userModel.findById(habit.createdBy);
    if (!creator || creator.familyId?.toString() !== userFamilyId.toString()) {
      throw new NotFoundException('Habit not found');
    }

    return habit;
  }

  async create(uid: string, createHabitDto: CreateHabitDto) {
    const user = await this.validateFamilyMembership(uid);

    const habit = await this.habitModel.create({
      title: createHabitDto.title,
      description: createHabitDto.description,
      points: createHabitDto.points,
      createdBy: user._id,
    });

    // Create schedule entries
    const schedulePromises = createHabitDto.schedule.map(dayOfWeek =>
      this.habitScheduleModel.create({
        habitId: habit._id,
        dayOfWeek,
      }),
    );

    await Promise.all(schedulePromises);

    // Return habit with its schedule
    const schedules = await this.habitScheduleModel.find({ habitId: habit._id });
    return {
      ...habit.toObject(),
      schedule: schedules.map(s => s.dayOfWeek),
    };
  }

  async findAll(uid: string) {
    const user = await this.validateFamilyMembership(uid);

    // Get all habits created by family members
    const familyMembers = await this.userModel.find({ familyId: user.familyId });
    const familyMemberIds = familyMembers.map(member => member._id);

    const habits = await this.habitModel.find({
      createdBy: { $in: familyMemberIds },
    });

    // Get schedules for all habits
    const habitsWithSchedules = await Promise.all(
      habits.map(async habit => {
        const schedules = await this.habitScheduleModel.find({ habitId: habit._id });
        return {
          ...habit.toObject(),
          schedule: schedules.map(s => s.dayOfWeek),
        };
      }),
    );

    return habitsWithSchedules;
  }

  async findOne(id: string, uid: string) {
    const user = await this.validateFamilyMembership(uid);
    const habit = await this.validateHabitAccess(id, user.familyId);

    const schedules = await this.habitScheduleModel.find({ habitId: habit._id });
    return {
      ...habit.toObject(),
      schedule: schedules.map(s => s.dayOfWeek),
    };
  }

  async update(id: string, uid: string, updateHabitDto: Partial<CreateHabitDto>) {
    const user = await this.validateFamilyMembership(uid);
    const habit = await this.validateHabitAccess(id, user.familyId);

    // Only the creator can update the habit
    if (habit.createdBy.toString() !== user._id as unknown as string) {
      throw new BadRequestException('Only the creator can update this habit');
    }

    // Update habit details
    const updatedHabit = await this.habitModel.findByIdAndUpdate(
      id,
      {
        title: updateHabitDto.title,
        description: updateHabitDto.description,
        points: updateHabitDto.points,
      },
      { new: true },
    );

    if (!updatedHabit) {
      throw new NotFoundException('Failed to update habit');
    }

    // Update schedule if provided
    if (updateHabitDto.schedule) {
      // Remove existing schedules
      await this.habitScheduleModel.deleteMany({ habitId: habit._id });

      // Create new schedules
      const schedulePromises = updateHabitDto.schedule.map(dayOfWeek =>
        this.habitScheduleModel.create({
          habitId: habit._id,
          dayOfWeek,
        }),
      );

      await Promise.all(schedulePromises);
    }

    const schedules = await this.habitScheduleModel.find({ habitId: habit._id });
    return {
      ...updatedHabit.toObject(),
      schedule: schedules.map(s => s.dayOfWeek),
    };
  }

  async remove(id: string, uid: string) {
    const user = await this.validateFamilyMembership(uid);
    const habit = await this.validateHabitAccess(id, user.familyId);

    // Only the creator can delete the habit
    if (habit.createdBy.toString() !== user._id as unknown as string) {
      throw new BadRequestException('Only the creator can delete this habit');
    }

    // Delete habit and its schedules
    await Promise.all([
      this.habitModel.findByIdAndDelete(id),
      this.habitScheduleModel.deleteMany({ habitId: habit._id }),
    ]);

    return { message: 'Habit deleted successfully' };
  }
} 