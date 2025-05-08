import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class UserReward extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Reward', required: true })
  rewardId: Types.ObjectId;

  @Prop({ required: true, enum: ['available', 'redeemed'], default: 'available' })
  status: string;

  @Prop()
  redeemedAt: Date;
}

export const UserRewardSchema = SchemaFactory.createForClass(UserReward); 