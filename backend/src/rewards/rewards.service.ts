import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reward } from '../schemas/reward.schema';
import { UserReward } from '../schemas/user-reward.schema';
import { User } from '../schemas/user.schema';
import { Family } from '../schemas/family.schema';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UserRole } from '../family/dto/add-member.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
    @InjectModel(UserReward.name)
    private readonly userRewardModel: Model<UserReward>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Family.name) private readonly familyModel: Model<Family>,
  ) {}

  async createReward(uid: string, createDto: CreateRewardDto) {
    const user = await this.userModel.findOne({ uid });
    if (!user || !user.familyId) {
      throw new NotFoundException(
        'User not found or not associated with a family',
      );
    }
    if (user.role !== UserRole.PARENT) {
      throw new BadRequestException('Only a parent can add rewards');
    }
    const familyId = user.familyId;
    const family = await this.familyModel.findById(familyId);
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    const reward = await this.rewardModel.create({
      familyId,
      title: createDto.title,
      description: createDto.description,
      pointsRequired: createDto.pointsRequired,
    });
    return reward;
  }

  async getAllRewards(uid: string) {
    const user = await this.userModel.findOne({ uid });
    if (!user || !user.familyId) {
      throw new NotFoundException('User not found or not in a family');
    }
    const familyId = user.familyId;
    const rewards = await this.rewardModel.find({ familyId }).lean();
    return rewards;
  }

  async purchaseReward(uid: string, rewardId: string) {
    const user = await this.userModel.findOne({ uid });
    if (!user || !user.familyId) {
      throw new NotFoundException('User not found or not in a family');
    }
    if (user.role !== UserRole.CHILD) {
      throw new BadRequestException('Only a child can purchase rewards');
    }
    let rewardObjectId: Types.ObjectId;
    try {
      rewardObjectId = new Types.ObjectId(rewardId);
    } catch {
      throw new BadRequestException('Invalid rewardId format');
    }
    const reward = await this.rewardModel.findById(rewardObjectId);
    if (!reward) {
      throw new NotFoundException('Reward not found');
    }
    if (!reward.familyId.equals(user.familyId)) {
      throw new BadRequestException(
        'Cannot purchase a reward from another family',
      );
    }

    if (user.points < reward.pointsRequired) {
      throw new BadRequestException('Insufficient points');
    }

    user.points -= reward.pointsRequired;
    await user.save();

    const userReward = await this.userRewardModel.create({
      userId: user._id,
      rewardId: rewardObjectId,
      purchasedAt: new Date(),
    });
    return userReward;
  }

  async getPurchasedRewards(uid: string) {
    const user = await this.userModel.findOne({ uid });
    if (!user || !user.familyId) {
      throw new NotFoundException('User not found or not in a family');
    }
    if (user.role !== UserRole.PARENT) {
      throw new BadRequestException('Only a parent can view purchased rewards');
    }
    const familyId = user.familyId;
    const members = await this.userModel
      .find({ familyId })
      .select('_id role')
      .lean();
    const memberIds = members.map((m) => m._id);
    const purchased = await this.userRewardModel
      .find({ userId: { $in: memberIds } })
      .populate<{ rewardId: Reward }>('rewardId')
      .populate<{ userId: User }>('userId')
      .lean();
    const result = purchased.map((pr) => ({
      redeemedAt: pr.redeemedAt,
      user: {
        id: pr.userId._id,
        uid: pr.userId.uid,
        email: pr.userId.email,
        name: pr.userId.name,
        role: pr.userId.role,
      },
      reward: {
        id: pr.rewardId._id,
        title: pr.rewardId.title,
        description: pr.rewardId.description,
        pointsRequired: pr.rewardId.pointsRequired,
      },
    }));
    return result;
  }
}
