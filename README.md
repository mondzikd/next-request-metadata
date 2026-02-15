# next-request-metadata

Lightweight utility to create and share per-request metadata for Next.js standalone mode apps.

Share `x-request-id` and more across SSR getServerSideProps and API handler call stack without a need to pass down arguments.

This library works in Node.js server environment only.

## Installation

```sh
npm install next-request-metadata
# or
yarn add next-request-metadata
```

## Quickstart

- Setup shared request metadata consumer:

```TypeScript
// logger.ts
import setup from "next-request-metadata";

const { getMetadata, metadataRequestWrapper } = setup();

const logger = (message: string) => {
  const requestMetadata = getMetadata();

  console.log(`[LOG]: ${JSON.stringify({ ...requestMetadata, message })}`);
};

export { logger, metadataRequestWrapper };
```

- Wrap API handler or getServerSideProps with `metadataRequestWrapper()`.
- Call `getMetadata()` from any nested function inside the wrapped call to access the current request metadata.

getServerSideProps (SSR) example:

```TypeScript
// SSR page
import { metadataRequestWrapper } from "@/logger";
import { calculateSomething } from "@/helperFunction";

export const getServerSideProps = metadataRequestWrapper(async (context) => {
  const someProp = calculateSomething(); // functions will share request metadata

  return {
    props: { someProp },
  };
});
```

API route example:

```TypeScript
// API route
import { metadataRequestWrapper } from "next-request-metadata";
import { calculateSomething } from "@/helperFunction";

const handler = (req, res) => {
  const something = calculateSomething(); // functions will share request metadata
  res.status(200).json({ something });
};

// Use prepareMetadataDefault to ensure x-request-id is set on the response.
export default metadataRequestWrapper(handler);
```

Functions in the middle - no need to pass down metadata in arguments:

```TypeScript
// helperFunction.ts
import { logger } from "@/logger";

export const calculateSomething = () => {
  logger('Calculating something');

  return 'Something important';
};
```

Result for both API handler and getServerSideProps:

- log messages:
  `[LOG]: {"x-request-id":"94496d60-0420-43c8-a446-89735cb4f036","message":"Calculating something"}`
- HTTP response:
  `HTTP/1.1 200 OK`
  `x-request-id: 94496d60-0420-43c8-a446-89735cb4f036`

## Examples

See ideas described above in more advanced [examples](https://github.com/mondzikd/next-request-metadata/tree/master/examples/next-pino).

## API reference

### `setup([prepareMetadata]) => requestMetadata`

The exported setup function takes one optional argument prepareMetadata and returns a requestMetadata instance.

```TypeScript
import setup from "next-request-metadata";
```

#### `prepareMetadata` (Function)

Default: `prepareRequestIdMetadata`

Creates `Metadata` shared within `requestMetadata.metadataRequestWrapper` wrapped context.

Function executed each time metadataRequestWrapper wrapped function is called. It's result can be accessed with `requestMetadata.getMetadata`.

```TypeScript
import setup from "next-request-metadata";
import { GetServerSidePropsContext } from "next";

type Metadata = {
  origin: string | undefined;
}

const prepareMetadata = (context: GetServerSidePropsContext) => ({
  origin: context.req.headers['origin'],
});

const { getMetadata, metadataRequestWrapper } = setup<Metadata>(prepareMetadata);
```

##### `prepareRequestIdMetadata` (Function)

Prepares metadata object with `x-request-id` only. Supports both Next.js getServerSideProps and API handlers arguments.

Behavior:

- Reads `x-request-id` from `req.headers` when present; otherwise generates a UUID.
- Sets `x-request-id` on the response via `res.setHeader`.
- Returns an object of shape `{ "x-request-id": string }`.

If arguments do not match SSR nor API handler convention, the function returns an empty object.

### requestMetadata instance

The requestMetadata instance is the module returned by the default exported next-request-metadata function.

```TypeScript
const { getMetadata, metadataRequestWrapper } = setup();
```

#### `metadataRequestWrapper` (Function)

Wraps a function with a per-call metadata, prepared with prepareMetadata.

Can be used to wrap Next.js SSR getServerSideProps or API handlers functions, to share request metadata context across nested functions.

```TypeScript
// Next.js SSR Page
export const getServerSideProps = metadataRequestWrapper(originalGetServerSideProps);
```

#### `getMetadata` (Function)

Gets metadata for the current async request context, created by prepareMetadata per each metadataRequestWrapper wrapped function call.

Returns `Metadata` object, or `undefined` if called outside of a wrapped invocation.

## Performance

TBC
