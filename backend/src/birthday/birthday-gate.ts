import { createHmac, timingSafeEqual } from 'crypto';

const BIRTHDAY_GATE_SKEW_MS = 60 * 1000;

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function signBirthdayGate(secret: string, timestamp: string): string {
  return createHmac('sha256', secret).update(timestamp).digest('base64url');
}

export function verifyBirthdayGate(
  secret: string,
  timestamp: string,
  signature: string,
  now: number,
): boolean {
  if (secret === '') {
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
