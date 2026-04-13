import { IsBoolean, IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: string;
}