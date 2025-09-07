export interface IUser {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  userType: 'user' | 'author' | 'admin';
  refreshToken?: string | null;
  accessToken?: string;
  updatedAt: Date;
  createdAt: Date;
}
