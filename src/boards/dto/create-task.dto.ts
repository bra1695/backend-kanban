import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  ValidateNested,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSubtaskDto } from './create-subtask.dto';

export class CreateTaskDto {
  // 🧱 Task title
  @IsString()
  @IsNotEmpty()
  title: string;

  // 🧱 Optional task description
  @IsOptional()
  @IsString()
  description?: string;

  // 🧱 Task status (e.g., "Todo", "Doing", "Done")
  @IsString()
  @IsNotEmpty()
  status: string;

  // 🧱 Optional start date
  @IsOptional()
  @IsDateString()
  dateStart?: string; // ISO 8601 (e.g. 2025-10-31T14:00:00Z)

  // 🧱 Optional end date
  @IsOptional()
  @IsDateString()
  dateEnd?: string;

  // 🧱 Optional time of the task
  @IsOptional()
  @IsString()
  hour?: string; // e.g. "14:30"

  // 🧱 ID of the user affected by this task
  @IsMongoId()
  @IsNotEmpty()
  affectedTo: string;

  // 🧱 Organization to which the task belongs
  @IsMongoId()
  @IsNotEmpty()
  organization: string;

  // 🧱 Images (uploaded separately but accepted as array of URLs)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  // 🧱 Optional subtasks list
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subtasks?: CreateSubtaskDto[];
}
