import { setup } from "../../../../src/index";
import { prepareMetadata } from "../../../../src/presets/requestId";

type Log = Record<PropertyKey, string | number | boolean>;

const { getMetadata, metadataRequestWrapper: logMetadataRequestWrapper } =
  setup(prepareMetadata);

const enrichedWithMetadata = (logObject: Log) => {
  const metadata = getMetadata();
  return { ...metadata, ...logObject };
};

/**
 * Simple console logger, that enriches the message with metadata before logging.
 */
export const logger = (msg: Log) => {
  console.log(`[LOG]: ${JSON.stringify(enrichedWithMetadata(msg))}`);
};

export { logMetadataRequestWrapper };
