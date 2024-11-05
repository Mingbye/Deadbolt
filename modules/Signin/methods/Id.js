const Signin = require("..");
const Deadbolt = require("../../..");

class Id {
  /**
   * @callback useSigninMethod
   * @param {string} id
   * @param {string | undefined} password
   * @returns {Promise <Signin.Success | Deadbolt.ConfirmForeignCode>}
   * @throws {Id.RejectedError}
   */

  /**
   * @callback confirmForeignCode
   * @param {{}} data
   * @param {string} code
   * @returns {Promise <Signin.Success | Deadbolt.ConfirmForeignCode>}
   * @throws {Deadbolt.ConfirmForeignCode.RejectedError}
   */

  /**
   * @param {Object} obj
   * @param {boolean} obj.withPassword - Whether the id sign-in module should include a password field
   * @param {"emailAddress" | "phonenumber" | "username" } obj.variant
   * @param {boolean} obj.trimInput - Whether the id input by the user should be trimmed of white spaces
   * @param {useSigninMethod} obj.useSigninMethod
   * @param {confirmForeignCode} obj.confirmForeignCode
   */
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
  /**
   * @param {Object} param;
   * @param {"noMatch"} [param.variant]
   * @param {String} [param.customMessage]
   */
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};

module.exports = Id;
