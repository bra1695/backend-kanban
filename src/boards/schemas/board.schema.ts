import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';
import { Organization } from 'src/organizations/schemas/organization.schemas';
import { User } from 'src/users/schemas/user.schema';

// -------------------- SUBTASK --------------------
@Schema()
export class Subtask {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  dateStart?: Date;

  @Prop()
  dateEnd?: Date;

  @Prop()
  hour?: string;

  @Prop({ default: false })
  isCompleted: boolean;

  // 🧩 Array of image URLs
  @Prop({ type: [String], default: [] })
  images: string[];

  // 👤 Creator of subtask
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;

  // 🔖 Slug for subtask
  @Prop({ unique: true })
  slug: string;
}
export const SubtaskSchema = SchemaFactory.createForClass(Subtask);

SubtaskSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// -------------------- TASK --------------------
export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  dateStart?: Date;

  @Prop()
  dateEnd?: Date;

  @Prop()
  hour?: string;

  @Prop({ required: true })
  status: string; // Todo | Doing | Done

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Organization.name, required: true })
  organization: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  affectedTo: Types.ObjectId;

  // 🧩 Array of image URLs for the task
  @Prop({ type: [String], default: [] })
  images: string[];

  // 🧩 One task → many subtasks
  @Prop({ type: [SubtaskSchema], default: [] })
  subtasks: Subtask[];

  // 🔖 Slug for task
  @Prop({ unique: true })
  slug: string;
}
export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// -------------------- COLUMN --------------------
export type ColumnDocument = Column & Document;

@Schema()
export class Column {
  @Prop({ required: true })
  name: string;

  // 👤 Creator of the column
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;

  // 🧩 One column → many tasks
  @Prop({ type: [TaskSchema], default: [] })
  tasks: Task[];

  // 🔖 Slug for column
  @Prop({ unique: true })
  slug: string;
}
export const ColumnSchema = SchemaFactory.createForClass(Column);

ColumnSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// -------------------- BOARD --------------------
export type BoardDocument = Board & Document;

@Schema({ timestamps: true })
export class Board extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ unique: true })
  slug: string;

  // 👥 Team members
  @Prop({ type: [Types.ObjectId], ref: User.name, default: [] })
  teams: Types.ObjectId[];

  // 🧩 One board → many columns
  @Prop({ type: [ColumnSchema], default: [] })
  columns: Column[];

  // 👤 Creator of the board
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;
}
export const BoardSchema = SchemaFactory.createForClass(Board);

BoardSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
