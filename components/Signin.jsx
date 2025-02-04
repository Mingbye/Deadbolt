import { Button, Flex, Typography } from "antd";
import useInputFieldFieldBuilder from "../useInputFieldFieldBuilder";
import { VariantError } from "..";

export default function Signin({
  labelPrimary,
  labelSecondary,
  labelTertiary,
  required,
  variant,
  variantData,
  withSecondaryInputField,
  provideOptSignup,
  provideOptRecoverCredentials,
  modaler,
  next,
  finishClose,
  finishResult,
}) {
  const inputFieldFieldBuilder = useInputFieldFieldBuilder({
    labelPrimary: labelPrimary,
    labelSecondary: labelSecondary,
    labelTertiary: labelTertiary,
    variant: variant,
    variantData: variantData,
    onSubmitIntent: () => {
      doSubmit();
    },
  });

  const secondaryInputFieldFieldBuilder = withSecondaryInputField
    ? useInputFieldFieldBuilder({
        labelPrimary: withSecondaryInputField.labelPrimary,
        labelSecondary: withSecondaryInputField.labelSecondary,
        labelTertiary: withSecondaryInputField.labelTertiary,
        variant: withSecondaryInputField.variant,
        variantData: withSecondaryInputField.variantData,
        onSubmitIntent: () => {
          doSubmit();
        },
      })
    : null;

  async function doSubmit() {
    const inputFieldValue = inputFieldFieldBuilder.getValue();
    if (required && inputFieldValue?.length == 0) {
      return;
    }

    const secondaryInputFieldValue =
      secondaryInputFieldFieldBuilder?.getValue();
    if (
      withSecondaryInputField?.required &&
      secondaryInputFieldValue?.length == 0
    ) {
      return;
    }

    let result = null;
    try {
      result = await modaler.load(
        next(inputFieldValue, secondaryInputFieldValue)
      );
    } catch (e) {
      if (e instanceof VariantError) {
        // .........
      }

      console.error(e);

      modaler.alert("Failed. An unexpected error occurred.");
      return;
    }

    finishResult(result);
  }

  return (
    <Flex
      vertical
      justify="center"
      align="center"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Flex
        vertical
        justify="center"
        gap="5px"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "500px",
        }}
      >
        <Flex
          style={{
            width: "100%",
            overflow: "auto",
            flexShrink: 1,
          }}
        >
          <Flex
            vertical
            align="flex-start"
            gap="20px"
            style={{
              width: "100%",
              height: "100%",
              overflow: "auto",
              padding: "10px",
            }}
          >
            <Typography.Title level={3}>Sign-in</Typography.Title>
            {inputFieldFieldBuilder()}
            {secondaryInputFieldFieldBuilder &&
              secondaryInputFieldFieldBuilder()}
            <Flex gap="20px" align="center">
              <Button
                type="primary"
                onClick={() => {
                  doSubmit();
                }}
              >
                sign-in
              </Button>
              {provideOptRecoverCredentials && (
                <Typography.Link
                  onClick={() => {
                    provideOptRecoverCredentials();
                  }}
                >
                  lost credentials or can't sign-in?
                </Typography.Link>
              )}
            </Flex>
          </Flex>
        </Flex>

        {provideOptSignup && (
          <Flex
            align="center"
            gap="10px"
            style={{
              width: "100%",
              padding: "10px",
            }}
          >
            <Button
              onClick={() => {
                provideOptSignup();
              }}
            >
              sign-up | create account
            </Button>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
