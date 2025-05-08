import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  uid: string;

  @Prop({ type: Types.ObjectId, ref: 'Family' })
  familyId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ enum: ['parent', 'child'] })
  role: string;

  @Prop()
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 