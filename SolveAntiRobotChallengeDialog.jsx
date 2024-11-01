import {
  Button,
  CircularProgress,
  Dialog,
  Typography,
} from "@mui/material";
import { useDialogs } from "@toolpad/core";
import { useState, useEffect } from "react";
import PromiseBuilder from "./PromiseBuilder";
import Loading from "./Loading";

export default function SolveAntiRobotChallengeDialog({
  payload,
  open,
  onClose,
}) {
  const dialogs = useDialogs();

  const [creatingChallenge, setCreatingChallenge] = useState(null);

  useEffect(() => {
    doSetupNewChallenge();
  }, []);

  async function doSetupNewChallenge() {
    setCreatingChallenge(payload.solveAntiRobotChallenge.createChallenge());
  }

  return (
    <Dialog fullWidth open={open}>
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
            padding: "20px 10px",
          }}
        >
          {creatingChallenge != null ? (
            <PromiseBuilder
              promise={creatingChallenge}
              builder={(snapshot) => {
                if (snapshot == null) {
                  return (
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        alignItems: "center",
                      }}
                    >
                      <CircularProgress />
                      <Typography>Creating anti robot challenge</Typography>
                    </div>
                  );
                }
                const [ok, data] = snapshot;
                if (!ok) {
                  return (
                    <>
                      <Typography>
                        CREATING ANTI ROBOT CHALLENGE - FAILED
                      </Typography>
                      <Button
                        onClick={() => {
                          console.error(data);
                        }}
                      >
                        ERROR
                      </Button>
                      <Button
                        onClick={() => {
                          doSetupNewChallenge();
                        }}
                      >
                        retry
                      </Button>
                    </>
                  );
                }

                return data.solvable.buildComponent(
                  (result) => {
                    onClose(result);
                  },
                  {
                    useLoading: async (
                      promise,
                      { message, cancellable } = {}
                    ) => {
                      return await Loading.useDialogs(dialogs, promise, {
                        message,
                        cancellable,
                      });
                    },

                    useAlert: async (message) => {
                      return await dialogs.alert(message);
                    },
                  }
                );
              }}
            />
          ) : null}
        </div>
      </div>
    </Dialog>
  );
}
