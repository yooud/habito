import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HabitsService } from './habits.service';
import { Habit } from '../schemas/habit.schema';
import { User } from '../schemas/user.schema';
import { HabitSchedule } from '../schemas/habit-schedule.schema';
import { UserHabit } from '../schemas/user-habit.schema';
import { HabitCompletion } from '../schemas/habit-completion.schema';
import { CreateHabitDto, DayOfWeek } from './dto/create-habit.dto';
import { AssignHabitDto } from './dto/assign-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('HabitsService', () => {
  let service: HabitsService;
  let habitModel: Model<Habit>;
  let userModel: Model<User>;
  let habitScheduleModel: Model<HabitSchedule>;
  let userHabitModel: Model<UserHabit>;
  let habitCompletionModel: Model<HabitCompletion>;

  const mockUser = {
    _id: new Types.ObjectId(),
    uid: 'test-uid',
    name: 'Test User',
    role: 'parent',
    familyId: new Types.ObjectId(),
    points: 0,
  };

  const mockChild = {
    _id: new Types.ObjectId(),
    uid: 'child-uid',
    name: 'Test Child',
    role: 'child',
    familyId: mockUser.familyId,
    points: 0,
  };

  const mockHabit = {
    _id: new Types.ObjectId(),
    title: 'Test Habit',
    description: 'Test Description',
    points: 10,
    createdBy: mockUser._id,
    toObject: () => ({
      _id: mockHabit._id,
      title: mockHabit.title,
      description: mockHabit.description,
      points: mockHabit.points,
      createdBy: mockHabit.createdBy,
    }),
  };

  const mockSchedule = {
    _id: new Types.ObjectId(),
    habitId: mockHabit._id,
    dayOfWeek: 'Mon',
  };

  const mockUserHabit = {
    _id: new Types.ObjectId(),
    userId: mockChild._id,
    habitId: mockHabit._id,
    isActive: true,
    save: jest.fn().mockResolvedValue(true),
    deleteOne: jest.fn().mockResolvedValue(true),
  };

  const mockCompletion = {
    _id: new Types.ObjectId(),
    userHabitId: mockUserHabit._id,
    note: 'Test completion',
    completedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitsService,
        {
          provide: getModelToken(Habit.name),
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken(HabitSchedule.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(UserHabit.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue([mockUserHabit]),
            }),
          },
        },
        {
          provide: getModelToken(HabitCompletion.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue([mockCompletion]),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<HabitsService>(HabitsService);
    habitModel = module.get<Model<Habit>>(getModelToken(Habit.name));
    userModel = module.get<Model<User>>(getModelToken(User.name));
    habitScheduleModel = module.get<Model<HabitSchedule>>(getModelToken(HabitSchedule.name));
    userHabitModel = module.get<Model<UserHabit>>(getModelToken(UserHabit.name));
    habitCompletionModel = module.get<Model<HabitCompletion>>(getModelToken(HabitCompletion.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createHabitDto: CreateHabitDto = {
      title: 'Test Habit',
      description: 'Test Description',
      points: 10,
      schedule: [DayOfWeek.MON, DayOfWeek.WED, DayOfWeek.FRI],
    };

    it('should create a new habit', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(habitModel, 'create').mockResolvedValue(mockHabit as any);
      jest.spyOn(habitScheduleModel, 'create').mockResolvedValue(mockSchedule as any);
      jest.spyOn(habitScheduleModel, 'find').mockResolvedValue([mockSchedule] as any);

      const result = await service.create(mockUser.uid, createHabitDto);

      expect(result).toEqual({
        ...mockHabit.toObject(),
        schedule: ['Mon'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(service.create('invalid-uid', createHabitDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all habits for a family', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(userModel, 'find').mockResolvedValue([mockUser, mockChild] as any);
      jest.spyOn(habitModel, 'find').mockResolvedValue([mockHabit] as any);
      jest.spyOn(habitScheduleModel, 'find').mockResolvedValue([mockSchedule] as any);

      const result = await service.findAll(mockUser.uid);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('schedule');
      expect(result[0]).toHaveProperty('assignedTo');
    });
  });

  describe('findOne', () => {
    it('should return a single habit with details', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(habitModel, 'findById').mockResolvedValue(mockHabit as any);
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(habitScheduleModel, 'find').mockResolvedValue([mockSchedule] as any);
      jest.spyOn(userHabitModel, 'find').mockResolvedValue([mockUserHabit] as any);

      const result = await service.findOne(mockHabit._id.toString(), mockUser.uid);

      expect(result).toHaveProperty('schedule');
      expect(result).toHaveProperty('assignedTo');
      expect(result).toHaveProperty('createdBy');
    });
  });

  describe('update', () => {
    const updateHabitDto: Partial<CreateHabitDto> = {
      title: 'Updated Habit',
      points: 20,
    };

    it('should update a habit', async () => {
      const updatedHabit = {
        ...mockHabit,
        ...updateHabitDto,
        toObject: () => ({
          ...mockHabit.toObject(),
          ...updateHabitDto,
        }),
      };
      const mockUserId = mockUser._id.toString();
      jest.spyOn(userModel, 'findOne').mockResolvedValue({ ...mockUser, _id: mockUserId } as any);
      jest.spyOn(habitModel, 'findById').mockResolvedValue({
        ...mockHabit,
        createdBy: mockUserId,
      } as any);
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(habitModel, 'findByIdAndUpdate').mockResolvedValue(updatedHabit as any);
      jest.spyOn(habitScheduleModel, 'find').mockResolvedValue([mockSchedule] as any);

      const result = await service.update(mockHabit._id.toString(), mockUser.uid, updateHabitDto);

      expect(result.title).toBe(updateHabitDto.title);
      expect(result.points).toBe(updateHabitDto.points);
    });
  });

  describe('remove', () => {
    it('should delete a habit', async () => {
      const mockUserId = mockUser._id.toString();
      jest.spyOn(userModel, 'findOne').mockResolvedValue({ ...mockUser, _id: mockUserId } as any);
      jest.spyOn(habitModel, 'findById').mockResolvedValue({
        ...mockHabit,
        createdBy: mockUserId,
      } as any);
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(habitModel, 'findByIdAndDelete').mockResolvedValue(mockHabit as any);
      jest.spyOn(habitScheduleModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 } as any);

      const result = await service.remove(mockHabit._id.toString(), mockUser.uid);

      expect(result).toEqual({ message: 'Habit deleted successfully' });
    });
  });

  describe('assignHabit', () => {
    const assignHabitDto: AssignHabitDto = {
      childUid: mockChild.uid,
      isActive: true,
    };

    it('should assign a habit to a child', async () => {
      jest.spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(mockUser as any)
        .mockResolvedValueOnce(mockChild as any);
      jest.spyOn(habitModel, 'findById').mockResolvedValue(mockHabit as any);
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(userHabitModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(userHabitModel, 'create').mockResolvedValue(mockUserHabit as any);

      const result = await service.assignHabit(mockHabit._id.toString(), mockUser.uid, assignHabitDto);

      expect(result.message).toBe('Habit assigned successfully');
      expect(result.assignment).toBeDefined();
    });
  });

  describe('completeHabit', () => {
    const completeHabitDto: CompleteHabitDto = {
      note: 'Test completion',
    };

    it('should complete a habit', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockChild as any);
      jest.spyOn(habitModel, 'findById').mockResolvedValue(mockHabit as any);
      jest.spyOn(userHabitModel, 'findOne').mockResolvedValue(mockUserHabit as any);
      jest.spyOn(habitScheduleModel, 'findOne').mockResolvedValue(mockSchedule as any);
      jest.spyOn(habitCompletionModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(habitCompletionModel, 'create').mockResolvedValue(mockCompletion as any);
      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValue({ ...mockChild, points: 10 } as any);
      jest.spyOn(userModel, 'findById').mockResolvedValue({ ...mockChild, points: 10 } as any);

      const result = await service.completeHabit(mockHabit._id.toString(), mockChild.uid, completeHabitDto);

      expect(result.message).toBe('Habit completed successfully');
      expect(result.pointsEarned).toBe(mockHabit.points);
      expect(result.totalPoints).toBe(10);
    });
  });

  describe('getCompletions', () => {
    it('should return habit completions', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockChild as any);
      jest.spyOn(userHabitModel, 'findOne').mockResolvedValue(mockUserHabit as any);

      const result = await service.getCompletions(mockHabit._id.toString(), mockChild.uid);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCompletion);
    });
  });
}); 