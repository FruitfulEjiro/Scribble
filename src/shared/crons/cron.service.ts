import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContributorStatus, InviteStatus } from 'src/lib/enums';
import { PrismaService } from 'src/shared/database';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs every day at midnight UTC to expire pending invites and deactivate
   * their associated pending post contributors.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'UTC',
  })
  async cleanupExpiredInvites() {
    this.logger.log('Starting cleanup of expired invites...');

    const now = new Date();

    const expiredInvites = await this.prisma.invites.findMany({
      where: {
        expiresAt: { lt: now },
        status: InviteStatus.pending,
        invitedUserId: { not: null },
      },
      select: {
        postId: true,
        invitedUserId: true,
      },
    });

    const contributorPairs = expiredInvites.map(({ postId, invitedUserId }) => ({
      postId,
      userId: invitedUserId!,
    }));

    const transactions = [
      this.prisma.invites.updateMany({
        where: {
          expiresAt: { lt: now },
          status: InviteStatus.pending,
        },
        data: {
          status: InviteStatus.expired,
        },
      }),
    ];

    if (contributorPairs.length) {
      transactions.push(
        this.prisma.postContributors.updateMany({
          where: {
            status: ContributorStatus.pending,
            OR: contributorPairs,
          },
          data: {
            status: ContributorStatus.inactive,
          },
        }),
      );
    }

    const results = await this.prisma.$transaction(transactions);
    const inviteResult = results[0];
    const contributorResult = results[1] ?? { count: 0 };

    this.logger.log(
      `Expired ${inviteResult.count} invite(s) and deactivated ${contributorResult.count} contributor(s)`,
    );
  }
}
