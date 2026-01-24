export class UserInfoDto {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
