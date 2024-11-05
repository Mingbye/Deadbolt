import { Button, TextField, Typography } from "@mui/material";
import MuiDialogerProvider from "../../MuiDialogerProvider";
import { useRef } from "react";
import SolveAntiRobotChallenge from "../../SolveAntiRobotChallenge";
import SolveAntiRobotChallengeDialog from "../../SolveAntiRobotChallengeDialog";
import ConfirmForeignCode from "../../ConfirmForeignCode";
import ConfirmForeignCodeDialog from "../../ConfirmForeignCodeDialog";
import Loading from "../../Loading";
import CreatePassword from "../../CreatePassword";
import CreatePasswordDialog from "../../CreatePasswordDialog";

/**
 * onResult {function}
 * signinMethod {signinMethod or Array of signinMethods}
 */
export default function Signin({ signinMethod, onResult, provideOptSignup }) {
  const dialogerRef = useRef(undefined);

  const idInputRef = useRef(undefined);
  const idUsePasswordInputRef = useRef(undefined);

  async function doSubmitId() {
    let id = idInputRef.current.value;

    if (signinMethod.trimInput) {
      id = id.trim();
    }

    if (id.length == 0) {
      return;
    }

    let password = null;
    if (signinMethod.usePassword) {
      password = idUsePasswordInputRef.current.value;

      if (password.length == 0) {
        return;
      }
    }

    async function handleStepResult(stepResult) {
      if (stepResult instanceof Signin.Success) {
        onResult(
          {
            user: stepResult.user,
            signin: stepResult.signin,
          },
          signinMethod
        );

        return;
      }

      if (stepResult instanceof SolveAntiRobotChallenge) {
        const result = await dialogerRef.current.open(
          SolveAntiRobotChallengeDialog,
          {
            solveAntiRobotChallenge: stepResult,
          },
          {
            fullWidth: true,
            sx: {
              "& .MuiDialog-container": {
                "& .MuiPaper-root": {
                  // width: "100%",
                  maxWidth: "450px",
                },
              },
            },
          }
        );

        if (result == null) {
          return;
        }

        handleStepResult(result);
        return;
      }

      if (stepResult instanceof ConfirmForeignCode) {
        const result = await dialogerRef.current.open(
          ConfirmForeignCodeDialog,
          {
            confirmForeignCode: stepResult,
          },
          {
            fullWidth: true,
            sx: {
              "& .MuiDialog-container": {
                "& .MuiPaper-root": {
                  // width: "100%",
                  maxWidth: "450px",
                },
              },
            },
          }
        );

        if (result == null) {
          return;
        }

        handleStepResult(result);
        return;
      }

      if (stepResult instanceof CreatePassword) {
        const result = await dialogerRef.current.open(
          CreatePasswordDialog,
          {
            createPassword: stepResult,
          },
          {
            fullWidth: true,
            sx: {
              "& .MuiDialog-container": {
                "& .MuiPaper-root": {
                  // width: "100%",
                  maxWidth: "450px",
                },
              },
            },
          }
        );

        if (result == null) {
          return;
        }

        handleStepResult(result);
        return;
      }

      await dialogerRef.current.alert("AN UNEXPECTED ERROR OCCURRED");
    }

    let result = null;
    try {
      result = await Loading.useDialoger(
        dialogerRef.current,
        signinMethod.onSubmitId(id, password)
      );
    } catch (e) {
      if (e instanceof Signin.Id.RejectedError) {
        if (e.variant == `noMatch`) {
          await dialogerRef.current.alert(
            `Sign-in failed. Ensure valid sign-in details. ${e.customMessage || ``}`.trim()
          );
          return;
        }

        await dialogerRef.current.alert(
          `Sign-in rejected. ${e.customMessage || ``}`.trim()
        );
        return;
      }

      await dialogerRef.current.alert("Failed. An unexpected error was thrown");
      console.error(e);
      return;
    }

    handleStepResult(result);
  }

  return (
    <MuiDialogerProvider dialogerRef={dialogerRef}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(240,240,240,.5)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "100%",
            maxHeight: "580px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto",
            background: "white",
            boxShadow:
              "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
          }}
        >
          {(function () {
            if (signinMethod instanceof Array) {
              return (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    padding: "10px 20px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 0,
                      flexGrow: 1,
                      overflow: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px 20px",
                    }}
                  >
                    <Typography
                      style={{
                        // fontWeight: "bold",
                        fontSize: "25px",
                        lineHeight: 1,
                      }}
                    >
                      Sign-in
                    </Typography>
                    <Typography
                      style={{
                        color: "grey",
                      }}
                    >
                      Choose how you want to sign-in
                    </Typography>
                    {(function () {
                      if (signinMethod.length == 0) {
                        return (
                          <Typography color="rgba(150,0,0,1)" align="center">
                            No sign-in methods available
                          </Typography>
                        );
                      }

                      return signinMethod.map((item, i) => {
                        if (item instanceof Signin.Id) {
                          if (item.variant == "emailAddress") {
                            return (
                              <Button
                                key={i}
                                fullWidth
                                variant="contained"
                                onClick={() => {}}
                              >
                                continue with email address
                              </Button>
                            );
                          }

                          return (
                            <Button
                              key={i}
                              fullWidth
                              variant="contained"
                              onClick={() => {}}
                            >
                              continue with id
                            </Button>
                          );
                        }

                        return null;
                      });
                    })()}
                  </div>
                  {provideOptSignup != null ? (
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                        alignItems: "center",
                        margin: "15px 0",
                      }}
                    >
                      <Typography>
                        Don't have or wanna create a new account?
                      </Typography>
                      <Button
                        onClick={() => {
                          provideOptSignup();
                        }}
                      >
                        go to sign-up
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            }

            if (signinMethod instanceof Signin.Id) {
              return (
                <form
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    alignItems: "center",
                    padding: "10px 20px",
                  }}
                >
                  <Typography
                    style={{
                      // fontWeight: "bold",
                      fontSize: "25px",
                      lineHeight: 1,
                    }}
                  >
                    Sign-in
                  </Typography>

                  {(function () {
                    //subtitle
                    if (signinMethod.variant == "emailAddress") {
                      return (
                        <Typography
                          style={{
                            color: "grey",
                          }}
                        >
                          Continue with your email address
                        </Typography>
                      );
                    }

                    return null;
                  })()}

                  <TextField
                    fullWidth
                    inputRef={idInputRef}
                    label={
                      signinMethod.variant == "emailAddress"
                        ? "Email Address"
                        : "Id"
                    }
                    autoComplete={
                      signinMethod.variant == "emailAddress"
                        ? "email"
                        : "username"
                    }
                    onKeyDown={(ev) => {
                      if (ev.key == "Enter") {
                        ev.preventDefault();
                        let input = ev.target.value;

                        if (signinMethod.trimInput) {
                          input = input.trim();
                        }

                        if (input.length == 0) {
                          return;
                        }

                        doSubmitId();
                      }
                    }}
                  />

                  {signinMethod.usePassword ? (
                    <>
                      <TextField
                        fullWidth
                        inputRef={idUsePasswordInputRef}
                        type="password"
                        label="Password"
                        autoComplete="current-password"
                        onKeyDown={(ev) => {
                          if (ev.key == "Enter") {
                            ev.preventDefault();
                            let input = ev.target.value;

                            if (input.length == 0) {
                              return;
                            }

                            doSubmitId();
                          }
                        }}
                      />
                    </>
                  ) : null}

                  <Button
                    // type="submit"
                    fullWidth
                    variant="contained"
                    onClick={(ev) => {
                      // ev.preventDefault();
                      doSubmitId();
                    }}
                  >
                    sign-in
                  </Button>

                  {provideOptSignup != null ? (
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                        alignItems: "center",
                        margin: "15px 0",
                      }}
                    >
                      <Typography>
                        Don't have or wanna create a new account?
                      </Typography>
                      <Button
                        onClick={() => {
                          provideOptSignup();
                        }}
                      >
                        go to sign-up
                      </Button>
                    </div>
                  ) : null}
                </form>
              );
            }

            if (signinMethod instanceof Signin.GoogleAccounts) {
              return <Button>Continue with google</Button>;
            }

            return null;
          })()}
        </div>
      </div>
    </MuiDialogerProvider>
  );
}

Signin.Id = class {
  constructor({ variant, trimInput, usePassword, onSubmitId }) {
    this.variant = variant;
    this.trimInput = trimInput;
    this.usePassword = usePassword;
    this.onSubmitId = onSubmitId;
  }
};

Signin.GoogleAccounts = class {
  constructor() {}
};

Signin.Id.SolveAntiRobotChallenge = class {
  constructor({ onSolutionToken }) {
    this.onSolutionToken = onSolutionToken;
  }
};

Signin.Id.RejectedError = class {
  /**
   * @param {Object} param;
   * @param {"noMatch"} [param.variant]
   * @param {String} [param.customMessage]
   */
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};

Signin.Success = class {
  constructor({ user, signin }) {
    this.user = user;
    this.signin = signin;
  }
};
