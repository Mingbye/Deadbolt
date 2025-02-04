export class VariantError extends Error {
  constructor(variant, customMessage) {
    super(`${variant}: ${customMessage}`);
    this.variant = variant;
    this.customMessage = customMessage;
  }
}
