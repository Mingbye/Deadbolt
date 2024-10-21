export default class CreatePassword {
  constructor({  onSubmit }) {
    this.onSubmit = onSubmit;
  }
}

CreatePassword.PasswordUnallowedError = class {};