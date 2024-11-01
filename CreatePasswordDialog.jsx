import { Box, Button, Dialog, TextField, Typography } from "@mui/material";
import { useRef } from "react";
import CreatePassword from "./CreatePassword";
import MuiDialogerProvider from "./MuiDialogerProvider";
import Loading from "./Loading";

export default function ConfirmForeignCodeDialog({ payload, close }) {
  const dialogerRef = useRef(undefined);

  const passwordInputRef = useRef(undefined);
  const passwordConfirmInputRef = useRef(undefined);

  async function doSubmitPassword() {
    let password = passwordInputRef.current.value;

    if (password.length == 0) {
      return;
    }

    let passwordConfirm = passwordConfirmInputRef.current.value;

    if (password != passwordConfirm) {
      await dialogerRef.current.alert("Password and confirmation mismatch");
      return;
    }

    let result = null;
    try {
      result = await Loading.useDialoger(
        dialogerRef.current,
        payload.createPassword.onSubmit(password)
      );
    } catch (e) {
      // console.log(e);

      if (e instanceof CreatePassword.PasswordUnallowedError) {
        await dialogerRef.current.alert("Password unallowed");
        return;
      }

      await dialogerRef.current.alert("Failed. An error occurred");
      return;
    }

    close(result);
  }

  return (
    <MuiDialogerProvider dialogerRef={dialogerRef}>
      <div
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          gap: "5px",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            padding: "10px",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              close();
            }}
          >
            back
          </Button>
          <div
            style={{
              width: 0,
              flexGrow: 1,
            }}
          />
        </div>
        <div
          style={{
            width: "100%",
          }}
        >
          <form
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
              padding: "10px",
            }}
          >
            <Typography
              style={{
                fontSize: "20px",
              }}
            >
              Create new password
            </Typography>
            <TextField
              fullWidth
              inputRef={passwordInputRef}
              type="password"
              required
              label="Password"
              autoComplete="new-password"
              onKeyDown={(ev) => {
                if (ev.key == "Enter") {
                  ev.preventDefault();

                  let input = ev.target.value;

                  if (input.length == 0) {
                    return;
                  }

                  doSubmitPassword();
                }
              }}
            />
            <TextField
              fullWidth
              inputRef={passwordConfirmInputRef}
              type="password"
              required
              label="Confirm Password"
              autoComplete="none"
              onKeyDown={(ev) => {
                if (ev.key == "Enter") {
                  ev.preventDefault();

                  let input = ev.target.value;

                  if (input.length == 0) {
                    return;
                  }

                  doSubmitPassword();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                doSubmitPassword();
              }}
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </MuiDialogerProvider>
  );
}
