import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ContributorRole,
  ContributorStatus,
  InviteStatus,
} from 'src/lib/enums';
import { InviteRepo } from './repository/invite.repository';
import { createHash, randomBytes } from 'crypto';
import EventEmitter2 from 'eventemitter2';
import { EVENTS, InviteEvents } from 'src/shared/events';
import { User } from 'generated/prisma/client';

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(
    private readonly inviteRepo: InviteRepo,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendInvite(
    author: User,
    postId: string,
    email: string,
    role: ContributorRole,
  ) {
    const post = await this.inviteRepo.getPost(postId);
    if (!post) throw new BadRequestException('post not found');
    // check if invite already exist
    const checkInvite = await this.inviteRepo.findOne({
      email,
      postId: post.id,
    });
    if (checkInvite) throw new BadRequestException('invite already exists');

    // check if invited user exist
    const checkInviteduser = await this.inviteRepo.getInvitedUser(email);
    if (!checkInviteduser)
      throw new BadRequestException('user is not an author');

    // CREATE INVITE
    /*
    1. create token and hashtoken
    2. create url
    3. create invite and save to db
    */
    const token = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(token).digest('hex');
    const inviteurl = `${process.env.APP_URL}/invites/accept?token=${token}`;
    const declineurl = `${process.env.APP_URL}/invites/decline?token=${token}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    expiresAt.setHours(23, 59, 59, 999);

    const invite = await this.inviteRepo
      .create({
        email,
        post: {
          connect: {
            id: post.id,
          },
        },
        invitedBy: {
          connect: {
            id: post.authorId,
          },
        },
        invitedUser: {
          connect: {
            id: checkInviteduser.id,
          },
        },
        role,
        token: hashedToken,
        expiresAt,
      })
      .then((data) => {
        this.logger.log('post invite created');
        return data;
      })
      .catch((error) => {
        this.logger.error("couldn't create post invite", error);
        throw new InternalServerErrorException("couldn't create post invite");
      });

    // check if contributor already exist
    const checkContributor = await this.inviteRepo.getPostContributor(
      post.id,
      checkInviteduser.id,
    );
    if (checkContributor)
      throw new BadRequestException(
        'user is already a contributor to this post',
      );

    // create PostContributor
    await this.inviteRepo
      .createContributor({
        userId: checkInviteduser.id,
        postId: post.id,
        role,
        invitedAt: invite.createdAt,
      })
      .then((data) => {
        this.logger.log('post contributor created');
        return data;
      })
      .catch((error) => {
        this.logger.error("couldn't create post contributor", error);
        throw new InternalServerErrorException(
          "couldn't create post contributor",
        );
      });

    // send email to Author and Contributor
    this.eventEmitter.emit(
      EVENTS.INVITE_USER,
      new InviteEvents.InviteContributor(
        email,
        post.title,
        author.username,
        inviteurl,
        declineurl,
        invite.role,
      ),
    );
    this.logger.log('emitted post invite event');
    // send notification to Author and Contributor

    return invite;
  }

  async acceptInvite(token: string) {
    if (!token) throw new BadRequestException('token is invalid');
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // check for invite
    const invite = await this.inviteRepo.findOne({
      token: hashedToken,
    });

    if (!invite) throw new NotFoundException('invite not found');

    if (invite.status === InviteStatus.revoked)
      throw new BadRequestException('invite has been revoked by the author');

    if (invite.status === InviteStatus.declined)
      throw new BadRequestException('you have already declined this invite');

    if (invite.status === InviteStatus.accepted)
      throw new BadRequestException('you have already accepted this invite');

    if (
      invite.status === InviteStatus.expired ||
      invite.expiresAt < new Date(Date.now())
    )
      throw new BadRequestException('invite has expired');

    // const check post
    const post = await this.inviteRepo.getPost(invite.postId);
    if (!post) throw new NotFoundException("post doesn't exist");

    // accept invite
    const acceptInvite = await this.inviteRepo
      .update(invite.id, {
        status: InviteStatus.accepted,
        acceptedAt: new Date(Date.now()),
      })
      .then((data) => {
        this.logger.log('invitation accepted');
        return data;
      })
      .catch((error) => {
        this.logger.error('invitation couldnt be accepted', error);
        throw new InternalServerErrorException(
          "invitation couldn't be accepted",
        );
      });

    const postContributor = await this.inviteRepo.getPostContributor(
      post.id,
      invite.invitedUserId!,
    );

    await this.inviteRepo.updatePostContributor(postContributor?.id!, {
      status: ContributorStatus.active,
      acceptedAt: acceptInvite!.acceptedAt,
    });

    const postUrl = `${process.env.APP_URL}/posts/${post.id}`;

    await this.eventEmitter.emit(
      EVENTS.INVITATION_ACCEPTED,
      new InviteEvents.InvitationUpdate(
        post.author.email,
        acceptInvite!.role,
        postContributor!.contributor.username,
        post.title,
        postUrl,
        postContributor!.contributor.email,
      ),
    );

    // send notification to author

    return acceptInvite;
  }

  async declineInvite(token: string) {
    if (!token) throw new BadRequestException('token is invalid');
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // check for invite
    const invite = await this.inviteRepo.findOne({
      token: hashedToken,
    });

    if (!invite) throw new NotFoundException('invite not found');

    if (invite.status === InviteStatus.revoked)
      throw new BadRequestException('invite has been revoked by the author');

    if (invite.status === InviteStatus.declined)
      throw new BadRequestException('you have already declined this invite');

    if (invite.status === InviteStatus.accepted)
      throw new BadRequestException('you have already accepted this invite');

    if (
      invite.status === InviteStatus.expired ||
      invite.expiresAt < new Date(Date.now())
    )
      throw new BadRequestException('invite has expired');

    // const check post
    const post = await this.inviteRepo.getPost(invite.postId);
    if (!post) throw new NotFoundException("post doesn't exist");

    // accept invite
    const declineInvite = await this.inviteRepo
      .update(invite.id, {
        status: InviteStatus.declined,
        declinedAt: new Date(Date.now()),
      })
      .then((data) => {
        this.logger.log('invitation declined');
        return data;
      })
      .catch((error) => {
        this.logger.error('invitation couldnt be declined', error);
        throw new InternalServerErrorException(
          "invitation couldn't be declined",
        );
      });

    const postContributor = await this.inviteRepo.getPostContributor(
      post.id,
      invite.invitedUserId!,
    );

    await this.inviteRepo.updatePostContributor(postContributor?.id!, {
      status: ContributorStatus.active,
      acceptedAt: declineInvite!.acceptedAt,
    });

    const postUrl = `${process.env.APP_URL}/posts/${post.id}`;

    await this.eventEmitter.emit(
      EVENTS.INVITATION_DECLINED,
      new InviteEvents.InvitationUpdate(
        post.author.email,
        declineInvite!.role,
        postContributor!.contributor.username,
        post.title,
        postUrl,
        postContributor!.contributor.email,
      ),
    );

    // send notification to author

    return declineInvite;
  }

  async revokeInvite(inviteId: string) {
    const invite = await this.inviteRepo.findById(inviteId);
    if (!invite) throw new NotFoundException('invite not found');

    if (invite.status === InviteStatus.revoked)
      throw new BadRequestException('you already revoked this invite');

    const revokedInvite = await this.inviteRepo
      .update(inviteId, { status: InviteStatus.revoked })
      .then((data) => this.logger.log('invite has been revoked'))
      .catch((error) => this.logger.log("couldn't revoke invite"));

    const contributor = await this.inviteRepo.getPostContributor(
      invite.postId,
      invite.invitedUserId!,
    );

    await this.inviteRepo.updatePostContributor(contributor!.id, {
      status: ContributorStatus.inactive,
    });

    return revokedInvite;
  }

  async resendInvite(inviteId: string) {
    const token = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const inviteUrl = `${process.env.APP_URL}/invites/accept?token=${token}`;
    const declineUrl = `${process.env.APP_URL}/invites/decline?token=${token}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    expiresAt.setHours(23, 59, 59, 999);

    const invite = await this.inviteRepo
      .update(inviteId, {
        token: hashedToken,
        expiresAt,
        status: InviteStatus.pending,
      })
      .then((data) => {
        this.logger.log('invitation has been resent');
        return data;
      })
      .catch((error) => {
        this.logger.error("couldn't resend invitation", error);
        throw new InternalServerErrorException('couldnt resend invitation');
      });

    const contributor = await this.inviteRepo.getPostContributor(
      invite!.postId,
      invite!.invitedUserId!,
    );

    await this.inviteRepo.updatePostContributor(contributor!.id, {
      status: ContributorStatus.inactive,
    });

    // send email to Author and Contributor
    this.eventEmitter.emit(
      EVENTS.INVITE_USER,
      new InviteEvents.InviteContributor(
        invite!.email,
        contributor!.post.title,
        contributor!.post.author.username,
        inviteUrl,
        declineUrl,
        invite!.role,
      ),
    );
    this.logger.log('emitted post invite event');
    // send notification to Author and Contributor

    return invite;
  }

  async getAuthorInvites(authorId: string, filter?: InviteStatus) {
    const filterObj: Record<string, any> = {};

    if (filter) filterObj.status = filter;

    const invites = await this.inviteRepo.findAll({
      invitedBy: { id: authorId },
      ...filterObj,
    });

    if (!invites) return [];

    return invites;
  }
}
