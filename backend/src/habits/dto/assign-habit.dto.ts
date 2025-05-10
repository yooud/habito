import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class AssignHabitDto {
  @IsString()
  childId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 