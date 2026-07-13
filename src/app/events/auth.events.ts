export namespace AuthEvents {
  export class SignupOtp {
    constructor(
      public readonly email: string,
      public readonly otp: string,
    ) {}
  }

  export class ResetPassword {
    constructor(
      public readonly email: string,
      public readonly code: string,
    ) {}
  }
}
