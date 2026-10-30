import { after, NextResponse, type NextRequest } from 'next/server';
import { defaultDeps, handleInteraction, ResponseType } from '@/lib/blog-bot/commands';
import { discordConfig } from '@/lib/blog-bot/config';
import { editOriginalReply, verifyDiscordRequest } from '@/lib/blog-bot/discord';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Discord's Interactions Endpoint for the /blog command. Verify the
 * signature, answer within Discord's 3-second window, and do anything slow
 * (GitHub calls) after responding, editing the reply when it is done.
 */
export async function POST(req: NextRequest) {
  const cfg = discordConfig();
  if (!cfg) return new NextResponse(null, { status: 404 });

  const raw = await req.text();
  const ok = verifyDiscordRequest(
    cfg.publicKey,
    req.headers.get('x-signature-ed25519'),
    req.headers.get('x-signature-timestamp'),
    raw,
  );
  if (!ok) return new NextResponse('invalid request signature', { status: 401 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse('invalid json', { status: 400 });
  }

  const handled = handleInteraction(body, defaultDeps);
  if (handled.kind === 'reply') return NextResponse.json(handled.response);

  // the schema in handleInteraction already guaranteed these are strings
  const { application_id: appId, token } = body as { application_id: string; token: string };
  after(async () => {
    let content: string;
    try {
      content = await handled.run();
    } catch (err) {
      console.error('blog bot:', err instanceof Error ? err.message : 'unknown error');
      content = '⚠️ Something went wrong talking to GitHub. Check the Vercel function logs.';
    }
    await editOriginalReply(appId, token, content).catch((err) =>
      console.error('blog bot: could not edit the Discord reply:', err instanceof Error ? err.message : 'unknown'),
    );
  });

  return NextResponse.json({ type: ResponseType.DEFERRED_MESSAGE });
}
