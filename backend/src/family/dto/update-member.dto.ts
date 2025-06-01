import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { UserRole } from './add-member.dto';

export class UpdateMemberDto {
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be either "parent" or "child"' })
  role?: UserRole;

  @ValidateIf(
    (o: UpdateMemberDto) => o.name === undefined && o.role === undefined,
  )
  _atLeastOne?: any;
}
