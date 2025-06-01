import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Family extends Document {
  @Prop({ required: true })
  name: string;
}

export const FamilySchema = SchemaFactory.createForClass(Family);
