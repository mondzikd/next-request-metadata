import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export type Metadata = Record<string, string | number | boolean>;

const asyncLocalStorage = new AsyncLocalStorage<Metadata>();

const getRequestId = (context: GetServerSidePropsContext): string => {
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
const prepareMetadataDefault = (
  context: GetServerSidePropsContext,
): Metadata => {
  const requestId = getRequestId(context);

  context.res.setHeader("x-request-id", requestId);

  return { "x-request-id": requestId };
};

/**
 * Next.js getServerSideProps wrapper to share metadata context across nested functions.
 *
 * @param getServerSideProps original getServerSideProps functions, which nested functions will share metadata context
 * @param prepareMetadata function preparing metadata for that will be shared in the context
 * @returns original getServerSideProps wrapped with metadata context
 */
export const metadataRequestWrapper = <T extends { [key: string]: any }>(
  getServerSideProps: GetServerSideProps<T>,
  prepareMetadata: (
    context: GetServerSidePropsContext,
  ) => Metadata = prepareMetadataDefault,
): GetServerSideProps<T> => {
  return (context) => {
    const store = prepareMetadata(context);
    return asyncLocalStorage.run(store, getServerSideProps, context);
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
