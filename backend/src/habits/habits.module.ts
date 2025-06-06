import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { Habit, HabitSchema } from '../schemas/habit.schema';
import { User, UserSchema } from '../schemas/user.schema';
import {
  HabitSchedule,
  HabitScheduleSchema,
} from '../schemas/habit-schedule.schema';
import { UserHabit, UserHabitSchema } from '../schemas/user-habit.schema';
import {
  HabitCompletion,
  HabitCompletionSchema,
} from '../schemas/habit-completion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      { name: User.name, schema: UserSchema },
      { name: HabitSchedule.name, schema: HabitScheduleSchema },
      { name: UserHabit.name, schema: UserHabitSchema },
      { name: HabitCompletion.name, schema: HabitCompletionSchema },
    ]),
  ],
  controllers: [HabitsController],
  providers: [HabitsService],
})
export class HabitsModule {}
