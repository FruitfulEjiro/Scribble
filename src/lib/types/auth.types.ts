import { Request } from 'express';

export type AuthenticatedUser = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  image?: {
    secure_url: string;
    public_id: string;
  };
  isEmailVerified: boolean;
  status?: string;
  refreshToken: string;
  createdAt?: Date;
};

// export interface RequestWithUser extends Request {
//     user?: AuthenticatedUser;
// }
