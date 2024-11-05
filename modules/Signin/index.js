const Id = require("./methods/Id");

class Signin {
  #methods;

  /**
   * @param {Object} obj
   * @param {Object.<string,(Signin.Id)>} obj.methods
   */
  constructor({ methods }) {
    this.#methods = methods;
  }

  get methods() {
    return this.#methods;
  }
}

Signin.Success = class {
  /**
   * @param {Object} obj
   * @param {string} obj.user - The reference to the user
   * @param {() => Promise<string>} obj.createSignin - The reference to the signin
   */
  constructor({ user, createSignin }) {
    this.user = user;
    this.createSignin = createSignin;
  }
};

Signin.Id = Id;

module.exports = Signin;
