import { generateKeyPairSync, sign } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyDiscordRequest } from './discord';

const { publicKey, privateKey } = generateKeyPairSync('ed25519');
// Discord shows the raw 32-byte key as hex; SPKI DER is a 12-byte header + that key
const publicKeyHex = publicKey.export({ format: 'der', type: 'spki' }).subarray(12).toString('hex');

const now = new Date('2026-10-29T00:00:00Z');
const timestamp = String(now.getTime() / 1000);
const body = '{"type":1}';
const signature = sign(null, Buffer.from(timestamp + body), privateKey).toString('hex');

describe('verifyDiscordRequest', () => {
  it('accepts a correctly signed request', () => {
    expect(verifyDiscordRequest(publicKeyHex, signature, timestamp, body, now)).toBe(true);
  });

  it('rejects a tampered body', () => {
    expect(verifyDiscordRequest(publicKeyHex, signature, timestamp, '{"type":2}', now)).toBe(false);
  });

  it('rejects a signature from another key', () => {
    const other = generateKeyPairSync('ed25519').privateKey;
    const forged = sign(null, Buffer.from(timestamp + body), other).toString('hex');
    expect(verifyDiscordRequest(publicKeyHex, forged, timestamp, body, now)).toBe(false);
  });

  it('rejects a replay outside the 5-minute window', () => {
    const later = new Date(now.getTime() + 6 * 60 * 1000);
    expect(verifyDiscordRequest(publicKeyHex, signature, timestamp, body, later)).toBe(false);
  });

  it('rejects missing or malformed headers', () => {
    expect(verifyDiscordRequest(publicKeyHex, null, timestamp, body, now)).toBe(false);
    expect(verifyDiscordRequest(publicKeyHex, signature, null, body, now)).toBe(false);
    expect(verifyDiscordRequest(publicKeyHex, 'zz', timestamp, body, now)).toBe(false);
    expect(verifyDiscordRequest('not-a-key', signature, timestamp, body, now)).toBe(false);
  });
});
