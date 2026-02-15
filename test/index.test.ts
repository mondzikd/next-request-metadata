import test from "node:test";
import assert from "node:assert";
import handlersFactory from "../src/index.js";

const preparedMetadata = "some test value";

const prepareMetadata = (arg?: number) => {
  return { metadata: arg?.toString() ?? preparedMetadata };
};

test("simple handlersFactory sync metadata access", () => {
  const handlers = handlersFactory(prepareMetadata);
  const initialSpyMetadata = "empty";
  const metadataSpy = { metadata: initialSpyMetadata };
  const metadataUsage = () => {
    const metadata = handlers.getMetadata();
    if (metadata) {
      metadataSpy.metadata = metadata.metadata;
    }
  };
  const callback = handlers.metadataRequestWrapper(() => {
    metadataUsage();
  });

  assert.strictEqual(metadataSpy.metadata, initialSpyMetadata);

  callback();

  assert.strictEqual(metadataSpy.metadata, preparedMetadata);
});

test("simple handlersFactory async metadata access", async () => {
  const handlers = handlersFactory(prepareMetadata);
  const initialSpyMetadata = "empty";
  const metadataSpy = { metadata: initialSpyMetadata };
  const metadataUsage = () => {
    const metadata = handlers.getMetadata();
    if (metadata) {
      metadataSpy.metadata = metadata.metadata;
    }
  };
  const callback = handlers.metadataRequestWrapper(async () => {
    await new Promise((resolve) =>
      setTimeout(() => {
        metadataUsage();
        resolve(true);
      }, 10),
    );
  });

  assert.strictEqual(metadataSpy.metadata, initialSpyMetadata);

  await callback();

  assert.strictEqual(metadataSpy.metadata, preparedMetadata);
});

test("handlersFactory concurrent metadata access", async () => {
  const handlers = handlersFactory(prepareMetadata);
  const metadataSpy: string[] = [];
  const metadataUsage = () => {
    const metadata = handlers.getMetadata();
    if (metadata) {
      metadataSpy.push(metadata.metadata);
    }
  };
  const callback = handlers.metadataRequestWrapper(async (timeout: number) => {
    await new Promise((resolve) =>
      setTimeout(() => {
        metadataUsage();
        resolve(true);
      }, timeout),
    );
  });

  assert.deepEqual(metadataSpy, []);

  // callback argument is passed to prepareMetadata, so it will be reflected in the metadata value
  // and then it is passed to original's timeout argument
  await Promise.all([callback(30), callback(20), callback(10)]);

  // async storage is preserved
  assert.deepEqual(metadataSpy, [10, 20, 30]);
});

const preparedMetadata2 = "another test value";

const prepareMetadata2 = () => {
  return { metadata: preparedMetadata2 };
};

test("multiple sync handlersFactory", () => {
  const firstHandlers = handlersFactory(prepareMetadata);
  const firstInitialSpyMetadata = "empty";
  const firstMetadataSpy = { metadata: firstInitialSpyMetadata };
  const firstMetadataUsage = () => {
    const metadata = firstHandlers.getMetadata();
    if (metadata) {
      firstMetadataSpy.metadata = metadata.metadata;
    }
  };
  const firstCallback = firstHandlers.metadataRequestWrapper(() => {
    firstMetadataUsage();
  });

  const secondHandlers = handlersFactory(prepareMetadata2);
  const secondInitialSpyMetadata = "empty2";
  const secondMetadataSpy = { metadata: secondInitialSpyMetadata };
  const secondMetadataUsage = () => {
    const metadata = secondHandlers.getMetadata();
    if (metadata) {
      secondMetadataSpy.metadata = metadata.metadata;
    }
  };
  const secondCallback = secondHandlers.metadataRequestWrapper(async () => {
    secondMetadataUsage();
  });

  assert.strictEqual(firstMetadataSpy.metadata, firstInitialSpyMetadata);
  assert.strictEqual(secondMetadataSpy.metadata, secondInitialSpyMetadata);

  firstCallback();
  secondCallback();
  firstCallback();

  assert.strictEqual(firstMetadataSpy.metadata, preparedMetadata);
  assert.strictEqual(secondMetadataSpy.metadata, preparedMetadata2);
});
