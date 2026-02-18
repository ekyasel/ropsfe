'use client';

import { useState } from 'react';
import { register } from '../actions/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await register(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
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
          maxWidth: '450px', 
          padding: '3.5rem', 
          textAlign: 'center',
          backgroundColor: 'white'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: '#ecfeff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--accent)'
          }}>
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0f172a', fontWeight: 700 }}>Profil Dibuat</h2>
          <p style={{ color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Profil personel Anda telah terdaftar di sistem RSUD Sidoarjo Barat.
          </p>
          <Link href="/login" className="button-primary" style={{ display: 'inline-block', width: '100%' }}>
            Lanjut ke Login
          </Link>
        </div>
      </main>
    );
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
        maxWidth: '500px', 
        padding: '3.5rem',
        backgroundColor: 'white',
        border: '1px solid var(--card-border)'
      }}>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem', textAlign: 'center', color: '#0f172a', fontWeight: 700 }}>Buat Profil</h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '3rem', fontSize: '1rem' }}>
          Daftar Akun Baru Sistem Manajemen Ruang Operasi RSUD Sidoarjo Barat.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>NAMA LENGKAP</label>
            <input 
              name="full_name" 
              type="text" 
              required 
              placeholder="Dr. John Doe"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                color: '#0f172a',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>ALAMAT EMAIL</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="surgeon@rumahsakit.com"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                color: '#0f172a',
                outline: 'none',
                fontSize: '1rem'
              }}
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
                fontSize: '1rem'
              }}
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
            {loading ? 'Membuat Profil...' : 'Selesaikan Pendaftaran'}
          </button>
        </form>

        <p style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.95rem', color: '#64748b' }}>
          Sudah punya akun? <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Masuk</Link>
        </p>
      </div>
    </main>
  );
}
