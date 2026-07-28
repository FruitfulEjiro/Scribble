import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { PostOwnerGuard } from 'src/lib/guards';
import { CurrentUser, Public } from 'src/lib/decorators';
import { User } from 'generated/prisma/client';
import { PostExistPipe } from 'src/lib/pipes';
import { ContributorRole, InviteStatus } from 'src/lib/enums';
import { PostContributorGuard } from 'src/lib/guards';
import { PostInviterGuard } from './guards/post-inviter-guard';

@Controller('invites')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post('/send/:id')
  @UseGuards(PostOwnerGuard)
  @HttpCode(HttpStatus.OK)
  async sendInvite(
    @Param('id', PostExistPipe) id: string,
    @CurrentUser() user: User,
    @Body() data: { email: string; role: ContributorRole },
  ) {
    const invite = await this.inviteService.sendInvite(
      user,
      id,
      data.email,
      data.role,
    );
    return {
      status: true,
      message: 'invites retrieved successfully',
      data: invite,
    };
  }

  @Get('accept')
  @UseGuards(PostContributorGuard)
  @HttpCode(HttpStatus.OK)
  async acceptInvite(@Query('token') token: string) {
    const invite = await this.inviteService.acceptInvite(token);

    return {
      status: true,
      message: 'invites retrieved successfully',
      data: invite,
    };
  }

  @Get('decline')
  @UseGuards(PostContributorGuard)
  @HttpCode(HttpStatus.OK)
  async declineInvite(@Query('token') token: string) {
    const invite = await this.inviteService.declineInvite(token);

    return {
      status: true,
      message: 'invites retrieved successfully',
      data: invite,
    };
  }

  @Post('revoke/:id')
  @UseGuards(PostInviterGuard)
  @HttpCode(HttpStatus.OK)
  async revokeInvite(@Param('id') id: string) {
    const invite = await this.inviteService.revokeInvite(id);

    return {
      status: true,
      message: 'invites retrieved successfully',
      data: invite,
    };
  }

  @Post('resend/:id')
  @UseGuards(PostInviterGuard)
  @HttpCode(HttpStatus.OK)
  async resendInvite(@Param('id') id: string) {
    const invite = await this.inviteService.resendInvite(id);

    return {
      status: true,
      message: 'invites retrieved successfully',
      data: invite,
    };
  }

  @Get('author')
  @HttpCode(HttpStatus.OK)
  async getAuthorInvites(
    @CurrentUser() user: User,
    @Query('status') status?: InviteStatus,
  ) {
    const invites = await this.inviteService.getAuthorInvites(user.id, status);

    return {
      status: true,
      message: 'invites retrieved successfully',
      data: invites,
    };
  }
}
