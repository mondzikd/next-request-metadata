import setup from "next-request-metadata";
import pino from "pino";

const {
  getMetadata: getLogRequestMetadata,
  metadataRequestWrapper: logMetadataRequestWrapper,
} = setup();

const logger = pino({
  browser: { asObject: true, disabled: process.env.ENVIRONMENT === "production" },
  formatters: {
    level (label) {
      return { level: label }
    }
  },
  mixin() {
    const requestMetadata = getLogRequestMetadata();
    return requestMetadata ?? {};
  },
});

export { logger, logMetadataRequestWrapper };
