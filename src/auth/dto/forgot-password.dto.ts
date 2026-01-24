import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
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
