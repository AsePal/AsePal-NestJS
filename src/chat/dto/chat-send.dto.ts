import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatSendDto {
  @IsString()
  @IsNotEmpty()
  //   @Transform(({ value, obj }) => value ?? obj['消息'])
  message!: string;

  @IsOptional()
  @IsString()
  //   @Transform(({ value, obj }) => value ?? obj['对话ID'])
  conversationId?: string;
}
