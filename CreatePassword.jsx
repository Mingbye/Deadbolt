export default class CreatePassword {
  constructor({ onSubmit }) {
    this.onSubmit = onSubmit;
  }
}

CreatePassword.RejectedError = class {
  /**
   * @param {Object} param;
   * @param {"lengthShort" | "lengthLong" | "weak"} [param.variant]
   * @param {String} [param.customMessage]
   */
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};
