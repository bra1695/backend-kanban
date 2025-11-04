import { IsNotEmpty, IsString, IsArray, IsMongoId, IsOptional } from 'class-validator';

export class UpdateBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  teams: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  columns: string[];

  @IsMongoId()
  createdBy: string
}
