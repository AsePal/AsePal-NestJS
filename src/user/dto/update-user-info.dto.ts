import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
