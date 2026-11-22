import assert from "node:assert/strict";
import test from "node:test";
import { parseBirthdayRsvp } from "./birthday-rsvp";

test("parses a yes RSVP and drops an empty note", () => {
  const parsed = parseBirthdayRsvp({
    name: " Ada ",
    email: "Ada@Example.com",
    attending: "yes",
    guestCount: "",
    note: "   ",
  });
  assert.deepEqual(parsed, {
    ok: true,
    value: {
      name: "Ada",
      email: "ada@example.com",
      attending: "yes",
      guestCount: 1,
    },
  });
});

test("stores zero guests when the answer is no", () => {
  const parsed = parseBirthdayRsvp({
    name: "Ada",
    email: "ada@example.com",
    attending: "no",
    guestCount: "4",
    note: "Can not make it",
  });
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.value.guestCount, 0);
    assert.equal(parsed.value.note, "Can not make it");
  }
});

test("rejects an unknown attendance value", () => {
  const parsed = parseBirthdayRsvp({
    name: "Ada",
    email: "ada@example.com",
    attending: "maybe",
    guestCount: "1",
    note: "",
  });
  assert.deepEqual(parsed, {
    ok: false,
    error: "Check the form and try again.",
  });
});
