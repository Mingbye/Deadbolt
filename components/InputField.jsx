import { useRef } from "react";
import { useDialoger } from "@mingbye/react-build-util";
import { Button, Flex, Input, Typography } from "antd";
import { VariantError } from "../index";

export default function InputField({
  labelPrimary,
  labelSecondary,
  labelTertiary,
  variant,
  variantData,
  required,
  next,
  finishClose,
  finishResult,
}) {
  const dialoger = useDialoger();

  const inputRef = useRef(undefined);

  async function doSubmit() {
    let value = null;

    if (variant == "password") {
      value = inputRef.current.input.value;

      if (variantData?.trimInput) {
        value = value.trim();
      }

      if (required) {
        if (value.length == 0) {
          return;
        }
      }
    }

    let result = null;
    try {
      result = await dialoger.load(next(value));
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
        gap="20px"
        style={{
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <Flex vertical gap="0px">
          {labelPrimary && (
            <Typography.Title level={4} style={{ margin: 0 }}>
              {labelPrimary}
            </Typography.Title>
          )}

          {labelSecondary && (
            <Typography.Text>{labelSecondary}</Typography.Text>
          )}
        </Flex>

        <Flex vertical gap="2px">
          {(() => {
            if (variant == "password") {
              return (
                <Input.Password
                  size="large"
                  ref={inputRef}
                  style={{ width: "100%" }}
                  onPressEnter={() => {
                    doSubmit();
                  }}
                />
              );
            }

            return (
              <Input
                size="large"
                ref={inputRef}
                style={{ width: "100%" }}
                onPressEnter={() => {
                  doSubmit();
                }}
              />
            );
          })()}

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
