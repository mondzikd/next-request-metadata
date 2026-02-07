import { AsyncLocalStorage } from "node:async_hooks";

type MetadataRequestWrapper<M> = <Args extends any[], R>(
  original: (...args: Args) => R,
  prepareMetadata?: (...args: Args) => M,
) => (...args: Args) => R;

/**
 * Create a request-metadata manager.
 *
 * @param prepareMetadata function that builds the RequestMetadata object from the arguments
 *                        passed to metadataRequestWrapper wrapped function.
 * @returns metadataRequestWrapper and getMetadata functions.
 */
export const setup = <RequestMetadata>(
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
