"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '../../actions/auth';
import Swal from 'sweetalert2';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    // Force is_admin to true as requested
    formData.append('is_admin', 'true');
    
    const result = await createUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pengguna baru telah ditambahkan.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      onClose();
      router.push('/dashboard/users'); // Use push to trigger a re-fetch in server components
      router.refresh();
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
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        padding: '2.5rem', 
        backgroundColor: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Tambah Pengguna</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Daftarkan admin baru di sistem</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>NAMA LENGKAP</label>
            <input 
              name="full_name" 
              type="text" 
              required 
              placeholder="Contoh: Budi Santoso"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#0f172a',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>ALAMAT EMAIL</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="email@rsudsb.com"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#0f172a',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>KATA SANDI</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#0f172a',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>JABATAN / ROLE</label>
            <select 
              name="role" 
              required
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#0f172a',
                fontSize: '0.95rem',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                backgroundSize: '16px'
              }}
            >
              <option value="Admin">Admin</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="button-secondary"
              style={{ flex: 1, padding: '12px' }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="button-primary" 
              disabled={loading}
              style={{ flex: 2, padding: '12px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Menyimpan...' : 'Tambah Pengguna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
