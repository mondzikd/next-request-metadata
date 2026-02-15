import { randomUUID } from "node:crypto";

export interface XRequestIdMetadata {
  "x-request-id"?: string;
}

type DefaultMinimalRequest = { headers: { "x-request-id"?: string } };

type DefaultMinimalResponse = {
  setHeader: (key: string, value: string | readonly string[] | number) => void;
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

const _prepareRequestIdMetadata = (
  context: DefaultMinimalContext,
): XRequestIdMetadata => {
  const requestId = getRequestId(context);

  context.res.setHeader("x-request-id", requestId);

  return { "x-request-id": requestId };
};

/**
 * Prepares a minimal metadata object with `x-request-id`.
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
 * @param args Next.js request context - either a single object ({ req, res }) or (req, res)
 * @returns object containing "x-request-id"
 */
export const prepareRequestIdMetadata = (
  ...args: unknown[]
): XRequestIdMetadata => {
  if (args.length === 1 && isContextLike(args[0])) {
    return _prepareRequestIdMetadata(args[0]);
  } else if (
    args.length === 2 &&
    isRequestLike(args[0]) &&
    isResponseLike(args[1])
  ) {
    return _prepareRequestIdMetadata({ req: args[0], res: args[1] });
  }

  return {};
};
