import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSubtaskDto } from './update-subtask.dto';

export class UpdateTaskDto {
  // 🧱 Task title
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  // 🧱 Optional task description
  @IsOptional()
  @IsString()
  description?: string;

  // 🧱 Status (Todo | Doing | Done)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  status?: string;

  // 🧱 Optional start date
  @IsOptional()
  @IsDateString()
  dateStart?: string;

  // 🧱 Optional end date
  @IsOptional()
  @IsDateString()
  dateEnd?: string;

  // 🧱 Optional task time
  @IsOptional()
  @IsString()
  hour?: string;

  // 🧱 Affected user (if reassigned)
  @IsOptional()
  @IsMongoId()
  affectedTo?: string;

  // 🧱 Organization (in case of move between orgs)
  @IsOptional()
  @IsMongoId()
  organization?: string;

  // 🧱 Optional array of image URLs
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  // 🧱 Optional nested subtasks
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSubtaskDto)
  subtasks?: UpdateSubtaskDto[];
}
