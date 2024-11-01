const Id = require("./methods/Id");

class Signin {
  #methods;

  constructor({ methods }) {
    this.#methods = methods;
  }

  get methods() {
    return this.#methods;
  }
}

Signin.Success = class {
  constructor({ user, createSignin }) {
    this.user = user;
    this.createSignin = createSignin;
  }
};

Signin.Id = Id;

module.exports = Signin;
