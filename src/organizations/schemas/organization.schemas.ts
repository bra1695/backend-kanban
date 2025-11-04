import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  logo?: string; // Cloudinary URL or local path

  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop()
  postalCode?: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  website?: string;


  @Prop({ default: true })
  isActive?: boolean;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
