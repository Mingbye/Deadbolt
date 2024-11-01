import { Button, TextField } from "@mui/material";
import { useRef } from "react";

export default class SolveAntiRobotChallenge {
  /**
   * @param createChallenge => async function returning SolveAntiRobotChallenge.Challenge
   * @param onSubmitSolution => async function returning a solutionToken
   */
  constructor({ createChallenge }) {
    this.createChallenge = createChallenge;
  }
}

SolveAntiRobotChallenge.RejectedError = class {
  constructor({ variant, customMessage }) {
    this.variant = variant;
    this.customMessage = customMessage;
  }
};

SolveAntiRobotChallenge.Challenge = class {
  constructor({ ref, solvable }) {
    this.ref = ref;
    this.solvable = solvable;
  }
};

SolveAntiRobotChallenge.Challenge.Solvable = class {
  constructor({ buildComponent }) {
    this.buildComponent = buildComponent;
  }
};

SolveAntiRobotChallenge.Challenge.Solvable.TextFromImg = class extends (
  SolveAntiRobotChallenge.Challenge.Solvable
) {
  constructor({ src, trimInput, onSubmit }) {
    super({
      buildComponent: (finish, { useLoading, useAlert }) => {
        function Component() {
          const solutionInputRef = useRef(undefined);

          async function doSubmitSolution() {
            let solution = solutionInputRef.current.value;

            if (trimInput) {
              solution = solution.trim();
            }

            if (solution.length == 0) {
              return;
            }

            let result = null;
            try {
              result = await useLoading(onSubmit(solution));
            } catch (e) {
              if (e instanceof SolveAntiRobotChallenge.SolutionIncorrectError) {
                await useAlert("Failed, Incorrect solution");
                return;
              }

              if (e instanceof SolveAntiRobotChallenge.ChallengeExpiredError) {
                await useAlert("Failed, Challenge expired");
                return;
              }

              await useAlert("FAILED");
              return;
            }

            finish(result);
          }

          return (
            <form
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <img
                src={src}
                style={{
                  width: "100%",
                  maxHeight: "150px",
                  objectFit: "contain",
                }}
              />

              <TextField
                fullWidth
                inputRef={solutionInputRef}
                required
                placeholder="input solution"
                autoComplete="off"
                onKeyDown={(ev) => {
                  if (ev.key == "Enter") {
                    ev.preventDefault();

                    let input = ev.target.value;

                    if (trimInput) {
                      input = input.trim();
                    }

                    if (input.length == 0) {
                      return;
                    }

                    doSubmitSolution();
                  }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                onClick={(ev) => {
                  ev.preventDefault();
                  doSubmitSolution();
                }}
              >
                Continue
              </Button>
            </form>
          );
        }

        return <Component />;
      },
    });
  }
};

SolveAntiRobotChallenge.Challenge.Solvable.TextFromAudio = class extends (
  SolveAntiRobotChallenge.Challenge.Solvable
) {
  constructor({ src }) {
    super({
      buildComponent: (finish, { useLoading }) => {
        return null;
      },
    });
  }
};

SolveAntiRobotChallenge.Challenge.Solvable.TextFromVideo = class extends (
  SolveAntiRobotChallenge.Challenge.Solvable
) {
  constructor({ src }) {
    super({
      buildComponent: (finish, { useLoading }) => {
        return null;
      },
    });
  }
};
