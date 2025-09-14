import IUser from 'src/user/interface/user.interface';

export interface IGroupPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  writers: IUser[];
}
