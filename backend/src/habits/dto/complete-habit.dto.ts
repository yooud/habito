import { IsString, IsOptional } from 'class-validator';

export class CompleteHabitDto {
  @IsString()
  @IsOptional()
  note?: string;
} 