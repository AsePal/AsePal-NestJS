import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: '手机号格式不正确' })
  phone?: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  identifier: string; // email or phone

  @IsNotEmpty()
  @IsString()
  verificationCode: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
