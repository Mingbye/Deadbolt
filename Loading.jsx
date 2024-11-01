import { Button, CircularProgress, Dialog, Typography } from "@mui/material";
import { useEffect } from "react";

export default function Loading({ close, payload }) {
  useEffect(() => { 
    (async function () {
      let result = null;
      try {
        result = await payload.promise;
      } catch (e) {
        close([false, e]);
        return;
      }
      close([true, result]);
    })();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
        gap: "12px",
      }}
    >
      <CircularProgress
        style={{
          marginTop: "5px",
        }}
      />
      {payload.message != undefined ? (
        <Typography
          style={{
            fontSize: "15px",
            // fontWeight: "bold",
            maxWidth: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {payload.message}
        </Typography>
      ) : null}
      {payload.cancellable ? (
        <Button
          variant="outlined"
          onClick={() => {
            close([false, new Loading.Cancelled()]);
          }}
        >
          cancel
        </Button>
      ) : null}
    </div>
  );
}

Loading.Cancelled = class {};

Loading.useDialoger = async (
  dialoger,
  promise,
  { message, cancellable } = {}
) => {
  const [ok, data] = await dialoger.open(Loading, {
    promise,
    message,
    cancellable,
  });

  if (!ok) {
    throw data;
  }

  return data;
};
