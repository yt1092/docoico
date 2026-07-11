import { NextResponse } from 'next/server';

export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY;
  const enabled = process.env.ENABLE_GEMINI === 'false' ? false : hasKey;
  return NextResponse.json({ ok: true, hasKey, enabled });
}
