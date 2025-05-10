import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Habit } from '../schemas/habit.schema';
import { User } from '../schemas/user.schema';
import { HabitSchedule } from '../schemas/habit-schedule.schema';
import { UserHabit } from '../schemas/user-habit.schema';
import { HabitCompletion } from '../schemas/habit-completion.schema';
import { CreateHabitDto } from './dto/create-habit.dto';
import { AssignHabitDto } from './dto/assign-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private habitModel: Model<Habit>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(HabitSchedule.name) private habitScheduleModel: Model<HabitSchedule>,
    @InjectModel(UserHabit.name) private userHabitModel: Model<UserHabit>,
    @InjectModel(HabitCompletion.name) private habitCompletionModel: Model<HabitCompletion>,
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

  private async validateParentRole(user: User) {
    if (user.role !== 'parent') {
      throw new BadRequestException('Only parents can perform this action');
    }
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

  private async validateChildAccess(childUid: string, parentFamilyId: Types.ObjectId) {
    const child = await this.userModel.findOne({ uid: childUid });
    if (!child) {
      throw new NotFoundException('Child not found');
    }
    if (child.role !== 'child') {
      throw new BadRequestException('User is not a child');
    }
    if (child.familyId?.toString() !== parentFamilyId.toString()) {
      throw new BadRequestException('Child does not belong to your family');
    }
    return child;
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

    // Get all family members
    const familyMembers = await this.userModel.find({ familyId: user.familyId });
    const familyMemberIds = familyMembers.map(member => member._id);

    // Get all habits created by family members
    const habits = await this.habitModel.find({
      createdBy: { $in: familyMemberIds },
    });

    // Get all assignments for family members
    const assignments = await this.userHabitModel.find({
      userId: { $in: familyMemberIds },
    }).populate('habitId');

    // Get schedules for all habits
    const habitsWithDetails = await Promise.all(
      habits.map(async habit => {
        const schedules = await this.habitScheduleModel.find({ habitId: habit._id });
        
        // Find assignments for this habit
        const habitAssignments = assignments.filter(
          assignment => assignment.habitId._id.toString() === (habit._id as unknown as string)
        );

        // Get assigned users details
        const assignedUsers = await Promise.all(
          habitAssignments.map(async assignment => {
            const assignedUser = await this.userModel.findById(assignment.userId);
            if (!assignedUser) {
              return null;
            }
            return {
              uid: assignedUser.uid,
              name: assignedUser.name,
              isActive: assignment.isActive,
            };
          })
        );

        // Filter out null values from assignedUsers
        const validAssignedUsers = assignedUsers.filter((user): user is NonNullable<typeof user> => user !== null);

        return {
          ...habit.toObject(),
          schedule: schedules.map(s => s.dayOfWeek),
          assignedTo: validAssignedUsers,
          createdBy: familyMembers.find(member => 
            (member._id as unknown as string) === (habit.createdBy as unknown as string)
          )?.name || 'Unknown',
        };
      }),
    );

    return habitsWithDetails;
  }

  async findOne(id: string, uid: string) {
    const user = await this.validateFamilyMembership(uid);
    const habit = await this.validateHabitAccess(id, user.familyId);

    // Get schedules
    const schedules = await this.habitScheduleModel.find({ habitId: habit._id });

    // Get all assignments for this habit
    const assignments = await this.userHabitModel.find({ habitId: habit._id });

    // Get assigned users details
    const assignedUsers = await Promise.all(
      assignments.map(async assignment => {
        const assignedUser = await this.userModel.findById(assignment.userId);
        if (!assignedUser) {
          return null;
        }
        return {
          uid: assignedUser.uid,
          name: assignedUser.name,
          isActive: assignment.isActive,
        };
      })
    );

    // Filter out null values from assignedUsers
    const validAssignedUsers = assignedUsers.filter((user): user is NonNullable<typeof user> => user !== null);

    // Get creator details
    const creator = await this.userModel.findById(habit.createdBy);

    return {
      ...habit.toObject(),
      schedule: schedules.map(s => s.dayOfWeek),
      assignedTo: validAssignedUsers,
      createdBy: creator?.name || 'Unknown',
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

  async assignHabit(habitId: string, uid: string, assignHabitDto: AssignHabitDto) {
    const parent = await this.validateFamilyMembership(uid);
    await this.validateParentRole(parent);
    
    const habit = await this.validateHabitAccess(habitId, parent.familyId);
    const child = await this.userModel.findById(assignHabitDto.childId);
    if (!child) {
      throw new NotFoundException('Child not found');
    }
    if (child.role !== 'child') {
      throw new BadRequestException('User is not a child');
    }
    if (child.familyId?.toString() !== parent.familyId.toString()) {
      throw new BadRequestException('Child does not belong to your family');
    }

    // Check if habit is already assigned to the child
    const existingAssignment = await this.userHabitModel.findOne({
      userId: child._id,
      habitId: habit._id,
    });

    if (existingAssignment) {
      throw new BadRequestException('Habit is already assigned to this child');
    }

    // Create the assignment
    const userHabit = await this.userHabitModel.create({
      userId: child._id,
      habitId: habit._id,
      isActive: assignHabitDto.isActive ?? true,
    });

    return {
      message: 'Habit assigned successfully',
      assignment: userHabit,
    };
  }

  async getAssignedHabits(uid: string) {
    const user = await this.validateFamilyMembership(uid);
    
    const assignments = await this.userHabitModel.find({ userId: user._id })
      .populate('habitId');

    return assignments.map(assignment => ({
      ...assignment.toObject(),
      habit: assignment.habitId,
    }));
  }

  async updateAssignment(habitId: string, uid: string, isActive: boolean) {
    const user = await this.validateFamilyMembership(uid);
    await this.validateParentRole(user);
    
    const assignment = await this.userHabitModel.findOne({
      habitId,
    }).populate('userId');

    if (!assignment) {
      throw new NotFoundException('Habit assignment not found');
    }

    // Verify the assignment is for a child in the same family
    const child = await this.userModel.findById(assignment.userId);
    if (!child || child.familyId?.toString() !== user.familyId.toString()) {
      throw new NotFoundException('Habit assignment not found');
    }

    assignment.isActive = isActive;
    await assignment.save();

    return {
      message: 'Assignment updated successfully',
      assignment,
    };
  }

  async removeAssignment(habitId: string, uid: string) {
    const user = await this.validateFamilyMembership(uid);
    await this.validateParentRole(user);
    
    const assignment = await this.userHabitModel.findOne({
      habitId,
    }).populate('userId');

    if (!assignment) {
      throw new NotFoundException('Habit assignment not found');
    }

    // Verify the assignment is for a child in the same family
    const child = await this.userModel.findById(assignment.userId);
    if (!child || child.familyId?.toString() !== user.familyId.toString()) {
      throw new NotFoundException('Habit assignment not found');
    }

    await assignment.deleteOne();

    return {
      message: 'Assignment removed successfully',
    };
  }

  private async validateChildRole(user: User) {
    if (user.role !== 'child') {
      throw new BadRequestException('Only children can perform this action');
    }
  }

  private async validateHabitAssignment(habitId: string, userId: Types.ObjectId) {
    const assignment = await this.userHabitModel.findOne({
      habitId,
      userId,
      isActive: true,
    });

    if (!assignment) {
      throw new BadRequestException('Habit is not assigned to you or is not active');
    }

    return assignment;
  }

  private async validateSchedule(habitId: string) {
    const today = new Date();
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
    
    const schedule = await this.habitScheduleModel.findOne({
      habitId,
      dayOfWeek,
    });

    if (!schedule) {
      throw new BadRequestException('This habit is not scheduled for today');
    }
  }

  private async validateNoCompletionToday(userHabitId: Types.ObjectId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCompletion = await this.habitCompletionModel.findOne({
      userHabitId,
      completedAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingCompletion) {
      throw new BadRequestException('Habit already completed today');
    }
  }

  async completeHabit(habitId: string, uid: string, completeHabitDto: CompleteHabitDto) {
    const child = await this.validateFamilyMembership(uid);
    await this.validateChildRole(child);

    // Get the habit and validate it exists
    const habit = await this.habitModel.findById(habitId);
    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    // Validate the assignment
    const assignment = await this.validateHabitAssignment(habitId, child._id as Types.ObjectId);

    // Validate the schedule
    await this.validateSchedule(habitId);
    // Validate no completion today
    await this.validateNoCompletionToday(assignment._id as Types.ObjectId);

    // Create completion record
    const completion = await this.habitCompletionModel.create({
      userHabitId: assignment._id,
      note: completeHabitDto.note,
    });

    // Update child's points
    await this.userModel.findByIdAndUpdate(child._id, {
      $inc: { points: habit.points },
    });

    // Get updated child info
    const updatedChild = await this.userModel.findById(child._id);

    return {
      message: 'Habit completed successfully',
      pointsEarned: habit.points,
      totalPoints: updatedChild?.points,
      completion,
    };
  }

  async getCompletions(habitId: string, uid: string) {
    const user = await this.validateFamilyMembership(uid);
    
    // Get the assignment
    const assignment = await this.userHabitModel.findOne({
      habitId,
      userId: user._id,
    });

    if (!assignment) {
      throw new NotFoundException('Habit is not assigned to you');
    }

    // Get completions
    const completions = await this.habitCompletionModel.find({
      userHabitId: assignment._id,
    }).sort({ completedAt: -1 });

    return completions;
  }
} 