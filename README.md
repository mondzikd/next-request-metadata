# next-request-metadata

Lightweight utility to create and share per-request metadata for Next.js standalone mode apps.

Share `x-request-id` and more across SSR getServerSideProps and API handler call stack without a need to pass down arguments.

## Installation

```sh
npm install next-request-metadata
# or
yarn add next-request-metadata
```

## Quickstart

- Wrap API handler or getServerSideProps with `metadataRequestWrapper()`.
- Call `getMetadata()` from any nested function inside the wrapped call to access the current request metadata.

getServerSideProps (SSR) example:

```TypeScript
// SSR page
import { metadataRequestWrapper } from "next-request-metadata";
import { calculateSomething } from "@/helperFuntion";

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
import { calculateSomething } from "@/helperFuntion";

const handler = (req, res) => {
  const something = calculateSomething(); // functions will share request metadata
  res.status(200).json({ something });
};

// Use prepareMetadataDefault to ensure x-request-id is set on the response.
export default metadataRequestWrapper(handler);
```

Functions in the middle - no need to pass down metadata in arguments:

```TypeScript
// helperFuntion.ts
import { logger } from "@/logger";

export const calculateSomething = () => {
  logger('Calculating something');

  return 'Something important';
};
```

Shared request metadata consumer:

```TypeScript
// logger.ts
import { getMetadata } from "next-request-metadata";

export const logger = (message: string) => {
  const requestMetadata = getMetadata();

  console.log(`[LOG]: ${JSON.stringify({ ...requestMetadata, message })}`);
};
```

Result for both API handler and getServerSideProps:

- log messages:
  `[LOG]: {"x-request-id":"94496d60-0420-43c8-a446-89735cb4f036","message":"Calculating something"}`
- HTTP response:
  `HTTP/1.1 200 OK`
  `x-request-id: 94496d60-0420-43c8-a446-89735cb4f036`

## Examples

See ideas described above in more advanced [examples](https://github.com/mondzikd/next-request-metadata/examples/next-pino/).

## Performance

TBC
