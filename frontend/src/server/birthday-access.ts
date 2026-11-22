import { createHmac, timingSafeEqual } from "crypto";

export const BIRTHDAY_ACCESS_TTL_SECONDS = 30 * 60;
const BIRTHDAY_GATE_SKEW_MS = 60 * 1000;

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function sealBirthdayAccess(secret: string, now = Date.now()): string {
  const exp = now + BIRTHDAY_ACCESS_TTL_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString(
    "base64url",
  );
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function openBirthdayAccess(
  secret: string,
  token: string | undefined,
  now = Date.now(),
): boolean {
  if (secret === "" || token === undefined || token === "") {
    return false;
  }
  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }
  const payload = parts[0];
  const signature = parts[1];
  if (payload === undefined || signature === undefined) {
    return false;
  }
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  if (!safeEqual(expected, signature)) {
    return false;
  }
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (typeof parsed !== "object" || parsed === null || !("exp" in parsed)) {
      return false;
    }
    const exp = parsed.exp;
    return typeof exp === "number" && Number.isFinite(exp) && exp > now;
  } catch {
    return false;
  }
}

export function signBirthdayGate(secret: string, timestamp: string): string {
  return createHmac("sha256", secret).update(timestamp).digest("base64url");
}

export function verifyBirthdayGate(
  secret: string,
  timestamp: string,
  signature: string,
  now: number,
): boolean {
  if (secret === "") {
    return false;
  }
  if (!/^\d+$/.test(timestamp)) {
    return false;
  }
  const issuedAt = Number(timestamp);
  if (!Number.isSafeInteger(issuedAt)) {
    return false;
  }
  if (Math.abs(now - issuedAt) > BIRTHDAY_GATE_SKEW_MS) {
    return false;
  }
  return safeEqual(signBirthdayGate(secret, timestamp), signature);
}
