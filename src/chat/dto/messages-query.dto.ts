import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class MessagesQueryDto {
  @IsString()
  @IsNotEmpty()
  conversation_id!: string;

  @IsOptional()
  @IsString()
  first_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
