export default class ConfirmForeignCode {
  constructor({ codeWhere, codeWhereIdentifier, trimInput, onSubmit }) {
    this.codeWhere = codeWhere;
    this.codeWhereIdentifier = codeWhereIdentifier;
    this.trimInput = trimInput;
    this.onSubmit = onSubmit;
  }
}

ConfirmForeignCode.RejectedError = class {
  /**
   * @param {Object} param;
   * @param {"invalid" | "expired"} [param.variant]
   * @param {String} [param.customMessage]
   */
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};
