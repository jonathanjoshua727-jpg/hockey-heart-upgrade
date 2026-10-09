import assert from "node:assert/strict";
import test from "node:test";
import {
  flutterwaveCreatePayment,
  getFlutterwaveSecret,
  isFlutterwaveConfigured,
} from "./flutterwave.ts";

const previousSecret = process.env.FLUTTERWAVE_SECRET_KEY;
const previousFetch = globalThis.fetch;

test("reports missing Flutterwave credentials without exposing a secret", () => {
  delete process.env.FLUTTERWAVE_SECRET_KEY;

  assert.equal(isFlutterwaveConfigured(), false);
  assert.throws(
    () => getFlutterwaveSecret(),
    /FLUTTERWAVE_SECRET_KEY is not configured/,
  );

  if (previousSecret !== undefined) {
    process.env.FLUTTERWAVE_SECRET_KEY = previousSecret;
  }
});

test("classifies provider credential rejection separately from payment rejection", async () => {
  process.env.FLUTTERWAVE_SECRET_KEY = "unit-test-provider-secret";
  globalThis.fetch = async (_url, init) => {
    assert.equal(init.method, "POST");
    return new Response(JSON.stringify({ status: "error" }), {
      status: 401,
    });
  };

  const result = await flutterwaveCreatePayment({
    txRef: "HHI-TEST-REF",
    amountUsd: 50,
    email: "donor@example.test",
    name: "Test Donor",
    redirectUrl: "https://hockeyheartinitiative.com/donate",
    paymentOptions: "card",
  });

  assert.equal(result.ok, false);
  assert.equal(result.failure, "configuration");
  assert.equal(result.status, 401);
});

test("does not treat a provider rejection as successful payment initialization", async () => {
  process.env.FLUTTERWAVE_SECRET_KEY = "unit-test-provider-secret";
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ status: "error" }), {
      status: 422,
    });

  const result = await flutterwaveCreatePayment({
    txRef: "HHI-TEST-REF",
    amountUsd: 50,
    email: "donor@example.test",
    name: "Test Donor",
    redirectUrl: "https://hockeyheartinitiative.com/donate",
    paymentOptions: "card",
  });

  assert.equal(result.ok, false);
  assert.equal(result.failure, "provider");
  assert.equal(result.status, 422);
});

test("keeps a transient provider response failure distinguishable from rejection", async () => {
  process.env.FLUTTERWAVE_SECRET_KEY = "unit-test-provider-secret";
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ status: "error" }), {
      status: 503,
    });

  const result = await flutterwaveCreatePayment({
    txRef: "HHI-TEST-REF",
    amountUsd: 50,
    email: "donor@example.test",
    name: "Test Donor",
    redirectUrl: "https://hockeyheartinitiative.com/donate",
    paymentOptions: "card",
  });

  assert.equal(result.ok, false);
  assert.equal(result.failure, "unknown");
  assert.equal(result.status, 503);
});

test("treats a lost provider response as an unknown outcome", async () => {
  process.env.FLUTTERWAVE_SECRET_KEY = "unit-test-provider-secret";
  globalThis.fetch = async () => {
    throw new Error("simulated network failure");
  };

  const result = await flutterwaveCreatePayment({
    txRef: "HHI-TEST-REF",
    amountUsd: 50,
    email: "donor@example.test",
    name: "Test Donor",
    redirectUrl: "https://hockeyheartinitiative.com/donate",
    paymentOptions: "card",
  });

  assert.equal(result.ok, false);
  assert.equal(result.failure, "unknown");
  assert.equal(result.status, undefined);
});

test.after(() => {
  globalThis.fetch = previousFetch;
  if (previousSecret === undefined) {
    delete process.env.FLUTTERWAVE_SECRET_KEY;
  } else {
    process.env.FLUTTERWAVE_SECRET_KEY = previousSecret;
  }
});
