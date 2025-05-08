import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
} 