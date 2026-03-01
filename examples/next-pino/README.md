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

Or Next.js standalone server in docker:

```bash
# Build the image
docker build -t nextjs-standalone-image .

# Run the container
docker run -p 3000:3000 nextjs-standalone-image
```

Open [http://localhost:3000/ssr/12345](http://localhost:3000/ssr/12345) with your browser to see the result.

Logs are available in your terminal and injected x-request-id in HTTP response header.

You can also call api [http://localhost:3000/api/hello](http://localhost:3000/api/hello) with your browser.

## Concepts

### Logger

Pino logger configuration with next-request-metadata: [logger.ts](./src/lib/logger.ts)

### Same logger in the browser

next-request-metadata works in Node.js environment only, but you can use same logger in client-side code with bundler import alias for browser. Check [next.config.ts](./next.config.ts)
