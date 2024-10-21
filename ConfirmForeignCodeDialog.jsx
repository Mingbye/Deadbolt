import { Box, Button, Dialog, TextField, Typography } from "@mui/material";
import { useDialogs } from "@toolpad/core";
import { useRef } from "react";
import LoadingDialog from "./LoadingDialog";
import ConfirmForeignCode from "./ConfirmForeignCode";

export default function ConfirmForeignCodeDialog({ payload, open, onClose }) {
  const dialogs = useDialogs();

  const codeInputRef = useRef(undefined);

  async function doSubmitCode() {
    let code = codeInputRef.current.value;

    if (payload.confirmForeignCode.trimInput) {
      code = code.trim();
    }

    if (code.length == 0) {
      return;
    }

    let result = null;
    try {
      result = await LoadingDialog.useDialogs(
        dialogs,
        payload.confirmForeignCode.onSubmit(code)
      );
    } catch (e) {
      // console.log(e);

      if (e instanceof ConfirmForeignCode.InvalidCodeError) {
        await dialogs.alert("Incorect, match failed");
        return;
      }

      if (e instanceof ConfirmForeignCode.ExpiredCodeError) {
        await dialogs.alert("Too late, code expired");
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
            padding: "10px",
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
            {(function () {
              if (
                payload.confirmForeignCode.codePlacement instanceof
                ConfirmForeignCode.CodePlacement.SentInEmail
              ) {
                return (
                  <Typography>
                    Input code sent to:{" "}
                    {payload.confirmForeignCode.codePlacement.identifier}
                  </Typography>
                );
              }

              return <Typography>Input code</Typography>;
            })()}

            <TextField
              fullWidth
              inputRef={codeInputRef}
              required
              placeholder="code"
              autoComplete="none"
              onKeyDown={(ev) => {
                if (ev.key == "Enter") {
                  ev.preventDefault();

                  let input = ev.target.value;

                  if (payload.confirmForeignCode.trimInput) {
                    input = input.trim();
                  }

                  if (input.length == 0) {
                    return;
                  }

                  doSubmitCode();
                }
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                doSubmitCode();
              }}
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
