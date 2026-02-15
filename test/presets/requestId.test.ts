import test from "node:test";
import assert from "node:assert";
import { prepareRequestIdMetadata } from "../../src/presets/requestId.js";

test("prepareRequestIdMetadata works with SSR context-like argument", async () => {
  const req = { headers: { "x-request-id": "test-request-id" } };
  const res = {
    setHeader: (key: string, value: string) => key + value,
  };

  const result = prepareRequestIdMetadata({ req, res });

  assert.strictEqual(result["x-request-id"], "test-request-id");
});

test("prepareRequestIdMetadata works with API handler-like arguments", async () => {
  const req = { headers: { "x-request-id": "test-request-id" } };
  const res = {
    setHeader: (key: string, value: string) => key + value,
  };

  const result = prepareRequestIdMetadata(req, res);

  assert.strictEqual(result["x-request-id"], "test-request-id");
});

test("prepareRequestIdMetadata reuse request header x-request-id", async () => {
  const spySetHeader = { key: "", value: "" };
  const req = { headers: { "x-request-id": "test-request-id" } };
  const res = {
    setHeader: (key: string, value: string) => {
      spySetHeader.key = key;
      spySetHeader.value = value;
    },
  };

  const result = prepareRequestIdMetadata(req, res);

  assert.strictEqual(result["x-request-id"], "test-request-id");
  assert.strictEqual(spySetHeader.key, "x-request-id");
  assert.strictEqual(spySetHeader.value, "test-request-id");
});

test("prepareRequestIdMetadata generates x-request-id when no request header", async () => {
  const spySetHeader = { key: "", value: "" };
  const req = { headers: {} };
  const res = {
    setHeader: (key: string, value: string) => {
      spySetHeader.key = key;
      spySetHeader.value = value;
    },
  };

  const result = prepareRequestIdMetadata(req, res);

  assert.strictEqual(
    result["x-request-id"] && result["x-request-id"].length > 0,
    true,
  );
  assert.strictEqual(spySetHeader.key, "x-request-id");
  assert.strictEqual(spySetHeader.value, result["x-request-id"]);
});
