import assert from "node:assert/strict";
import test from "node:test";
import {
  openBirthdayAccess,
  sealBirthdayAccess,
  signBirthdayGate,
  verifyBirthdayGate,
} from "./birthday-access";

const secret = "test-secret";

test("birthday gate signature matches the backend vector", () => {
  assert.equal(
    signBirthdayGate(secret, "1700000000000"),
    "hbU2bDZcT5Mp0enUjcEEAiD6lC1jCwtVIcuLXZTSoEI",
  );
});

test("birthday gate rejects a missing secret, a bad signature, and a stale timestamp", () => {
  const timestamp = "1700000000000";
  const signature = signBirthdayGate(secret, timestamp);
  assert.equal(
    verifyBirthdayGate("", timestamp, signature, 1700000000000),
    false,
  );
  assert.equal(
    verifyBirthdayGate(secret, timestamp, "not-a-signature", 1700000000000),
    false,
  );
  assert.equal(
    verifyBirthdayGate(secret, timestamp, signature, 1700000000000 + 61_000),
    false,
  );
  assert.equal(
    verifyBirthdayGate(secret, timestamp, signature, 1700000000000),
    true,
  );
});

test("access cookie opens only with the same secret before it expires", () => {
  const now = 1_700_000_000_000;
  const token = sealBirthdayAccess(secret, now);
  assert.equal(openBirthdayAccess(secret, token, now + 1_000), true);
  assert.equal(openBirthdayAccess("other-secret", token, now + 1_000), false);
  assert.equal(openBirthdayAccess("", token, now + 1_000), false);
  assert.equal(openBirthdayAccess(secret, undefined, now + 1_000), false);
  assert.equal(openBirthdayAccess(secret, token, now + 30 * 60 * 1000), false);
});
