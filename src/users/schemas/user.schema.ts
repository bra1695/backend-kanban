import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

export enum Role {
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  PM = 'PM',
  SM = 'SM',
}

export enum UserType {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: Role })
  role: Role;

  @Prop({ enum: UserType, default: UserType.USER })
  type: UserType;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organization: Types.ObjectId;

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  confirmationToken?: string;

  @Prop()
  image?: string;

  @Prop()
  address?: string;

  @Prop()
  postalCode?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  const user = this as UserDocument;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});
