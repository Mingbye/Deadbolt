const Id = require("./methods/Id");

class Signup {
  #methods;

  /**
   * @param {Object} obj
   * @param {Object.<string,(Signup.Id)>} obj.methods
   */
  constructor({ methods }) {
    this.#methods = methods;
  }

  get methods() {
    return this.#methods;
  }
}

Signup.Success = class {
  /**
   * @param {Object} obj
   * @param {string} obj.user - The reference to the user
   * @param {() => Promise<string>} obj.createAutoSigninToken - The reference to the auto signin token
   */
  constructor({ user, createAutoSigninToken }) {
    this.user = user;
    this.createAutoSigninToken = createAutoSigninToken;
  }
};

Signup.Id = Id;

module.exports = Signup;
