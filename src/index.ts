import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export type Metadata = Record<string, string | number | boolean>;

type MetadataRequestWrapper = <Args extends any[], R>(
  original: (...args: Args) => R,
  prepareMetadata?: (arg: Args[0]) => Metadata,
) => (...args: Args) => R;

type DefaultMinimalContext = {
  req: { headers: Record<string, string> };
  res: { setHeader: (key: string, value: string) => void };
};

const asyncLocalStorage = new AsyncLocalStorage<Metadata>();

const getRequestId = (context: DefaultMinimalContext): string => {
  const requestId = context.req.headers["x-request-id"];

  if (typeof requestId === "string") {
    return requestId;
  }

  return randomUUID();
};

/**
 * Prepares example metadata with x-request-id only.
 * Also showcases passing metadata to response headers.
 */
const prepareMetadataDefault = (context: DefaultMinimalContext): Metadata => {
  const requestId = getRequestId(context);

  context.res.setHeader("x-request-id", requestId);

  return { "x-request-id": requestId };
};

/**
 * Next.js getServerSideProps wrapper to share metadata context across nested functions.
 *
 * @param original getServerSideProps function, that nested functions will share metadata context.
 * @param prepareMetadata function preparing metadata, that will be shared in the context. Context
 *                        (first argument) passed to original function will be passed to prepareMetadata.
 *                        Defaults to storing x-request-id AND also injecting it to context.res.headers.
 * @returns original getServerSideProps wrapped with metadata context.
 */
export const metadataRequestWrapper: MetadataRequestWrapper = (
  original,
  prepareMetadata = prepareMetadataDefault,
) => {
  return (...args) => {
    const store = prepareMetadata(args[0]);
    return asyncLocalStorage.run(store, original, ...args);
  };
};

/**
 * Gets metadata from the current request context.
 *
 * @returns metadata created by prepareMetadata passed as an argument to metadataRequestWrapper
 */
export const getMetadata = () => {
  return asyncLocalStorage.getStore() || {};
};
