import pino from "pino";

export const logger = defaultConfig =>
  pino({
    ...defaultConfig,
  });
