import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ConversationRenameDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  autoGenerate?: boolean;
}
