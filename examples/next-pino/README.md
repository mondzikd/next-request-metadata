# next-request-metadata with pino logger

## Getting Started

Installation:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Logs are available in your terminal and injected x-request-id in HTTP response header.

## Concepts

### Logger

Pino logger configuration with next-request-metadata: [logger.ts](./src/lib/logger.ts)

### Same logger in the browser

next-request-metadata works in Node.js environment only, but you can use same logger in client-side code with bundler import alias for browser. Check [next.config.ts](./next.config.ts)

With turbopack:

```TypeScript
turbopack: {
  resolveAlias: {
    "next-request-metadata": { browser: "next-request-metadata/fake" },
  },
},
```

With webpack:

```TypeScript
webpack: (config, options) => {
  if (!options.isServer) {
    config.resolve.alias["next-request-metadata"] = "next-request-metadata/fake";
  }
  return config;
},
```
