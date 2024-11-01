export default class CreatePassword {
  constructor({ onSubmit }) {
    this.onSubmit = onSubmit;
  }
}

CreatePassword.RejectedError = class {
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};
