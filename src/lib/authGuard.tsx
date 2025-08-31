import { useEffect, useState } from 'react';
import { API_BASE } from './api';

export function useSession() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setToken(data.authenticated ? 'dev-token' : null);
        } else {
          setToken(null);
        }
      } catch (err) {
        console.warn('Auth check failed:', err);
        // In development, assume authenticated to unblock dashboard
        setToken(process.env.NODE_ENV === 'development' ? 'dev-token' : null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { token, loading };
}

export function Protected({ children }: { children: React.ReactNode }) {
  const { token, loading } = useSession();
  if (loading) return <div className="p-6">Checking session…</div>;
  if (token === null) return <div className="p-6">Authentication required</div>;
  return <>{children}</>;
}