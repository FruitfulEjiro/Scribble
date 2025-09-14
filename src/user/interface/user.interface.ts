import { IPost } from 'src/post/interface/post.interface';

interface IUser {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password?: string;
  userType: 'user' | 'author' | 'admin';
  post?: IPost[];
  refreshToken?: string | null;
  accessToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetTokenExpiresAt?: Date | null;
  passwordChangedAt?: Date | null;
  updatedAt?: Date;
  createdAt?: Date;
}

export default IUser;
