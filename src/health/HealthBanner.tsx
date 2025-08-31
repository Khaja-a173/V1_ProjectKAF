import { useEffect, useState } from 'react';
import { checkMenuHealth } from './supabaseHealth';

export default function HealthBanner() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    checkMenuHealth()
      .then(setOk)
      .catch(() => setOk(false));
  }, []);

  if (ok === null) return null;
  return (
    <div style={{
      padding: 8,
      fontSize: 12,
      background: ok ? '#e7f7ee' : '#fdecea',
      color: ok ? '#0a6b3d' : '#b71c1c'
    }}>
      Database health: {ok ? 'OK' : 'FAILED (check server connection)'}
    </div>
  );
}