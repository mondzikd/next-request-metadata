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
  context: GetServerSidePropsContext
): Metadata => {
  const requestId = getRequestId(context);

  context.res.setHeader("x-request-id", requestId);

  return { "x-request-id": requestId };
};

export const metadataRequestWrapper = <T extends { [key: string]: any }>(
  getServerSideProps: GetServerSideProps<T>,
  prepareMetadata: (
    context: GetServerSidePropsContext
  ) => Metadata = prepareMetadataDefault
): GetServerSideProps<T> => {
  return (context) => {
    const store = prepareMetadata(context);
    return asyncLocalStorage.run(store, getServerSideProps, context);
  };
};

export const getMetadata = () => {
  return asyncLocalStorage.getStore() || {};
};
