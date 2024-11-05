import { Box, Button, Chip, TextField, Typography } from "@mui/material";
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
      if (e instanceof ConfirmForeignCode.RejectedError) {
        if (e.variant == `invalid`) {
          await dialogerRef.current.alert(
            `Invalid code. ${e.customMessage || ``}`.trim()
          );
          return;
        }

        if (e.variant == `expired`) {
          await dialogerRef.current.alert(
            `Code expired. ${e.customMessage || ``}`.trim()
          );
          //confirm to send a new one
          return;
        }

        await dialogerRef.current.alert(
          `Code rejected. ${e.customMessage || ``}`.trim()
        );
        return;
      }

      await dialogerRef.current.alert("Failed. An unexpected error was thrown");
      console.error(e);
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
            close
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
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      // gap: "15px",
                      // padding: "10px",
                    }}
                  >
                    <Typography>verify code sent in email</Typography>
                    {payload.confirmForeignCode.codeWhereIdentifier !=
                    undefined ? (
                      <>
                        <Typography
                          style={
                            {
                              // fontWeight: "bold",
                              color:"grey",
                            }
                          }
                        >
                          {payload.confirmForeignCode.codeWhereIdentifier}
                        </Typography>
                        {/* <Chip
                          label={payload.confirmForeignCode.codeWhereIdentifier}
                        /> */}
                      </>
                    ) : null}
                  </div>
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
