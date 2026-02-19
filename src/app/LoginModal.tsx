'use client';

import { useState } from 'react';
import { login } from './actions/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      <div className="card animate-fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '3rem',
        backgroundColor: 'white',
        border: '1px solid var(--card-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        borderRadius: '16px',
        position: 'relative'
      }}>
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: '1.5rem', 
            right: '1.5rem', 
            background: '#f1f5f9', 
            border: 'none', 
            cursor: 'pointer', 
            color: '#64748b', 
            padding: '8px', 
            borderRadius: '50%', 
            display: 'flex', 
            transition: 'all 0.2s' 
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.02em' }}>Selamat Datang</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Masuk ke Sistem Manajemen Ruang Operasi RSUD Sidoarjo Barat.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ALAMAT EMAIL</label>
            <input
              name="email"
              type="email"
              required
              placeholder="operator@rumahsakit.com"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#0f172a',
                outline: 'none',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              className="login-input"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KATA SANDI</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#0f172a',
                outline: 'none',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              className="login-input"
            />
          </div>

          {error && (
            <div style={{ 
              color: '#dc2626', 
              fontSize: '0.85rem', 
              textAlign: 'center', 
              backgroundColor: '#fef2f2', 
              padding: '10px', 
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
            style={{ 
              marginTop: '0.5rem', 
              padding: '14px', 
              fontSize: '1rem', 
              opacity: loading ? 0.7 : 1,
              width: '100%'
            }}
          >
            {loading ? 'Mengautentikasi...' : 'Sign In'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-soft);
          background: white;
        }
      `}</style>
    </div>
  );
}
