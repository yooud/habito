import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class UserHabit extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true })
  habitId: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  assignedAt: Date;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const UserHabitSchema = SchemaFactory.createForClass(UserHabit); 