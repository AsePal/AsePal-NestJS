import type { Request } from 'express';

import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserInfoDto } from './dto/user-info.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Req() req: Request & { user: { userId: string } }): Promise<UserInfoDto> {
    const userId = req.user.userId;
    return this.userService.getUserInfo(userId);
  }

  @Put('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @Req() req: Request & { user: { userId: string } },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UserInfoDto> {
    const userId = req.user.userId;
    return this.userService.updateAvatar(userId, file);
  }
}
