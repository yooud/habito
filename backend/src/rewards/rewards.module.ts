import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { Reward, RewardSchema } from '../schemas/reward.schema';
import { UserReward, UserRewardSchema } from '../schemas/user-reward.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Family, FamilySchema } from '../schemas/family.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
    MongooseModule.forFeature([
      { name: UserReward.name, schema: UserRewardSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Family.name, schema: FamilySchema }]),
  ],
  providers: [RewardsService],
  controllers: [RewardsController],
})
export class RewardsModule {}
