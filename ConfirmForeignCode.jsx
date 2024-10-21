export default class ConfirmForeignCode {
  constructor({ codePlacement, trimInput, onSubmit }) {
    this.codePlacement = codePlacement;
    this.trimInput = trimInput;
    this.onSubmit = onSubmit;
  }
}

ConfirmForeignCode.InvalidCodeError = class {};

ConfirmForeignCode.ExpiredCodeError = class {};

ConfirmForeignCode.CodePlacement = class {
  constructor(subtitle, identifier, helperText) {
    this.subtitle = subtitle;
    this.identifier = identifier;
    this.helperText = helperText;
  }
};

ConfirmForeignCode.CodePlacement.SentInEmail = class extends (
  ConfirmForeignCode.CodePlacement
) {
  constructor(emailAdress, helperText) {
    super(null, emailAdress, helperText);
  }
};

ConfirmForeignCode.CodePlacement.SentInSms = class extends (
  ConfirmForeignCode.CodePlacement
) {
  constructor(phonenumber, helperText) {
    super(null, phonenumber, helperText);
  }
};

ConfirmForeignCode.CodePlacement.PassString = class extends (
  ConfirmForeignCode.CodePlacement
) {
  constructor(subtitle, stringHint, helperText) {
    super(subtitle, stringHint, helperText);
  }
};

ConfirmForeignCode.CodePlacement.Authenticator = class extends (
  ConfirmForeignCode.CodePlacement
) {
  constructor() {
    super(null, null, null);
  }
};
