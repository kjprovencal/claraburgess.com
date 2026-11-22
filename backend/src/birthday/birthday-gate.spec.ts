import { signBirthdayGate, verifyBirthdayGate } from './birthday-gate';

describe('birthday gate', () => {
  const secret = 'test-secret';
  const timestamp = '1700000000000';

  it('rejects a missing secret', () => {
    const signature = signBirthdayGate(secret, timestamp);
    expect(verifyBirthdayGate('', timestamp, signature, 1700000000000)).toBe(
      false,
    );
  });

  it('accepts a fresh signature', () => {
    const signature = signBirthdayGate(secret, timestamp);
    expect(signature).toBe('hbU2bDZcT5Mp0enUjcEEAiD6lC1jCwtVIcuLXZTSoEI');
    expect(
      verifyBirthdayGate(secret, timestamp, signature, 1700000000000),
    ).toBe(true);
  });

  it('rejects a stale timestamp', () => {
    const signature = signBirthdayGate(secret, timestamp);
    expect(
      verifyBirthdayGate(secret, timestamp, signature, 1700000000000 + 61_000),
    ).toBe(false);
  });

  it('rejects a bad signature', () => {
    expect(
      verifyBirthdayGate(secret, timestamp, 'not-a-signature', 1700000000000),
    ).toBe(false);
  });
});
