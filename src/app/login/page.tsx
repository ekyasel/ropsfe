'use client';

import { useState } from 'react';
import { login } from '../actions/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: 'var(--background)'
    }}>
      <div className="card animate-fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '3.5rem',
        backgroundColor: 'white',
        border: '1px solid var(--card-border)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem', color: '#0f172a', fontWeight: 700 }}>Selamat Datang</h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Masuk ke Sistem Manajemen Ruang Operasi RSUD Sidoarjo Barat.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>ALAMAT EMAIL</label>
            <input
              name="email"
              type="email"
              required
              placeholder="operator@rumahsakit.com"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                color: '#0f172a',
                outline: 'none',
                fontSize: '1rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>KATA SANDI</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                color: '#0f172a',
                outline: 'none',
                fontSize: '1rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {error && (
            <div style={{ 
              color: '#dc2626', 
              fontSize: '0.875rem', 
              textAlign: 'center', 
              backgroundColor: '#fef2f2', 
              padding: '12px', 
              borderRadius: '6px',
              border: '1px solid #fee2e2'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="button-primary"
            disabled={loading}
            style={{ marginTop: '1rem', padding: '16px', fontSize: '1.05rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Mengautentikasi...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.95rem', color: '#64748b' }}>
          Personel baru? <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Daftar di Sini</Link>
        </p>
      </div>
    </main>
  );
}
