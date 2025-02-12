import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RefreshToken } from './refresh-token';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  fullName?: string;

  @Prop({ default: 'user', enum: ['user', 'admin', 'moderator'] })
  role: string;

  @Prop()
  profilePicture?: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'RefreshToken' }] })
  refreshTokens: RefreshToken[];
}

export const UserSchema = SchemaFactory.createForClass(User);
