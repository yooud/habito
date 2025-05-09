import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class AssignHabitDto {
  @IsString()
  childUid: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 