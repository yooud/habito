import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RequestWithUser } from '../auth/types/request.types';
import { CreateRewardDto } from './dto/create-reward.dto';

@Controller('rewards')
@UseGuards(FirebaseAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createDto: CreateRewardDto,
  ) {
    return this.rewardsService.createReward(req.user.uid, createDto);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return this.rewardsService.getAllRewards(req.user.uid);
  }

  @Post(':rewardId/redeem')
  async redeem(
    @Req() req: RequestWithUser,
    @Param('rewardId') rewardId: string,
  ) {
    return this.rewardsService.purchaseReward(req.user.uid, rewardId);
  }

  @Get('redeemed')
  async getRedeemed(@Req() req: RequestWithUser) {
    return this.rewardsService.getPurchasedRewards(req.user.uid);
  }

  @Patch(':rewardId')
  async update(
    @Req() req: RequestWithUser,
    @Param('rewardId') rewardId: string,
    @Body() updateDto: CreateRewardDto,
  ) {
    return this.rewardsService.updateReward(req.user.uid, rewardId, updateDto);
  }

  @Delete(':rewardId')
  async remove(
    @Req() req: RequestWithUser,
    @Param('rewardId') rewardId: string,
  ) {
    return this.rewardsService.deleteReward(req.user.uid, rewardId);
  }
}
