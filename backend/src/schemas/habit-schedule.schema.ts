import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class HabitSchedule extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true })
  habitId: Types.ObjectId;

  @Prop({ required: true, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] })
  dayOfWeek: string;
}

export const HabitScheduleSchema = SchemaFactory.createForClass(HabitSchedule); 