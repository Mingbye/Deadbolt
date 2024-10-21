import { Box, Button, Card, TextField, Typography } from "@mui/material";
import { DialogsProvider, useDialogs } from "@toolpad/core/useDialogs";
import { useRef, useEffect } from "react";
import SolveAntiRobotChallenge from "../../SolveAntiRobotChallenge";
import SolveAntiRobotChallengeDialog from "../../client/SolveAntiRobotChallengeDialog";
import ConfirmForeignCode from "../../ConfirmForeignCode";
import ConfirmForeignCodeDialog from "../../ConfirmForeignCodeDialog";
import LoadingDialog from "../../LoadingDialog";

/**
 * props (Object) should include
 * onResult {function}
 * signinMethod {signinMethod or Array of signinMethods}
 */
export default function Signin(props) {
  return (
    <DialogsProvider>
      <$Signin appProps={props}></$Signin>
    </DialogsProvider>
  );
}

function $Signin({ appProps }) {
  const dialogs = useDialogs();

  const idInputRef = useRef(undefined);
  const idUsePasswordInputRef = useRef(undefined);

  async function doSubmitId() {
    let id = idInputRef.current.value;

    if (appProps.signinMethod.type.trimInput) {
      id = id.trim();
    }

    if (id.length == 0) {
      return;
    }

    let password = null;
    if (appProps.signinMethod.usePassword) {
      password = idUsePasswordInputRef.current.value;

      if (password.length == 0) {
        return;
      }
    }

    let result = null;
    try {
      result = await LoadingDialog.useDialogs(
        dialogs,
        appProps.signinMethod.onSubmitId(id, password)
      );
    } catch (e) {
      await dialogs.alert("FAILED");
      return;
    }

    async function handleStepResult(stepResult) {
      if (stepResult instanceof Signin.Success) {
        appProps.onResult({
          user: stepResult.user,
          signin: stepResult.signin,
        });

        return;
      }

      if (stepResult instanceof SolveAntiRobotChallenge) {
        const result = await dialogs.open(SolveAntiRobotChallengeDialog, {
          solveAntiRobotChallenge: stepResult,
        });

        if (result == null) {
          return;
        }

        handleStepResult(result);
        return;
      }

      if (stepResult instanceof ConfirmForeignCode) {
        const result = await dialogs.open(ConfirmForeignCodeDialog, {
          confirmForeignCode: stepResult,
        });

        if (result == null) {
          return;
        }

        handleStepResult(result);
        return;
      }

      await dialogs.alert("AN UNEXPECTED ERROR OCCURRED");
    }

    handleStepResult(result);
  }

  return (
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
          if (appProps.signinMethod instanceof Array) {
            return (
              <>
                <Typography>Sign-in to your account</Typography>
                <Typography>Continue with:-</Typography>
                ---
              </>
            );
          }

          if (appProps.signinMethod instanceof Signin.Id) {
            let subtitle = null;
            let input = null;

            if (
              appProps.signinMethod.type instanceof Signin.Id.Type.EmailAddress
            ) {
              subtitle = "Signin with your email address";
              input = (
                <TextField
                  fullWidth
                  inputRef={idInputRef}
                  label="Email"
                  autoComplete="email"
                  onKeyDown={(ev) => {
                    if (ev.key == "Enter") {
                      let input = ev.target.value;

                      if (appProps.signinMethod.type.trimInput) {
                        input = input.trim();
                      }

                      if (input.length == 0) {
                        return;
                      }

                      doSubmitId();
                    }
                  }}
                />
              );
            }

            if (
              appProps.signinMethod.type instanceof Signin.Id.Type.Phonenumber
            ) {
              subtitle = "Signin with your phonenumber";
              input = (
                <TextField
                  fullWidth
                  inputRef={idInputRef}
                  label="Phonenumber"
                  autoComplete="tel"
                  onKeyDown={(ev) => {
                    if (ev.key == "Enter") {
                      let input = ev.target.value;

                      if (appProps.signinMethod.type.trimInput) {
                        input = input.trim();
                      }

                      if (input.length == 0) {
                        return;
                      }

                      doSubmitId();
                    }
                  }}
                />
              );
            }

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
                  }}
                >
                  Create an account
                </Typography>
                {subtitle != null ? (
                  <Typography
                    style={{
                      color: "grey",
                    }}
                  >
                    {subtitle}
                  </Typography>
                ) : null}

                {input != null ? input : null}
                {appProps.signinMethod.usePassword ? (
                  <>
                    <TextField
                      fullWidth
                      inputRef={idUsePasswordInputRef}
                      type="password"
                      label="Password"
                      autoComplete="current-password"
                      onKeyDown={(ev) => {
                        if (ev.key == "Enter") {
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
                  type="submit"
                  fullWidth
                  variant="contained"
                  onClick={(ev) => {
                    ev.preventDefault();
                    doSubmitId();
                  }}
                >
                  sign-in
                </Button>

                {appProps.provideOptSignup != null ? (
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
                        appProps.provideOptSignup();
                      }}
                    >
                      go to sign-up
                    </Button>
                  </div>
                ) : null}
              </form>
            );
          }

          if (appProps.signinMethod instanceof Signin.GoogleAccounts) {
            return <Button>Continue with google</Button>;
          }

          return null;
        })()}
      </div>
    </div>
  );
}

Signin.Id = class {
  constructor({ type, usePassword, onSubmitId }) {
    this.type = type;
    this.usePassword = usePassword;
    this.onSubmitId = onSubmitId;
  }
};

Signin.GoogleAccounts = class {
  constructor() {}
};

Signin.Id.Type = class {
  constructor(label, helperText, trimInput) {
    this.label = label;
    this.helperText = helperText;
    this.trimInput = trimInput;
  }
};

Signin.Id.Type.EmailAddress = class extends Signin.Id.Type {
  constructor() {
    super(null, null, true);
  }
};

Signin.Id.Type.Phonenumber = class extends Signin.Id.Type {
  constructor() {
    super(null, null, true);
  }
};

Signin.Id.SolveAntiRobotChallenge = class {
  constructor({ onSolutionToken }) {
    this.onSolutionToken = onSolutionToken;
  }
};

Signin.Id.InvalidCredentialsError = class {};

Signin.Success = class {
  constructor({ user, signin }) {
    this.user = user;
    this.signin = signin;
  }
};
