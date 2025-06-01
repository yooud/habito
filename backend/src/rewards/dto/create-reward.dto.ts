import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateRewardDto {
  @IsString({ message: 'title must be a string' })
  title: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;

  @IsNumber({}, { message: 'pointsRequired must be a number' })
  @Min(0, { message: 'pointsRequired can not be negative' })
  pointsRequired: number;
}
