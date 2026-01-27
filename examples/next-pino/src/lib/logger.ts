import { getMetadata, Metadata } from "../../../../src/index";

const enrichedWithMetadata = (msg: Metadata) => {
  const metadata = getMetadata();
  return { ...metadata, ...msg };
};

/**
 * Simple console logger, that enriches the message with metadata before logging.
 */
export const logger = (msg: Metadata) => {
  console.log(`[LOG]: ${JSON.stringify(enrichedWithMetadata(msg))}`);
};
