import IUser from 'src/user/interface/user.interface';
import { IPost } from './post.interface';

export interface IPostContributor {
  id: string;
  user?: IUser;
  post?: IPost;
  userId: string;
  postId: string;
}
