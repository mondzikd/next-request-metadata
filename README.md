# next-request-metadata

## Installation

```
npm install next-request-metadata
```

## Basic usage

```TypeScript
// SSR page
import { metadataRequestWrapper } from "next-request-metadata";
import { calculateSomething } from "@/helperFuntion";

export const getServerSideProps = metadataRequestWrapper(async (context) => {
  const someProp = calculateSomething(); // nested functions will share request metadata

  return {
    props: { someProp },
  };
});

export const SSRExamplePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ someProp }) => {
  return (
    <div>
      <h1>SSR Example Page</h1>
      <p>Some Prop: {someProp}</p>
    </div>
  );
};
```

```TypeScript
// helperFuntion.ts
import { logger } from "@/logger";

export const calculateSomething = () => {
  logger('Calculating something');

  return 'Something important';
};
```

```TypeScript
// logger.ts
import { getMetadata } from "next-request-metadata";

export const logger = (message) => {
  const requestMetadata = getMetadata();

  console.log(requestMetadata, message);
};
```

See [examples](./examples/next-pino/)!

## API
