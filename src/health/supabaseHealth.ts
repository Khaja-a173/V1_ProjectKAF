import { API_BASE } from '@/lib/api';

export async function checkMenuHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health/supabase`, { credentials: 'include' });
    if (res.ok) {
      const json = await res.json().catch(() => ({} as any));
      return !!json?.ok;
    }
    // Soft-fail in dev if endpoint unavailable; do not block dashboard
    return process.env.NODE_ENV === 'development' ? true : false;
  } catch {
    return process.env.NODE_ENV === 'development' ? true : false;
  }
}