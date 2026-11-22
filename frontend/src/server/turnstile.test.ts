import assert from "node:assert/strict";
import test from "node:test";
import { verifyTurnstileToken } from "./turnstile";

test("turnstile fails closed when the secret is missing", async () => {
  let called = false;
  const fetchImpl: typeof fetch = async () => {
    called = true;
    throw new Error("should not call Cloudflare");
  };
  assert.equal(
    await verifyTurnstileToken("token", "", null, fetchImpl),
    "unavailable",
  );
  assert.equal(
    await verifyTurnstileToken("   ", "secret", null, fetchImpl),
    "fail",
  );
  assert.equal(called, false);
});

test("turnstile treats a Cloudflare rejection as a failure and a transport error as unavailable", async () => {
  const rejected: typeof fetch = async () =>
    new Response(JSON.stringify({ success: false }), { status: 200 });
  assert.equal(
    await verifyTurnstileToken("token", "secret", "127.0.0.1", rejected),
    "fail",
  );

  const down: typeof fetch = async () => new Response("nope", { status: 500 });
  assert.equal(
    await verifyTurnstileToken("token", "secret", null, down),
    "unavailable",
  );

  const thrown: typeof fetch = async () => {
    throw new Error("network");
  };
  assert.equal(
    await verifyTurnstileToken("token", "secret", null, thrown),
    "unavailable",
  );
});

test("turnstile passes only when Cloudflare reports success", async () => {
  const passed: typeof fetch = async (_input, init) => {
    const body = init?.body;
    assert.ok(body instanceof URLSearchParams);
    assert.equal(body.get("secret"), "secret");
    assert.equal(body.get("response"), "token");
    assert.equal(body.get("remoteip"), "203.0.113.5");
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  };
  assert.equal(
    await verifyTurnstileToken("token", "secret", "203.0.113.5", passed),
    "pass",
  );
});
