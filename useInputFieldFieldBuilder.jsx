import { Flex, Typography } from "antd";
import { useRef } from "react";
import { TextField } from "@mui/material";

export default function useInputFieldFieldBuilder({
  labelPrimary,
  labelSecondary,
  labelTertiary,
  variant,
  variantData,
  onSubmitIntent,
}) {
  const emailAddressInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const builder = () => {
    return (
      <Flex
        vertical
        justify="center"
        gap="20px"
        style={{
          width: "100%",
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
            if (variant == "emailAddress") {
              return (
                <TextField
                  inputRef={emailAddressInputRef}
                  size="small"
                  label="email"
                  style={{
                    width: "100%",
                    marginTop: "9px",
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key == "Enter") {
                      if (onSubmitIntent != null) {
                        ev.preventDefault();
                        onSubmitIntent();
                      }
                    }
                  }}
                />
              );
            }

            if (variant == "password") {
              return (
                <TextField
                  type="password"
                  inputRef={passwordInputRef}
                  size="small"
                  label="password"
                  style={{
                    width: "100%",
                    marginTop: "9px",
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key == "Enter") {
                      if (onSubmitIntent != null) {
                        ev.preventDefault();
                        onSubmitIntent();
                      }
                    }
                  }}
                />
              );
            }

            return (
              <Typography.Text type="danger">No input source</Typography.Text>
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
      </Flex>
    );
  };

  builder.focus = () => {
    if (variant == "emailAddress") {
      emailAddressInputRef.current.focus();
    }

    if (variant == "password") {
      passwordInputRef.current.focus();
    }
  };

  builder.getValue = () => {
    if (variant == "emailAddress") {
      let value = emailAddressInputRef.current.value;

      if (variantData?.trimInput) {
        value = value.trim();
      }

      return value;
    }

    if (variant == "password") {
      let value = passwordInputRef.current.value;

      // we don't trim passwords

      return value;
    }

    return undefined;
  };

  return builder;
}
