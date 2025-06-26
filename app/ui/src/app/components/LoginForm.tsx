'use client';
import { useState } from 'react';
import { login } from '../lib/api/auth';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      // Store expiry in localStorage for refresh logic
      console.log('Login response:', data);
      if (data?.expiry) {
        localStorage.setItem('tokenExpiry', data.expiry);
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.log('Login error:', err);
      setError(err.message || 'Login failed');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='max-w-md mx-auto mt-10 p-8 bg-white rounded shadow-md'
    >
      <h2 className='text-2xl font-bold mb-6 text-center'>Login</h2>

      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>Email</label>
        <input
          type='email'
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='you@example.com'
        />
      </div>

      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>Password</label>
        <input
          type='password'
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='********'
        />
      </div>

      {error && (
        <div className='mb-4 text-red-600 text-sm font-semibold'>{error}</div>
      )}

      <button
        type='submit'
        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded'
      >
        Login
      </button>
    </form>
  );
}
