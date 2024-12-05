const fs = require("fs");
const path = require("path");
const routeParser = require("route-parser");
const Signin = require("./modules/Signin/index");
const Signup = require("./modules/Signup/index");
const bodyParser = require("body-parser");
const mimeTypes = require("mime-types");

/**
 * @class
 * Create instance of the Deadbolt class to introduce the structure of your app and obtain access to the different functionalities of deadbolt

 * @constructor
 * @param {{
 *  appName: string,
 *  modules:{
 *    signup: Deadbolt.Signup,
 *    signin: Deadbolt.Signin
 *  },
 * }} obj
 */
class Deadbolt {
  #appName;
  #modules;
  #onRemoteResolve;

  constructor({ appName = undefined, modules, onRemoteResolve } = {}) {
    this.#appName = appName;
    this.#modules = modules;
    this.#onRemoteResolve = onRemoteResolve;
  }

  /**
   * Get express function to handle requests at the specified route
   * @returns {function} - an expressjs' router function
   */
  get express() {
    return (requestObj, responder, next) => {
      function routeRequestObj(method, route, callback) {
        const match =
          method == undefined || method == requestObj.method
            ? new routeParser(route).match(requestObj.path)
            : null;

        if (match || null != null) {
          callback(requestObj.path, match);
          return true;
        }
        return false;
      }

      // => AUTO

      if (
        routeRequestObj("GET", `/auto/*autoPath`, (path_, match) => {
          let filePath = path.join(__dirname, `auto`, match.autoPath);

          // filePath = path.normalize(
          //   path.join(__dirname, `../react-package-test/dist`, match.autoPath)
          // );

          // console.log(filePath);

          if (!fs.existsSync(filePath)) {
            responder.status(404).end();
            return;
          }

          if (fs.lstatSync(filePath).isDirectory()) {
            filePath = path.join(filePath, "index.html");
          }

          if (!fs.existsSync(filePath)) {
            responder.status(404).end();
            return;
          }

          if (!fs.lstatSync(filePath).isFile()) {
            responder.status(404).end();
            return;
          }

          responder.type(mimeTypes.lookup(filePath));

          const stream = fs.createReadStream(filePath);

          stream.on("error", function (e) {
            responder.status(500).end();
          });

          stream.pipe(responder);
        }) == true
      ) {
        return;
      }

      // => SIGNUP

      if (
        routeRequestObj("POST", "/signup", (path, match) => {
          if (this.#modules.signup == undefined) {
            responder.status(400).end();
            return;
          }

          const result = {
            methods: (() => {
              const result = {};
              for (const key of Object.keys(this.#modules.signup.methods)) {
                const method = this.#modules.signup.methods[key];

                let methodTypeAndData = null;
                if (method instanceof Signup.Id) {
                  methodTypeAndData = {
                    type: "Id",
                    data: {
                      variant: method.variant,
                      trimInput: method.trimInput,
                      requirePassAntiRobotChallengeBeforeHand:
                        method.requirePassAntiRobotChallengeBeforeHand,
                    },
                  };
                }

                result[key] = methodTypeAndData;
              }
              return result;
            })(),
          };

          responder.status(200).end(JSON.stringify(result));
        }) == true
      ) {
        return;
      }

      if (
        routeRequestObj("POST", "/signup/:method", (path, match) => {
          const targetMethod =
            this.#modules.signup != undefined
              ? this.#modules.signup.methods[match.method]
              : undefined;

          if (targetMethod == undefined) {
            responder.status(400).end();
            return;
          }

          bodyParser.json()(requestObj, responder, async () => {
            if (targetMethod.requirePassAntiRobotChallengeBeforehand != null) {
              if (requestObj.body.solveAntiRobotChallenge == undefined) {
                responder.status(500).end(`solveAntiRobotChallenge:undefined`);
                return;
              }

              let passed = null;
              try {
                passed =
                  await targetMethod.requirePassAntiRobotChallengeBeforehand(
                    requestObj.body.solveAntiRobotChallenge.ref,
                    requestObj.body.solveAntiRobotChallenge.solution
                  );
              } catch (e) {
                // console.error(e);
                responder
                  .status(500)
                  .end(`requirePassAntiRobotChallengeBeforehand:Error`);
                return;
              }

              if (passed !== true) {
                responder.status(400).end(`ANTI-ROBOT-CHALLENGE-FAILED`);
                return;
              }
            }

            let result = null;
            try {
              result = await targetMethod.signup(requestObj.body.id);
            } catch (e) {
              if (e instanceof Deadbolt.Signup.Id.RejectedError) {
                responder.status(400).end(
                  `REJECTED:${JSON.stringify({
                    variant: e.variant,
                    customMessage: e.customMessage,
                  })}`
                );
                return;
              }

              responder.status(500).end(`signup:Error`);
              return;
            }

            if (result instanceof Deadbolt.Signup.Success) {
              let autoSigninToken = null;
              try {
                autoSigninToken = await result.createAutoSigninToken();
              } catch (e) {
                // console.error(e);
                responder
                  .status(500)
                  .end(`Signup.Success.createAutoSigninToken:Error`);
                return;
              }

              responder.status(200).end(
                JSON.stringify({
                  user: result.user,
                  autoSigninToken: autoSigninToken,
                })
              );
              return;
            }

            if (result instanceof Deadbolt.ConfirmForeignCode) {
              //the provider should have sent or prepared the foreign code by now before they returned this result.
              let stepPassToken = null;
              try {
                stepPassToken = await result.createStepPassToken();
              } catch (e) {
                console.error(e);
                responder
                  .status(500)
                  .end(`ConfirmForeignCode.createStepPassToken:Error`);
                return;
              }

              responder.status(428).end(
                `CONFIRM-FOREIGN-CODE:${JSON.stringify({
                  codeWhere: result.codeWhere,
                  codeWhereIdentifier: result.codeWhereIdentifier,
                  stepPassToken: stepPassToken,
                })}`
              );
              return;
            }

            if (result instanceof Deadbolt.CreatePassword) {
              let stepPassToken = null;
              try {
                stepPassToken = await result.createStepPassToken();
              } catch (e) {
                // console.error(e);
                responder
                  .status(500)
                  .end(`CreatePassword.createStepPassToken:Error`);
                return;
              }

              responder.status(428).end(
                `CREATE-PASSWORD:${JSON.stringify({
                  stepPassToken,
                })}`
              );
              return;
            }

            responder.status(500).end(`signup:Result`);
          });
        }) == true
      ) {
        return;
      }

      if (
        routeRequestObj("POST", "/signup/:method/autoSignin", (path, match) => {
          const targetMethod =
            this.#modules.signup != undefined
              ? this.#modules.signup.methods[match.method]
              : undefined;

          if (targetMethod == undefined) {
            responder.status(400).end();
            return;
          }

          bodyParser.json()(requestObj, responder, async () => {
            if (targetMethod instanceof Deadbolt.Signup.Id) {
              if (targetMethod.autoSignin == undefined) {
                responder.status(404).end("autoSignin:undefined");
                return;
              }

              let autoSigninResult = null;
              try {
                autoSigninResult = await targetMethod.autoSignin(
                  requestObj.body.user,
                  requestObj.body.autoSigninToken
                );
              } catch (e) {
                responder.status(500).end(`autoSignin:Error`);
                return;
              }

              responder.status(200).end(autoSigninResult);
              return;
            }

            responder.status(404).end();
          });
        }) == true
      ) {
        return;
      }

      if (
        routeRequestObj(
          "POST",
          "/signup/:method/withConfirmForeignCodeStep",
          (path, match) => {
            const targetMethod =
              this.#modules.signup != undefined
                ? this.#modules.signup.methods[match.method]
                : undefined;

            if (targetMethod == undefined) {
              responder.status(400).end();
              return;
            }

            bodyParser.json()(requestObj, responder, async () => {
              if (targetMethod instanceof Deadbolt.Signup.Id) {
                if (targetMethod.confirmForeignCode == undefined) {
                  responder.status(404).end("confirmForeignCode:undefined");
                  return;
                }

                let result = null;
                try {
                  result = await targetMethod.confirmForeignCode(
                    {
                      codeWhere: requestObj.body.codeWhere,
                      codeWhereIdentifier: requestObj.body.codeWhereIdentifier,
                      stepPassToken: requestObj.body.stepPassToken,
                    },
                    requestObj.body.code
                  );
                } catch (e) {
                  if (e instanceof Deadbolt.ConfirmForeignCode.RejectedError) {
                    responder.status(400).end(
                      `REJECTED:${JSON.stringify({
                        variant: e.variant,
                        customMessage: e.customMessage,
                      })}`
                    );
                    return;
                  }

                  responder.status(500).end(`confirmForeignCode:Error`);
                  return;
                }

                if (result instanceof Deadbolt.Signup.Success) {
                  let autoSigninToken = null;
                  try {
                    autoSigninToken = await result.createAutoSigninToken();
                  } catch (e) {
                    // console.error(e);
                    responder
                      .status(500)
                      .end(`Signup.Success.createAutoSigninToken:Error`);
                    return;
                  }

                  responder.status(200).end(
                    JSON.stringify({
                      user: result.user,
                      autoSigninToken: autoSigninToken,
                    })
                  );
                  return;
                }

                if (result instanceof Deadbolt.ConfirmForeignCode) {
                  //the provider should have sent or prepared the foreign code by now before they returned this result.
                  let stepPassToken = null;
                  try {
                    stepPassToken = await result.createStepPassToken();
                  } catch (e) {
                    console.error(e);
                    responder
                      .status(500)
                      .end(`ConfirmForeignCode.createStepPassToken:Error`);
                    return;
                  }

                  responder.status(428).end(
                    `CONFIRM-FOREIGN-CODE:${JSON.stringify({
                      codeWhere: result.codeWhere,
                      codeIdentifier: result.codeWhereIdentifier,
                      stepPassToken,
                    })}`
                  );
                  return;
                }

                if (result instanceof Deadbolt.CreatePassword) {
                  let stepPassToken = null;
                  try {
                    stepPassToken = await result.createStepPassToken();
                  } catch (e) {
                    console.error(e);
                    responder
                      .status(500)
                      .end(`CreatePassword.createStepPassToken:Error`);
                    return;
                  }

                  responder.status(428).end(
                    `CREATE-PASSWORD:${JSON.stringify({
                      stepPassToken,
                    })}`
                  );
                  return;
                }

                responder.status(500).end(`confrimForeignCode:Result`);

                return;
              }

              responder.status(404).end();
            });
          }
        ) == true
      ) {
        return;
      }

      if (
        routeRequestObj(
          "POST",
          "/signup/:method/withCreatePasswordStep",
          (path, match) => {
            const targetMethod =
              this.#modules.signup != undefined
                ? this.#modules.signup.methods[match.method]
                : undefined;

            if (targetMethod == undefined) {
              responder.status(400).end();
              return;
            }

            bodyParser.json()(requestObj, responder, async () => {
              if (targetMethod instanceof Deadbolt.Signup.Id) {
                if (targetMethod.createPassword == undefined) {
                  responder.status(404).end("createPassword:undefined");
                  return;
                }

                let result = null;
                try {
                  result = await targetMethod.createPassword(
                    {
                      stepPassToken: requestObj.body.stepPassToken,
                    },
                    requestObj.body.password
                  );
                } catch (e) {
                  if (e instanceof Deadbolt.CreatePassword.RejectedError) {
                    responder.status(400).end(
                      `REJECTED:${JSON.stringify({
                        variant: e.variant,
                        customMessage: e.customMessage,
                      })}`
                    );
                    return;
                  }

                  responder.status(500).end(`createPassword:Error`);
                  return;
                }

                if (result instanceof Deadbolt.Signup.Success) {
                  let autoSigninToken = null;
                  try {
                    autoSigninToken = await result.createAutoSigninToken();
                  } catch (e) {
                    // console.error(e);
                    responder
                      .status(500)
                      .end(`Signup.Success.createAutoSigninToken:Error`);
                    return;
                  }

                  responder.status(200).end(
                    JSON.stringify({
                      user: result.user,
                      autoSigninToken: autoSigninToken,
                    })
                  );
                  return;
                }

                if (result instanceof Deadbolt.ConfirmForeignCode) {
                  //the provider should have sent or prepared the foreign code by now before they returned this result.
                  let stepPassToken = null;
                  try {
                    stepPassToken = await result.createStepPassToken();
                  } catch (e) {
                    // console.error(e);
                    responder
                      .status(500)
                      .end(`ConfirmForeignCode.createStepPassToken:Error`);
                    return;
                  }

                  responder.status(428).end(
                    `CONFIRM-FOREIGN-CODE:${JSON.stringify({
                      codeWhere: result.codeWhere,
                      codeIdentifier: result.codeWhereIdentifier,
                      stepPassToken: stepPassToken,
                    })}`
                  );
                  return;
                }

                if (result instanceof Deadbolt.CreatePassword) {
                  let stepPassToken = null;
                  try {
                    stepPassToken = await result.createStepPassToken();
                  } catch (e) {
                    // console.error(e);
                    responder
                      .status(500)
                      .end(`CreatePassword.createStepPassToken:Error`);
                    return;
                  }

                  responder.status(428).end(
                    `CREATE-PASSWORD:${JSON.stringify({
                      stepPassToken: stepPassToken,
                    })}`
                  );
                  return;
                }

                responder.status(500).end(`createPassword:Result`);

                return;
              }

              responder.status(404).end();
            });
          }
        ) == true
      ) {
        return;
      }

      // => SIGNIN

      if (
        routeRequestObj("POST", "/signin", (path, match) => {
          if (this.#modules.signin == undefined) {
            responder.status(400).end();
            return;
          }

          const result = {
            methods: (() => {
              const result = {};
              for (const key of Object.keys(this.#modules.signin.methods)) {
                const method = this.#modules.signin.methods[key];

                let methodTypeAndData = null;
                if (method instanceof Signin.Id) {
                  methodTypeAndData = {
                    type: "Id",
                    data: {
                      variant: method.variant,
                      trimInput: method.trimInput,
                      requirePassAntiRobotChallengeBeforeHand:
                        method.requirePassAntiRobotChallengeBeforeHand,
                      withPassword: method.withPassword,
                    },
                  };
                }

                result[key] = methodTypeAndData;
              }
              return result;
            })(),
          };

          responder.status(200).end(JSON.stringify(result));
        }) == true
      ) {
        return;
      }

      if (
        routeRequestObj("POST", "/signin/:method", (path, match) => {
          const targetMethod =
            this.#modules.signin != undefined
              ? this.#modules.signin.methods[match.method]
              : undefined;

          if (targetMethod == undefined) {
            responder.status(400).end();
            return;
          }

          if (targetMethod instanceof Deadbolt.Signin.Id) {
            bodyParser.json()(requestObj, responder, async () => {
              // if (
              //   targetMethod.requirePassAntiRobotChallengeBeforehand != null
              // ) {
              //   if (requestObj.body.solveAntiRobotChallenge == null) {
              //     responder
              //       .status(500)
              //       .end(`solveAntiRobotChallenge:undefined`);
              //     return;
              //   }

              //   let passed = null;
              //   try {
              //     passed =
              //       await targetMethod.requirePassAntiRobotChallengeBeforehand(
              //         requestObj.body.solveAntiRobotChallenge.ref,
              //         requestObj.body.solveAntiRobotChallenge.solution
              //       );
              //   } catch (e) {
              //     // console.error(e);
              //     responder
              //       .status(500)
              //       .end(`requirePassAntiRobotChallengeBeforeHand:Error`);
              //     return;
              //   }

              //   if (passed !== true) {
              //     responder.status(400).end(`ANTI-ROBOT-CHALLENGE-FAILED`);
              //     return;
              //   }
              // }

              let result = null;
              try {
                result = await targetMethod.useSigninMethod(
                  requestObj.body.id,
                  requestObj.body.password
                );
              } catch (e) {
                if (e instanceof Deadbolt.Signin.Id.RejectedError) {
                  responder.status(400).end(
                    `REJECTED:${JSON.stringify({
                      variant: e.variant,
                      customMessage: e.customMessage,
                    })}`
                  );
                  return;
                }

                // console.error(e);
                responder.status(500).end(`useSigninMethod:Error`);
                return;
              }

              if (result instanceof Deadbolt.Signin.Success) {
                let signin = null;
                try {
                  signin = await result.createSignin();
                } catch (e) {
                  // console.error(e);
                  responder
                    .status(500)
                    .end(`Signin.Success.createSignin:Error`);
                  return;
                }

                responder.status(200).end(
                  JSON.stringify({
                    user: result.user,
                    signin,
                  })
                );
                return;
              }

              // if (result instanceof Deadbolt.SolveAntiRobotChallenge) {
              //   let stepPassToken = null;
              //   try {
              //     stepPassToken = await result.createNextStepToken();
              //   } catch (e) {
              //     console.error(e);
              //     responder.status(500).end();
              //     return;
              //   }

              //   responder.status(428).end(
              //     `SOLVE-ANTI-ROBOT-CHALLENGE:${JSON.stringify({
              //       stepPassToken: stepPassToken,
              //     })}`
              //   );
              //   return;
              // }

              if (result instanceof Deadbolt.ConfirmForeignCode) {
                //the provider should have sent or prepared the foreign code by now before they returned this result.
                let stepPassToken = null;
                try {
                  stepPassToken = await result.createStepPassToken();
                } catch (e) {
                  console.error(e);
                  responder
                    .status(500)
                    .end(`ConfrimForeignCode.createStepPassToken:Error`);
                  return;
                }

                responder.status(428).end(
                  `CONFIRM-FOREIGN-CODE:${JSON.stringify({
                    codeWhere: result.codeWhere,
                    codeWhereIdentifier: result.codeWhereIdentifier,
                    trimInput: result.trimInput,
                    stepPassToken: stepPassToken,
                  })}`
                );
                return;
              }

              responder.status(500).end(`useSigninMethod:Result`);
            });

            return;
          }

          responder.status(404).end();
        }) == true
      ) {
        return;
      }

      if (
        routeRequestObj(
          "POST",
          "/signin/:method/withConfirmForeignCodeStep",
          (path, match) => {
            const targetMethod =
              this.#modules.signin != undefined
                ? this.#modules.signin.methods[match.method]
                : undefined;

            if (targetMethod == undefined) {
              responder.status(400).end();
              return;
            }

            bodyParser.json()(requestObj, responder, async () => {
              if (targetMethod instanceof Deadbolt.Signin.Id) {
                if (targetMethod.confirmForeignCode == undefined) {
                  responder.status(404).end("confirmForeignCodeStep:undefined");
                  return;
                }

                let result = null;
                try {
                  result = await targetMethod.confirmForeignCode(
                    {
                      codeWhere: requestObj.body.codeWhere,
                      codeWhereIdentifier: requestObj.body.codeWhereIdentifier,
                      stepPassToken: requestObj.body.stepPassToken,
                    },
                    requestObj.body.code
                  );
                } catch (e) {
                  if (e instanceof Deadbolt.ConfirmForeignCode.RejectedError) {
                    responder.status(400).end(
                      `REJECTED:${JSON.stringify({
                        variant: e.variant,
                        customMessage: e.customMessage,
                      })}`
                    );
                    return;
                  }

                  responder.status(500).end(`confirmForeignCode:Error`);
                  return;
                }

                if (result instanceof Deadbolt.Signin.Success) {
                  let signin = null;
                  try {
                    signin = await result.createSignin();
                  } catch (e) {
                    responder
                      .status(500)
                      .end(`Signin.Success.createSignin:Error`);
                    return;
                  }

                  responder.status(200).end(
                    JSON.stringify({
                      user: result.user,
                      signin,
                    })
                  );
                  return;
                }

                if (result instanceof Deadbolt.SolveAntiRobotChallenge) {
                  let stepPassToken = null;
                  try {
                    stepPassToken = await result.createStepPassToken();
                  } catch (e) {
                    responder
                      .status(500)
                      .end(`SolveAnitRobotChallenge.createStepPassToken:Error`);
                    return;
                  }

                  responder.status(428).end(
                    `SOLVE-ANTI-ROBOT-CHALLENGE:${JSON.stringify({
                      stepPassToken: stepPassToken,
                    })}`
                  );
                  return;
                }

                if (result instanceof Deadbolt.ConfirmForeignCode) {
                  //the provider should have sent or prepared the foreign code by now before they returned this result.
                  let stepPassToken = null;
                  try {
                    stepPassToken = await result.createStepPassToken();
                  } catch (e) {
                    responder
                      .status(500)
                      .end(`ConfirmForeignCode.createStepPassToken:Error`);
                    return;
                  }

                  responder
                    .status(428)
                    .end(
                      `CONFIRM-FOREIGN-CODE:${JSON.stringify([
                        result.codeWhere,
                        result.codeWhereIdentifier,
                        stepPassToken,
                      ])}`
                    );
                  return;
                }

                responder.status(500).end(`confirmForeignCode:Result`);

                return;
              }

              responder.status(404).end();
            });
          }
        ) == true
      ) {
        return;
      }

      if (
        routeRequestObj("POST", "/remoteResolve", (path, match) => {
          bodyParser.json()(requestObj, responder, async () => {
            try {
              this.#onRemoteResolve(
                requestObj.body.key,
                requestObj.body.result
              );
            } catch (e) {
              console.error(e);
              responder.status(500).end();
              return;
            }

            responder.status(200).end();
          });
        }) == true
      ) {
        return;
      }

      responder.status(404).end();
    };
  }
}

// Deadbolt.SolveAntiRobotChallenge = class {
//   constructor({ createStepPassToken }) {
//     this.createStepPassToken = createStepPassToken;
//   }
// };

// Deadbolt.SolveAntiRobotChallenge.RejectedError = class {};

Deadbolt.ConfirmForeignCode = class {
  /**
   * @param {Object} obj
   * @param {string} obj.codeWhere
   * @param {string} obj.codeWhereIdentifier
   * @param {() => Promise<string>} obj.createStepPassToken
   */
  constructor({ codeWhere, codeWhereIdentifier, createStepPassToken }) {
    this.codeWhere = codeWhere;
    this.codeWhereIdentifier = codeWhereIdentifier;
    this.createStepPassToken = createStepPassToken;
  }
};

Deadbolt.ConfirmForeignCode.RejectedError = class {
  /**
   * @param {Object} obj
   * @param {"invalid" | "expired"} [obj.variant]
   * @param {string} [obj.customMessage]
   */
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};

Deadbolt.CreatePassword = class {
  /**
   * @param {Object} obj
   * @param {() => Promise<string>} obj.createStepPassToken
   */
  constructor({ createStepPassToken }) {
    this.createStepPassToken = createStepPassToken;
  }
};

Deadbolt.CreatePassword.RejectedError = class {
  /**
   * @param {Object} obj
   * @param {"lengthShort" | "lengthLong" | "weak"} [obj.variant]
   * @param {string} [obj.customMessage]
   */
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};

Deadbolt.Signup = Signup;

Deadbolt.Signin = Signin;

module.exports = Deadbolt;
