export default class ConfirmForeignCode {
  constructor({ codeWhere, codeWhereIdentifier, trimInput, onSubmit }) {
    this.codeWhere = codeWhere;
    this.codeWhereIdentifier = codeWhereIdentifier;
    this.trimInput = trimInput;
    this.onSubmit = onSubmit;
  }
}

ConfirmForeignCode.RejectedError = class {
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};
