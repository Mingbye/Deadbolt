import { Box, Button, Dialog, TextField, Typography } from "@mui/material";
import { useDialogs } from "@toolpad/core";
import { useRef } from "react";
import LoadingDialog from "./LoadingDialog";
import ConfirmForeignCode from "./ConfirmForeignCode";
import CreatePassword from "./CreatePassword";

export default function ConfirmForeignCodeDialog({ payload, open, onClose }) {
  const dialogs = useDialogs();

  const passwordInputRef = useRef(undefined);
  const passwordConfirmInputRef = useRef(undefined);

  async function doSubmitPassword() {
    let password = passwordInputRef.current.value;

    if (password.length == 0) {
      return;
    }

    let passwordConfirm = passwordConfirmInputRef.current.value;

    if (password != passwordConfirm) {
      await dialogs.alert("Password and confirmation mismatch");
      return;
    }

    let result = null;
    try {
      result = await LoadingDialog.useDialogs(
        dialogs,
        payload.createPassword.onSubmit(password)
      );
    } catch (e) {
      // console.log(e);

      if (e instanceof CreatePassword.PasswordUnallowedError) {
        await dialogs.alert("Password unallowed");
        return;
      }

      await dialogs.alert("Failed. An error occurred");
      return;
    }

    onClose(result);
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={() => {}}
      sx={{
        boxSizing: "border-box",
      }}
    >
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
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              onClose();
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
          <Typography></Typography>
        </div>
        <div
          style={{
            width: "100%",
          }}
        >
          <Box
            component="form"
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
              padding: "10px",
            }}
          >
            <TextField
              inputRef={passwordInputRef}
              required
              label="Password"
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
            <TextField
              inputRef={passwordConfirmInputRef}
              required
              label="Confirm password"
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
          </Box>
        </div>
      </div>
    </Dialog>
  );
}
