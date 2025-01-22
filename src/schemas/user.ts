import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, enum: ['user', 'admin', 'moderator'], default: 'user' })
  role: string;

  @Prop()
  profilePicture: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  lastLogin: Date;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;

  @Prop()
  phoneNumber: string;
}

export const userSchema = SchemaFactory.createForClass(User);
