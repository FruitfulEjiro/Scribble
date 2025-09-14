import IUser from 'src/user/interface/user.interface';

export interface IPost {
  id?: string;
  author?: IUser;
  authorId?: string;
  title?: string;
  content?: string;
  tags: string[];
  category: string;
  status: "published" | "draft" | "archived"
  updatedAt?: Date;
  createdAt?: Date;
}
