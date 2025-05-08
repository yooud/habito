import { IsString, IsEmail, IsEnum } from 'class-validator';

export enum UserRole {
  PARENT = 'parent',
  CHILD = 'child',
}

export class AddMemberDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
} 