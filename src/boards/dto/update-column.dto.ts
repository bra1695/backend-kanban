import { IsString, IsNotEmpty, IsOptional, ValidateNested, ArrayMinSize, IsMongoId } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsMongoId({each: true})
  tasks?: CreateTaskDto[];
}
