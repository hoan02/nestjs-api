import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      if (ret.deviceInfo) {
        ret.deviceInfo = JSON.parse(ret.deviceInfo);
      }
      return ret;
    }
  }
})
export class RefreshToken {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ type: String })
  deviceInfo: string;

  @Prop()
  ipAddress?: string;

  @Prop({ default: true })
  isValid: boolean;

  @Prop()
  lastUsedAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
