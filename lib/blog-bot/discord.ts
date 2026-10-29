import { createPublicKey, verify } from 'node:crypto';

/**
 * The Discord half of the bot: request signature checks and editing the
 * reply to an interaction. Discord signs every interaction with Ed25519 and
 * disables the endpoint if it ever accepts a request with a bad signature.
 */

// DER header that turns a raw 32-byte Ed25519 key into an SPKI public key
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
const MAX_SKEW_SECONDS = 5 * 60;

export function verifyDiscordRequest(
  publicKeyHex: string,
  signatureHex: string | null,
  timestamp: string | null,
  rawBody: string,
  now: Date = new Date(),
): boolean {
  if (!signatureHex || !timestamp) return false;
  if (!/^[0-9a-f]{64}$/i.test(publicKeyHex) || !/^[0-9a-f]{128}$/i.test(signatureHex)) return false;
  // a captured request can't be replayed later
  const sent = Number(timestamp);
  if (!Number.isFinite(sent) || Math.abs(now.getTime() / 1000 - sent) > MAX_SKEW_SECONDS) return false;

  const key = createPublicKey({
    key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(publicKeyHex, 'hex')]),
    format: 'der',
    type: 'spki',
  });
  return verify(null, Buffer.from(timestamp + rawBody), key, Buffer.from(signatureHex, 'hex'));
}

/** Replace the bot's reply to an interaction. The interaction token is valid for 15 minutes. */
export async function editOriginalReply(applicationId: string, token: string, content: string): Promise<void> {
  const res = await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${token}/messages/@original`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content.slice(0, 2000), allowed_mentions: { parse: [] } }),
  });
  if (!res.ok) throw new Error(`discord edit failed: ${res.status}`);
}
