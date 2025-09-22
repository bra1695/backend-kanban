import { IsNotEmpty, IsString, IsArray, IsMongoId } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsMongoId({ each: true })
  teams: string[];
}
