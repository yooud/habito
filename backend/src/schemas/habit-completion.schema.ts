import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class HabitCompletion extends Document {
  @Prop({ type: Types.ObjectId, ref: 'UserHabit', required: true })
  userHabitId: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  completedAt: Date;
}

export const HabitCompletionSchema = SchemaFactory.createForClass(HabitCompletion); 