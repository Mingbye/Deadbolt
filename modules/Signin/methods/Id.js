class Id {
  constructor({
    // requirePassAntiRobotChallengeBeforeHand = undefined,
    withPassword = undefined,
    variant = undefined,
    trimInput = undefined,
    useSigninMethod,
    confirmForeignCode,
  }) {
    // this.requirePassAntiRobotChallengeBeforeHand =
    //   requirePassAntiRobotChallengeBeforeHand;
    this.withPassword = withPassword;
    this.variant = variant;
    this.trimInput = trimInput;
    this.useSigninMethod = useSigninMethod;
    this.confirmForeignCode = confirmForeignCode;
  }
}

Id.RejectedError = class {
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};

module.exports = Id;
