import assert from "node:assert/strict";
import test from "node:test";
import { birthdayParty } from "./birthday-party";
import { renderBirthdayHtml } from "./birthday-html";
import type { BirthdayParty } from "./birthday-party";

const fixture: BirthdayParty = {
  ...birthdayParty,
  title: "Title <script>",
  place: `12 "Main" & <lane>`,
  whatToBring: "Shoes",
};

test("party copy stays placeholder text", () => {
  const serialized = JSON.stringify(birthdayParty);
  assert.match(serialized, /REPLACE WITH PLACE/);
  assert.match(serialized, /REPLACE WITH DATE/);
  assert.match(serialized, /REPLACE WITH TIME/);
  assert.match(serialized, /REPLACE WITH WHAT TO BRING/);
  assert.doesNotMatch(
    serialized,
    /\d{1,5}\s+\w+\s+(Street|St|Road|Rd|Avenue|Ave|Lane|Drive|Dr)\b/i,
  );
});

test("renders escaped party details and the RSVP form", () => {
  const html = renderBirthdayHtml(fixture);
  assert.match(html, /Title &lt;script&gt;/);
  assert.match(html, /12 &quot;Main&quot; &amp; &lt;lane&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /id="birthday-rsvp-form"/);
  assert.match(html, /name="attending"/);
  assert.match(html, /Shoes/);
  assert.equal(html.includes("<script>"), false);
});
