import { IsString, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateRewardDto {
  @IsString({ message: 'title must be a string' })
  title: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;

  @IsNumber({}, { message: 'pointsRequired must be a number' })
  @Min(0, { message: 'pointsRequired can not be negative' })
  pointsRequired: number;

  @IsOptional()
  @IsString({ message: 'emoji должен быть строкой' })
  @MaxLength(2, { message: 'emoji должен состоять из одного символа (эмодзи)' })
  emoji?: string;
}
