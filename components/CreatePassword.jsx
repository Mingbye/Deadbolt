import { useRef } from "react";
import { useDialoger } from "@mingbye/react-build-util";
import { Button, Flex, Input, Typography } from "antd";
import { TextField } from "@mui/material";
import { VariantError } from "../index";

export default function CreatePassword({
  labelSecondary,
  labelTertiary,
  required,
  withInputField,
  next,
  finishClose,
  finishResult,
}) {
  const dialoger = useDialoger();

  const inputRef = useRef(undefined);
  const inputConfirmationRef = useRef(undefined);

  const withInputFieldTextInputRef = useRef(undefined);
  const withInputFieldPasswordInputRef = useRef(undefined);

  async function doSubmit() {
    const password = inputRef.current.value;

    if (required && password.length == 0) {
      return;
    }

    const passwordConfirmation = inputConfirmationRef.current.value;

    if (password != passwordConfirmation) {
      dialoger.alert(`Password does not match confirmation`);
      return;
    }

    let withInputFieldValue = null;

    if (withInputField?.variant == "text") {
      withInputFieldValue = withInputFieldTextInputRef.current.input.value;

      if (withInputField?.variantData?.trimInput) {
        withInputFieldValue = withInputFieldValue.trim();
      }

      if (withInputField?.required) {
        if (withInputFieldValue.length == 0) {
          return;
        }
      }
    }

    if (withInputField?.variant == "password") {
      withInputFieldValue = withInputFieldPasswordInputRef.current.input.value;

      if (withInputField?.variantData?.required) {
        if (withInputFieldValue.length == 0) {
          return;
        }
      }
    }

    let result = null;
    try {
      result = await dialoger.load(next(password, withInputFieldValue));
    } catch (e) {
      console.error(e);

      if (e instanceof VariantError) {
        if (e.variant == `noMatch`) {
          if (variant == `password`) {
            await dialoger.alert(
              `Incorrect password. ${e.customMessage || ``}`.trim()
            );
            return;
          }

          if (variant == `code`) {
            await dialoger.alert(
              `Incorrect code. ${e.customMessage || ``}`.trim()
            );
            return;
          }

          await dialoger.alert(`No match. ${e.customMessage || ``}`.trim());
          return;
        }

        await dialoger.alert(`${e.customMessage || ``}`.trim());
        return;
      }

      await dialoger.alert("Failed. An unexpected error was thrown");
      return;
    }

    finishResult(result);
  }

  return dialoger(
    <Flex
      align="center"
      justify="center"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Flex
        vertical
        justify="center"
        gap="30px"
        style={{
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <Flex
          vertical
          justify="center"
          gap="15px"
          style={{
            width: "100%",
            maxWidth: "500px",
          }}
        >
          <Flex vertical gap="0px">
            <Typography.Title level={4} style={{ margin: 0 }}>
              Create Password
            </Typography.Title>

            {labelSecondary && (
              <Typography.Text>{labelSecondary}</Typography.Text>
            )}
          </Flex>

          <Flex vertical gap="2px">
            <TextField
              size="small"
              type="password"
              inputRef={inputRef}
              onKeyDown={(ev) => {
                if (ev.key == "Enter") {
                  ev.preventDefault();
                  doSubmit();
                }
              }}
            />

            {labelTertiary && (
              <Typography.Text
                style={{
                  color: "rgb(180, 180, 180)",
                }}
              >
                {labelTertiary}
              </Typography.Text>
            )}
          </Flex>
        </Flex>

        <TextField
          size="small"
          label="confirm password"
          type="password"
          inputRef={inputConfirmationRef}
          onKeyDown={(ev) => {
            if (ev.key == "Enter") {
              ev.preventDefault();
              doSubmit();
            }
          }}
        />

        {withInputField && (
          <Flex
            vertical
            justify="center"
            gap="15px"
            style={{
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <Flex vertical gap="0px">
              {withInputField.labelPrimary && (
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {withInputField.labelPrimary}
                </Typography.Title>
              )}

              {withInputField.labelSecondary && (
                <Typography.Text>
                  {withInputField.labelSecondary}
                </Typography.Text>
              )}
            </Flex>

            <Flex vertical gap="2px">
              {(() => {
                if (withInputField.variant == "text") {
                  return (
                    <Input
                      size="large"
                      ref={withInputFieldTextInputRef}
                      onPressEnter={() => {
                        doSubmit();
                      }}
                    />
                  );
                }

                if (withInputField.variant == "password") {
                  return (
                    <Input.Password
                      size="large"
                      ref={withInputFieldPasswordInputRef}
                      onPressEnter={() => {
                        doSubmit();
                      }}
                    />
                  );
                }

                return <></>;
              })()}

              {withInputField.labelTertiary && (
                <Typography.Text
                  style={{
                    color: "rgb(180, 180, 180)",
                  }}
                >
                  {withInputField.labelTertiary}
                </Typography.Text>
              )}
            </Flex>
          </Flex>
        )}

        <Flex
          gap="10px"
          style={{
            width: "100%",
          }}
        >
          <Button
            type="default"
            size="large"
            onClick={() => {
              finishClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              doSubmit();
            }}
          >
            Submit
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
