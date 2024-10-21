import { Button, TextField, Typography } from "@mui/material";
import { DialogsProvider, useDialogs } from "@toolpad/core/useDialogs";
import { useRef } from "react";
import ConfirmForeignCode from "../../ConfirmForeignCode";
import SolveAntiRobotChallenge from "../../SolveAntiRobotChallenge";
import SolveAntiRobotChallengeDialog from "../../SolveAntiRobotChallengeDialog";
import ConfirmForeignCodeDialog from "../../ConfirmForeignCodeDialog";
import LoadingDialog from "../../LoadingDialog";
import CreatePassword from "../../CreatePassword";
import CreatePasswordDialog from "../../CreatePasswordDialog";

/**
 * props (Object) should include
 * onResult {function}
 * signupMethod {SignupMethod or Array of SignupMethods}
 */
export default function Signup(props) {
  return (
    <DialogsProvider>
      <$Signup appProps={props}></$Signup>
    </DialogsProvider>
  );
}

function $Signup({ appProps }) {
  const dialogs = useDialogs();

  const idInputRef = useRef(undefined);

  async function doSubmitId() {
    let id = idInputRef.current.value;

    if (appProps.signupMethod.type.trimInput) {
      id = id.trim();
    }

    if (id.length == 0) {
      return;
    }

    let result = null;
    try {
      result = await LoadingDialog.useDialogs(
        dialogs,
        appProps.signupMethod.onSubmitId(id)
      );
    } catch (e) {
      await dialogs.alert("FAILED");
      return;
    }

    async function handleStepResult(stepResult) {
      if (stepResult instanceof Signup.Success) {
        appProps.onResult({
          user: stepResult.user,
          autoSigninToken: stepResult.autoSigninToken,
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

      if (stepResult instanceof CreatePassword) {
        const result = await dialogs.open(CreatePasswordDialog, {
          createPassword: stepResult,
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
    <>
      {(function () {
        if (appProps.signupMethod instanceof Array) {
          return (
            <>
              <Typography>Create an account</Typography>
              <Typography>Continue with:-</Typography>
              ---
            </>
          );
        }

        if (appProps.signupMethod instanceof Signup.Id) {
          let subtitle = null;
          let input = null;

          if (
            appProps.signupMethod.type instanceof Signup.Id.Type.EmailAddress
          ) {
            subtitle = "Signup with your email address";
            input = (
              <TextField
                inputRef={idInputRef}
                autoComplete="none"
                onKeyDown={(ev) => {
                  if (ev.key == "Enter") {
                    let input = ev.target.value;

                    if (appProps.signupMethod.type.trimInput) {
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
            appProps.signupMethod.type instanceof Signup.Id.Type.Phonenumber
          ) {
            subtitle = "Signup with your phonenumber";
            input = (
              <TextField
                inputRef={idInputRef}
                autoComplete="none"
                onKeyDown={(ev) => {
                  if (ev.key == "Enter") {
                    let input = ev.target.value;

                    if (appProps.signupMethod.type.trimInput) {
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
            <>
              <Typography>Create an account</Typography>
              {subtitle != null ? subtitle : null}
              {input != null ? input : null}
              <Button
                onClick={() => {
                  doSubmitId();
                }}
              >
                Continue
              </Button>

              {appProps.provideOptSignin != null ? (
                <>
                  <Button
                    onClick={() => {
                      appProps.provideOptSignin();
                    }}
                  >
                    sign-in
                  </Button>
                </>
              ) : null}
            </>
          );
        }

        if (appProps.signupMethod instanceof Signup.GoogleAccounts) {
          return <Button>Continue with google</Button>;
        }

        return null;
      })()}
    </>
  );
}

Signup.Id = class {
  constructor({ type, onSubmitId }) {
    this.type = type;
    this.onSubmitId = onSubmitId;
  }
};

Signup.GoogleAccounts = class {
  constructor() {}
};

Signup.Id.Type = class {
  constructor(label, helperText, trimInput) {
    this.label = label;
    this.helperText = helperText;
    this.trimInput = trimInput;
  }
};

Signup.Id.Type.EmailAddress = class extends Signup.Id.Type {
  constructor() {
    super(null, null, true);
  }
};

Signup.Id.Type.Phonenumber = class extends Signup.Id.Type {
  constructor() {
    super(null, null, true);
  }
};

Signup.Id.SolveAntiRobotChallenge = class {
  constructor({ onSolutionToken }) {
    this.onSolutionToken = onSolutionToken;
  }
};

Signup.Id.IdMalformedError = class {};

Signup.Id.IdUnavailableError = class {};

Signup.Id.CreatePassword = class {
  constructor({ id, nextStepToken, onPassword }) {
    this.id = id;
    this.nextStepToken = nextStepToken;
    this.onPassword = onPassword;
  }
};

Signup.Id.PasswordTooShortError = class {};

Signup.Success = class {
  constructor({ user, autoSigninToken }) {
    this.user = user;
    this.autoSigninToken = autoSigninToken;
  }
};
