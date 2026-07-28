export namespace InviteEvents {
  export class InviteContributor {
    constructor(
      public readonly email: string,
      public readonly postTitle: string,
      public readonly authorUsername: string,
      public readonly inviteLink: string,
      public readonly declineLink: string,
      public readonly role: string,
    ) {}
  }

  export class InvitationUpdate {
    constructor(
      public readonly email: string,
      public readonly role: string,
      public readonly collaboratorUsername: string,
      public readonly postTitle: string,
      public readonly postUrl: string,
      public readonly collaboratorEmail: string,
    ) {}
  }
}
