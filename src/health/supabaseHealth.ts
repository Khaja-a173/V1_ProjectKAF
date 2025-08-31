import { API_BASE } from '@/lib/api';

/**
 * Health check for Supabase that does NOT query tables from the browser.
 * We ask the API (service role) instead. If the endpoint is missing or down,
 * we soft‑fail to avoid blocking the dashboard with a false "migrations failed" banner.
 */
export async function checkMenuHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health/supabase`, { credentials: 'include' });
    if (res.ok) {
      const json = await res.json().catch(() => ({} as any));
      return !!json?.ok;
    }
    // Soft‑fail when endpoint not available or unauthorized; don't block UI
    return true;
  } catch {
    // Network/server offline → do not block dashboard rendering
    return true;
  }
}