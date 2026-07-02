import { supabase } from './supabaseClient';

export async function upsertProfileFromUser(user: any) {
  if (!user || !user.id) return;
  try {
    const provider = (user.user_metadata && user.user_metadata.provider) || (user.identities && user.identities[0]?.provider) || 'unknown';
    const display_name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User';
    const avatar_url = user.user_metadata?.avatar_url || null;

    await supabase.from('profiles').upsert({ id: user.id, provider, display_name, avatar_url, created_at: new Date().toISOString() });
  } catch (err) {
    console.warn('Failed to upsert profile', err);
  }
}

export function createGuestLocalProfile() {
  const id = typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : 'guest-' + Date.now();
  const profile = { id, provider: 'guest', display_name: 'ゲスト', avatar_url: null, created_at: new Date().toISOString() };
  try {
    localStorage.setItem('docoico_guest', JSON.stringify(profile));
  } catch (e) {
    console.warn('localStorage not available');
  }
  return profile;
}
