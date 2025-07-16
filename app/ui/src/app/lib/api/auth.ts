const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function login(email: string, password: string) {
  const res = await fetch(`${baseUrl}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  console.log('Login response:', res);
  if (!res.ok) {
    throw new Error('Invalid credentials');
  }

  const data = await res.json();
  return data;
}

export async function refreshToken() {
  const res = await fetch(`${baseUrl}/auth`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await res.json();
  return data;
}
