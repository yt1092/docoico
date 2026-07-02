import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    if (!query) return NextResponse.json({ ok: false, error: 'q required' }, { status: 400 });

    const igToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const xToken = process.env.TWITTER_BEARER_TOKEN;

    const result: any = { query };

    if (igToken) {
      // Placeholder: real implementation requires Instagram Business ID and Graph API calls.
      result.instagram = { note: 'Instagram integration enabled, but requires business account and endpoints to fetch posts.' };
    } else {
      result.instagram = { enabled: false };
    }

    if (xToken) {
      // Placeholder: use Twitter/X API to search recent tweets
      try {
        const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=5`, { headers: { Authorization: `Bearer ${xToken}` } });
        if (res.ok) {
          const data = await res.json();
          result.x = { enabled: true, data: data };
        } else {
          result.x = { enabled: false, error: `Twitter API ${res.status}` };
        }
      } catch (e) {
        result.x = { enabled: false, error: String(e) };
      }
    } else {
      result.x = { enabled: false };
    }

    return NextResponse.json({ ok: true, social: result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
