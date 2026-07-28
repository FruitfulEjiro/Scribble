export enum ContributorRole {
  owner = 'owner',
  editor = 'editor',
  viewer = 'viewer',
}

export enum ContributorStatus {
  pending = 'pending',
  active = 'active',
  inactive = 'inactive',
}

export enum InviteStatus {
  pending = 'pending',
  accepted = 'accepted',
  declined = 'declined',
  expired = 'expired',
  revoked = 'revoked',
}


export enum PostStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived'
}