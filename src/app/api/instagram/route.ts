import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    if (!url) return NextResponse.json({ ok: false, error: 'url required' }, { status: 400 });

    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igUserId = process.env.INSTAGRAM_BUSINESS_ID;
    if (!token || !igUserId) return NextResponse.json({ ok: false, enabled: false, error: 'Instagram token or business id not configured' });

    // Placeholder approach: fetch recent media for the business account and filter by url in caption
    const mediaRes = await fetch(`https://graph.facebook.com/v17.0/${igUserId}/media?fields=id,caption,media_url,permalink&access_token=${token}`);
    if (!mediaRes.ok) return NextResponse.json({ ok: false, error: `Instagram API error ${mediaRes.status}` }, { status: 502 });
    const mediaJson = await mediaRes.json();
    const items = mediaJson.data || [];
    const matched = items.filter((m: any) => (m.caption || '').includes(url) || (m.permalink || '').includes(url)).slice(0, 6);

    return NextResponse.json({ ok: true, enabled: true, items: matched });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
