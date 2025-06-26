'use client';
import { useTokenRefresh } from '../lib/hooks/useTokenRefresh';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let expiresIn = 0;
  if (typeof window !== 'undefined') {
    const expiry = localStorage.getItem('tokenExpiry');
    if (expiry) {
      const expiryTime = new Date(expiry).getTime();
      const now = Date.now();
      expiresIn = Math.floor((expiryTime - now) / 1000);
    }
  }

  useTokenRefresh(expiresIn);

  return <>{children}</>;
}
