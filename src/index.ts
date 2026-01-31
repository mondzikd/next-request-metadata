import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

type Metadata = Record<PropertyKey, any>;

type MetadataRequestWrapper<M> = <Args extends any[], R>(
  original: (...args: Args) => R,
  prepareMetadata?: (...args: Args) => M,
) => (...args: Args) => R;

type DefaultMinimalRequest = { headers: { "x-request-id"?: string } };

type DefaultMinimalResponse = {
  setHeader: (key: string, value: string | readonly string[] | number) => any;
};

type DefaultMinimalContext = {
  req: DefaultMinimalRequest;
  res: DefaultMinimalResponse;
};

const isRequestLike = (obj: unknown): obj is DefaultMinimalRequest => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "headers" in obj &&
    typeof obj.headers === "object"
  );
};

const isSetHeaderLike = (
  fun: unknown,
): fun is DefaultMinimalResponse["setHeader"] => {
  return typeof fun === "function" && fun.length >= 2;
};

const isResponseLike = (obj: unknown): obj is DefaultMinimalResponse => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "setHeader" in obj &&
    isSetHeaderLike(obj.setHeader)
  );
};

const isContextLike = (obj: unknown): obj is DefaultMinimalContext => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "req" in obj &&
    "res" in obj &&
    isRequestLike(obj.req) &&
    isResponseLike(obj.res)
  );
};

const getRequestId = (context: DefaultMinimalContext): string => {
  const requestId = context.req.headers["x-request-id"];

  if (typeof requestId === "string") {
    return requestId;
  }

  return randomUUID();
};

const prepareRequestIdMetadata = (context: DefaultMinimalContext): Metadata => {
  const requestId = getRequestId(context);

  context.res.setHeader("x-request-id", requestId);

  return { "x-request-id": requestId };
};

/**
 * Prepares example metadata with x-request-id only.
 * Also showcases passing metadata to response headers.
 */
const prepareMetadataDefault = (...args: unknown[]): Metadata => {
  if ((args.length === 1, isContextLike(args[0]))) {
    return prepareRequestIdMetadata(args[0]);
  } else if (
    args.length === 2 &&
    isRequestLike(args[0]) &&
    isResponseLike(args[1])
  ) {
    return prepareRequestIdMetadata({ req: args[0], res: args[1] });
  }

  return {};
};

/**
 * Sets up metadata context management. It allows storing data throughout the lifetime of
 * a web request or any other asynchronous duration. It's similar to thread-local storage
 * in other languages.
 *
 * @param prepareMetadata function preparing metadata, that will be shared in the context.
 * @returns metadataRequestWrapper and getMetadata functions.
 */
const setup = <RequestMetadata>(
  prepareMetadata: (...args: any[]) => RequestMetadata,
) => {
  const asyncLocalStorage = new AsyncLocalStorage<RequestMetadata>();

  /**
   * General purpose request metadata context wrapper. Can be used to wrap Next.js SSR
   * getServerSideProps or API handlers functions, to share request metadata context across
   * nested function invokes.
   *
   * @param original function to be wrapped with metadata context. It's nested functions will share
   * metadata context.
   * @param prepareMetadata function preparing metadata, that will be shared in the context. Context
   * (first argument) passed to original function will be passed to prepareMetadata.Defaults to
   * storing x-request-id AND also injecting it to context.res.headers.
   * @returns original getServerSideProps wrapped with metadata context.
   */
  const metadataRequestWrapper: MetadataRequestWrapper<RequestMetadata> = (
    original,
    prepareRequestMetadata = prepareMetadata,
  ) => {
    return (...args) => {
      const store = prepareRequestMetadata(...args);
      return asyncLocalStorage.run(store, original, ...args);
    };
  };

  /**
   * Gets metadata from the current request context created inside metadataRequestWrapper.
   *
   * @returns metadata created by prepareMetadata function, if getMetadata is called inside
   * metadataRequestWrapper. Undefined if getMetadata is called outside of metadataRequestWrapper.
   */
  const getMetadata = () => {
    return asyncLocalStorage.getStore();
  };

  return { metadataRequestWrapper, getMetadata };
};

const { metadataRequestWrapper, getMetadata } = setup<Metadata>(
  prepareMetadataDefault,
);

export type { Metadata };
export { metadataRequestWrapper, getMetadata, prepareMetadataDefault };
export default setup;
