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
      emoji: createDto.emoji,
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
      throw new BadRequestException('Only a child can redeem rewards');
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
        'Cannot redeem a reward from another family',
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
      redeemedAt: new Date(),
    });
    return userReward;
  }

  async getPurchasedRewards(uid: string) {
    const user = await this.userModel.findOne({ uid });
    if (!user || !user.familyId) {
      throw new NotFoundException('User not found or not in a family');
    }

    const purchased = await this.userRewardModel
      .find({ userId: user._id })
      .populate<{ rewardId: Reward }>('rewardId')
      .lean();

    const result = purchased.map(pr => ({
      reward: {
        id: pr.rewardId._id,
        title: pr.rewardId.title,
        description: pr.rewardId.description,
        pointsRequired: pr.rewardId.pointsRequired,
        emoji: pr.rewardId.emoji,
      },
      redeemedAt: pr.redeemedAt,
    }));

    return result;
  }

async updateReward(
    uid: string,
    rewardId: string,
    updateDto: CreateRewardDto,
  ) {
    const user = await this.userModel.findOne({ uid });
    if (!user || !user.familyId) {
      throw new NotFoundException('User not found or not associated with a family');
    }
    if (user.role !== UserRole.PARENT) {
      throw new BadRequestException('Only a parent can update rewards');
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

    if (!reward.familyId.equals(user.familyId as Types.ObjectId)) {
      throw new BadRequestException('Cannot update a reward from another family');
    }

    const updateData: Partial<Pick<Reward, 'title' | 'description' | 'pointsRequired' | 'emoji'>> = {};
    if (updateDto.title !== undefined) {
      updateData.title = updateDto.title;
    }
    if (updateDto.description !== undefined) {
      updateData.description = updateDto.description;
    }
    if (updateDto.pointsRequired !== undefined) {
      updateData.pointsRequired = updateDto.pointsRequired;
    }
    if (updateDto.emoji !== undefined) {
      updateData.emoji = updateDto.emoji;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    await this.rewardModel.findByIdAndUpdate(rewardObjectId, { $set: updateData });

    return this.rewardModel.findById(rewardObjectId).lean();
  }

  async deleteReward(uid: string, rewardId: string) {
    const user = await this.userModel.findOne({ uid });
    if (!user || !user.familyId) {
      throw new NotFoundException('User not found or not associated with a family');
    }
    if (user.role !== UserRole.PARENT) {
      throw new BadRequestException('Only a parent can delete rewards');
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

    if (!reward.familyId.equals(user.familyId as Types.ObjectId)) {
      throw new BadRequestException('Cannot delete a reward from another family');
    }

    await this.userRewardModel.deleteMany({ rewardId: rewardObjectId });

    await this.rewardModel.findByIdAndDelete(rewardObjectId);

    return { message: 'Reward successfully deleted' };
  }

}
