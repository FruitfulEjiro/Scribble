import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PrismaService from 'src/prisma/prisma.service';
import { IPost } from './interface/post.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import EmailService from 'src/email/email.service';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
    private readonly email: EmailService,
  ) {}

  async createPost(data: Prisma.PostUncheckedCreateInput): Promise<IPost> {
    const post = await this.prisma.post.create({ data });
    if (!post) throw new InternalServerErrorException('failed to create post');

    return <IPost>post;
  }

  async inviteContributor(email: string, postId: string) {
    const author = await this.prisma.user.findUnique({ where: { email } });
    if (!author) throw new NotFoundException("user doesn't exist");

    // send email to user to invite them to collaborate

    // send invited user a notification

    return { message: 'invite sent successfully' };
  }

  async acceptInvite(token: string) {
    const payload = await this.verifyInvite(token);

    const [user, post] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: payload.email } }),
      this.prisma.post.findUnique({ where: { id: payload.postId } }),
    ]);
    if (!user) throw new NotFoundException('user not found');
    if (!post) throw new NotFoundException('post not found');

    await this.prisma.postContributors.create({
      data: {
        userId: user.id,
        postId: payload.postId,
      },
    });

    // notify author by mail of the accepted invite

    // send author a notification

    return { message: 'invite accepted' };
  }

  async findPostById(postId: string): Promise<IPost> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId, status: 'published' },
    });
    if (!post) throw new NotFoundException('post not found');

    return <IPost>post;
  }

  async findPostByUserId(userId: string): Promise<IPost[]> {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
    });
    if (!posts) throw new NotFoundException('no posts found');

    return <IPost[]>posts;
  }

  async updatePost(
    userId: string,
    postId: string,
    data: Prisma.PostUpdateInput,
  ): Promise<IPost> {
    const updatePost = await this.prisma.post.update({
      where: { id: postId, authorId: userId },
      data: data,
    });
    if (!updatePost) throw new NotFoundException('post not found');

    return <IPost>updatePost;
  }

  async saveDraft(data: Prisma.PostUncheckedCreateInput): Promise<IPost> {
    const post = await this.prisma.post.create({ data });
    if (!post) throw new InternalServerErrorException('failed to create post');

    return <IPost>post;
  }

  async getDraftById(postId: string): Promise<IPost> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId, status: 'draft' },
    });
    if (!post) throw new NotFoundException('post not found');

    return <IPost>post;
  }

  async getUserDrafts(userId: string): Promise<IPost[]> {
    const drafts = await this.prisma.post.findMany({
      where: { authorId: userId, status: 'draft' },
    });
    if (!drafts) throw new NotFoundException('no drafts found');

    return <IPost[]>drafts;
  }

  async searchPosts(query: string, page = 1, limit = 5): Promise<{}> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where: {
          OR: [{ title: { contains: query, mode: 'insensitive' } }],
        },
        skip,
        take: limit,
      }),

      this.prisma.post.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            // { content: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async deletePost(postId: string, userId: string): Promise<{}> {
    const deletePost = await this.prisma.post.delete({
      where: { id: postId, authorId: userId },
    });
    if (!deletePost) throw new NotFoundException('post not found');

    return { message: 'post deleted successfully' };
  }

  private generateInviteLink(payload: {
    postId: string;
    email: string;
  }): string {
    const token = this.jwt.sign(payload, {
      expiresIn: this.configService.get<string>('inviteExpiresIn'),
    });

    const resetLink = `${this.configService.get<string>('frontendUrl')}/accept-invite?token=${token}`;
    return resetLink;
  }

  private verifyInvite(token: string): {
    postId: string;
    email: string;
  } {
    const payload = this.jwt.verify(token);
    return payload;
  }
}
