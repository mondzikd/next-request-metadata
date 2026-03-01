import { getLogRequestMetadata } from "./logger";

// A simple wrapper around fetch that automatically includes x-request-id metadata in the headers.
export const get = async (url: string) => {
  const result = await fetch(url, {
    headers: {
    ...getLogRequestMetadata(),
  }});

  return await result.json();
}