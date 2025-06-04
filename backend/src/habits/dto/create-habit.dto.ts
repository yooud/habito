import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  MaxLength 
} from 'class-validator';

export enum DayOfWeek {
  MON = 'Mon',
  TUE = 'Tue',
  WED = 'Wed',
  THU = 'Thu',
  FRI = 'Fri',
  SAT = 'Sat',
  SUN = 'Sun',
}

export class CreateHabitDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  points: number;

  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  schedule: DayOfWeek[];

  @IsOptional()
  @IsString({ message: 'emoji must be a string' })
  @MaxLength(2, { message: 'emoji must consist of one character' })
  emoji?: string;
}
