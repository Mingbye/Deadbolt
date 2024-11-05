class Id {
  constructor({
    // requirePassAntiRobotChallengeBeforeHand = undefined,
    variant = undefined,
    trimInput = undefined,
    signup,
    autoSignin = undefined,
    confirmForeignCode,
    createPassword,
  }) {
    // this.requirePassAntiRobotChallengeBeforeHand =
    //   requirePassAntiRobotChallengeBeforeHand;
    this.variant = variant;
    this.trimInput = trimInput;
    this.signup = signup;
    this.autoSignin = autoSignin;
    this.confirmForeignCode = confirmForeignCode;
    this.createPassword = createPassword;
  }
}

Id.RejectedError = class {
  /**
   * @param {Object} param;
   * @param {"inUseOrUnavailable" | "invalid"} [param.variant]
   * @param {String} [param.customMessage]
   */
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};

module.exports = Id;
