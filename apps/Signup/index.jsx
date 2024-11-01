import { Button, TextField, Typography } from "@mui/material";
import { useRef } from "react";
import ConfirmForeignCode from "../../ConfirmForeignCode";
import SolveAntiRobotChallenge from "../../SolveAntiRobotChallenge";
import SolveAntiRobotChallengeDialog from "../../SolveAntiRobotChallengeDialog";
import ConfirmForeignCodeDialog from "../../ConfirmForeignCodeDialog";
import CreatePassword from "../../CreatePassword";
import CreatePasswordDialog from "../../CreatePasswordDialog";
import Loading from "../../Loading";
import MuiDialogerProvider from "../../MuiDialogerProvider";

/**
 * signupMethod {SignupMethod or Array of SignupMethods}
 * provideOptSignin {function}
 * onResult {function}
 */

export default function Signup({ signupMethod, provideOptSignin, onResult }) {
  const dialogerRef = useRef(undefined);

  const idInputRef = useRef(undefined);

  async function doSubmitId() {
    let id = idInputRef.current.value;

    if (signupMethod.trimInput) {
      id = id.trim();
    }

    if (id.length == 0) {
      return;
    }

    let result = null;
    try {
      result = await Loading.useDialoger(
        dialogerRef.current,
        signupMethod.onSubmitId(id)
      );
    } catch (e) {
      await dialogerRef.current.alert("FAILED");
      return;
    }

    async function handleStepResult(stepResult) {
      if (stepResult instanceof Signup.Success) {
        onResult(
          {
            user: stepResult.user,
            autoSigninToken: stepResult.autoSigninToken,
          },
          signupMethod
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
            if (signupMethod instanceof Array) {
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
                      Sign-up
                    </Typography>
                    <Typography
                      style={{
                        color: "grey",
                      }}
                    >
                      Choose how you want to sign-up
                    </Typography>
                    {(function () {
                      if (signupMethod.length == 0) {
                        return (
                          <Typography color="rgba(150,0,0,1)" align="center">
                            No sign-up methods available
                          </Typography>
                        );
                      }

                      return signupMethod.map((item, i) => {
                        if (item instanceof Signup.Id) {
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
                  {provideOptSignin != null ? (
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
                      <Typography>Already have an account?</Typography>
                      <Button
                        onClick={() => {
                          provideOptSignin();
                        }}
                      >
                        go to sign-in
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            }

            if (signupMethod instanceof Signup.Id) {
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
                    Sign-up
                  </Typography>

                  {(function () {
                    //subtitle
                    if (signupMethod.variant == "emailAddress") {
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
                      signupMethod.variant == "emailAddress"
                        ? "Email Address"
                        : "Id"
                    }
                    autoComplete={
                      signupMethod.variant == "emailAddress"
                        ? "email"
                        : "username"
                    }
                    onKeyDown={(ev) => {
                      if (ev.key == "Enter") {
                        let input = ev.target.value;

                        if (signupMethod.trimInput) {
                          input = input.trim();
                        }

                        if (input.length == 0) {
                          return;
                        }

                        doSubmitId();
                      }
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    onClick={(ev) => {
                      ev.preventDefault();
                      doSubmitId();
                    }}
                  >
                    sign-up
                  </Button>

                  {provideOptSignin != null ? (
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
                      <Typography>Already have an account?</Typography>
                      <Button
                        onClick={() => {
                          provideOptSignin();
                        }}
                      >
                        go to sign-in
                      </Button>
                    </div>
                  ) : null}
                </form>
              );
            }

            // if (signupMethod instanceof Signup.GoogleAccounts) {
            //   return <Button>Continue with google</Button>;
            // }

            return null;
          })()}
        </div>
      </div>
    </MuiDialogerProvider>
  );
}

Signup.Id = class {
  constructor({ variant, trimInput, autoSignin, onSubmitId }) {
    this.variant = variant;
    this.trimInput = trimInput;
    this.autoSignin = autoSignin;
    this.onSubmitId = onSubmitId;
  }
};

Signup.GoogleAccounts = class {
  constructor() {}
};

Signup.Id.SolveAntiRobotChallenge = class {
  constructor({ onSolutionToken }) {
    this.onSolutionToken = onSolutionToken;
  }
};

Signup.Id.RejectedError = class {
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};

Signup.Success = class {
  constructor({ user, autoSigninToken }) {
    this.user = user;
    this.autoSigninToken = autoSigninToken;
  }
};
