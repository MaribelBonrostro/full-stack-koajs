import { useEffect, useRef } from 'react';
import { refreshToken } from '../api/auth';
import { useRouter } from 'next/navigation';

export function useTokenRefresh(expiresIn: number) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!expiresIn || expiresIn <= 61) return;

    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await refreshToken();
        if (data?.expiry) {
          localStorage.setItem('tokenExpiry', data.expiry);
        }
      } catch {
        router.push('/login');
      }
    }, (expiresIn - 60) * 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [expiresIn, router]);
}
