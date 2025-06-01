import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { UserRole } from './add-member.dto';

export class UpdateMemberDto {
  @IsOptional()
  @IsString({ message: 'name должен быть строкой' })
  name?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role должен быть "parent" или "child"' })
  role?: UserRole;

  @ValidateIf(o => o.name === undefined && o.role === undefined)
  _atLeastOne?: any;
}
