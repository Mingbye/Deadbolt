const Id = require("./methods/Id");

class Signup {
  #methods;

  constructor({ methods }) {
    this.#methods = methods;
  }

  get methods() {
    return this.#methods;
  }
}

Signup.Success = class {
  constructor({ user, createAutoSigninToken }) {
    this.user = user;
    this.createAutoSigninToken = createAutoSigninToken;
  }
};

Signup.Id = Id;

module.exports = Signup;
