import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: '手机号格式不正确' })
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;
}
