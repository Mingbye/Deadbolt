import { Box, Button, Dialog, TextField, Typography } from "@mui/material";
import { useDialogs } from "@toolpad/core";
import { useRef } from "react";
import Loading from "./Loading";
import ConfirmForeignCode from "./ConfirmForeignCode";
import MuiDialogerProvider from "./MuiDialogerProvider";

export default function ConfirmForeignCodeDialog({ payload, close }) {
  const dialogerRef = useRef(undefined);

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
      result = await Loading.useDialoger(
        dialogerRef.current,
        payload.confirmForeignCode.onSubmit(code)
      );
    } catch (e) {
      // console.log(e);

      if (e instanceof ConfirmForeignCode.InvalidCodeError) {
        await dialogerRef.current.alert("Incorect, match failed");
        return;
      }

      if (e instanceof ConfirmForeignCode.ExpiredCodeError) {
        await dialogerRef.current.alert("Too late, code expired");
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
            {(function () {
              if (payload.confirmForeignCode.codeWhere == "sentInEmail") {
                return (
                  <Typography>
                    Input code sent to:{" "}
                    {payload.confirmForeignCode.codeWhereIdentifier}
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
    </MuiDialogerProvider>
  );
}
