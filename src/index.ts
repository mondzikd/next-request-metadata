import { AsyncLocalStorage } from "node:async_hooks";
import { prepareRequestIdMetadata } from "./presets/requestId.js";

type MetadataRequestWrapper = <Args extends unknown[], R>(
  original: (...args: Args) => R,
) => (...args: Args) => R;

function handlersFactory(): {
  metadataRequestWrapper: MetadataRequestWrapper;
  getMetadata: () => ReturnType<typeof prepareRequestIdMetadata> | undefined;
};

function handlersFactory<RequestMetadata>(
  prepareMetadata: (...args: unknown[]) => RequestMetadata,
): {
  metadataRequestWrapper: MetadataRequestWrapper;
  getMetadata: () => RequestMetadata | undefined;
};

/**
 * Creates a request-metadata functions, sharing per-call context generated with prepareMetadata
 * argument. Works like a middleware that allows to share metadata across nested function calls
 * without passing it down as an argument.
 *
 * @param [prepareMetadata=prepareRequestIdMetadata] function that builds the RequestMetadata object
 *        from the arguments passed to metadataRequestWrapper wrapped function.
 *        Defaults to {@link prepareRequestIdMetadata}.
 * @returns metadataRequestWrapper and getMetadata functions.
 */
function handlersFactory(
  prepareMetadata: (...args: unknown[]) => unknown = prepareRequestIdMetadata,
) {
  const asyncLocalStorage = new AsyncLocalStorage();

  /**
   * Wraps a function with a per-call metadata, prepared with prepareMetadata factory function
   * argument.
   *
   * Can be used to wrap Next.js SSR getServerSideProps or API handlers functions, to share request
   * metadata context across nested functions.
   *
   * @param original function to be wrapped with metadata context. It's nested functions will share
   *        metadata context.
   * @returns original getServerSideProps wrapped with metadata context.
   */
  const metadataRequestWrapper: MetadataRequestWrapper = (original) => {
    return (...args) => {
      const store = prepareMetadata(...args);
      return asyncLocalStorage.run(store, original, ...args);
    };
  };

  /**
   * Gets metadata for the current asynchronous context created by metadataRequestWrapper.
   *
   * @returns the RequestMetadata object, or `undefined` if called outside of a wrapped invocation.
   */
  const getMetadata = () => {
    return asyncLocalStorage.getStore();
  };

  return { metadataRequestWrapper, getMetadata };
}

export default handlersFactory;
