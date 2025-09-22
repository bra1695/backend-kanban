import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';
import { User } from 'src/users/schemas/user.schema';

@Schema()
export class Subtask {
  @Prop({ required: true })
  title: string;

  @Prop({ default: false })
  isCompleted: boolean;
}
export const SubtaskSchema = SchemaFactory.createForClass(Subtask);

@Schema()
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  status: string; // Todo | Doing | Done

  @Prop({ type: [SubtaskSchema], default: [] })
  subtasks: Subtask[];
}
export const TaskSchema = SchemaFactory.createForClass(Task);

@Schema()
export class Column {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [TaskSchema], default: [] })
  tasks: Task[];
}
export const ColumnSchema = SchemaFactory.createForClass(Column);

@Schema({ timestamps: true })
export class Board extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ unique: true })
  slug: string;

  @Prop({ type: [Types.ObjectId], ref: User.name, default: [] })
  teams: Types.ObjectId[];

  @Prop({ type: [ColumnSchema], default: [] })
  columns: Column[];

  // 👇 NEW field: creator of the board
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;
}
export const BoardSchema = SchemaFactory.createForClass(Board);

// Auto-generate slug before save
BoardSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
