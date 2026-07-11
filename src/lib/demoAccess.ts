import { NextResponse } from 'next/server';
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Protects endpoints that can call paid third-party APIs.
 * Set DEMO_ALLOWED_EMAIL to the email address used for the demo login.
 */
export async function requireDemoOwner(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const allowedEmails = (process.env.DEMO_ALLOWED_EMAIL ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!token || allowedEmails.length === 0) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: 'Demo owner login required' }, { status: 401 }) };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email || !allowedEmails.includes(email)) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: 'This demo is private' }, { status: 403 }) };
  }

  return { ok: true as const, userId: data.user.id };
}
