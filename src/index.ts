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
 * Prepare a minimal metadata object with `x-request-id`.
 *
 * Calling conventions supported:
 *  - (context) where context is { req, res } - Next.js getServerSideProps
 *  - (req, res) using request and response directly - Next.js API handlers
 *
 * Behavior:
 *  - Reads `x-request-id` from `req.headers` when present; otherwise generates a UUID.
 *  - Sets `x-request-id` on the response via `res.setHeader`.
 *  - Returns an object of shape `{ "x-request-id": string }`.
 *
 * If the arguments do not match either convention the function returns an empty object.
 *
 * Side effects:
 *  - Mutates the response by calling `res.setHeader("x-request-id", ...)`.
 *
 * @param args either a single context object ({ req, res }) or (req, res)
 * @returns object containing "x-request-id"
 */
const prepareMetadataDefault = (...args: unknown[]): Metadata => {
  if (args.length === 1 && isContextLike(args[0])) {
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
 * Create a request-metadata manager.
 *
 * @param prepareMetadata function that builds the RequestMetadata object from the arguments
 *                        passed to metadataRequestWrapper wrapped function.
 * @returns metadataRequestWrapper and getMetadata functions.
 */
const setup = <RequestMetadata>(
  prepareMetadata: (...args: any[]) => RequestMetadata,
) => {
  const asyncLocalStorage = new AsyncLocalStorage<RequestMetadata>();

  /**
   * Wrap a function with a per-call metadata store.
   *
   * Can be used to wrap Next.js SSR getServerSideProps or API handlers functions, to share request
   * metadata context across nested functions.
   *
   * @param original function to be wrapped with metadata context. It's nested functions will share
   *                 metadata context.
   * @param prepareRequestMetadata optional that builds the RequestMetadata object from the
   *                               arguments passed to wrapped function. Defaults to the
   *                               prepareMetadata from setup module.
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
   * Get metadata for the current asynchronous context created by metadataRequestWrapper.
   *
   * @returns the RequestMetadata object, or `undefined` if called outside of a wrapped invocation.
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
