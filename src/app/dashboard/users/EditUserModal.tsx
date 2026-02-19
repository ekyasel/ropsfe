"use client";

import { useState } from 'react';
import { updateUser } from '@/app/actions/auth';
import Swal from 'sweetalert2';

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  role: string;
}

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    // Force is_admin to true as requested
    formData.append('is_admin', 'true');
    
    const result = await updateUser(user.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Informasi pengguna telah diperbarui.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      onClose();
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Edit Pengguna</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Perbarui informasi personel</p>
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
              defaultValue={user.full_name}
              required 
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
              defaultValue={user.email}
              required 
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
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>KATA SANDI (OPSIONAL)</label>
            <input 
              name="password" 
              type="password" 
              placeholder="Biarkan kosong jika tidak ingin mengubah"
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
              defaultValue={user.role}
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
              <option value="Farmasi">Farmasi</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>STATUS AKUN</label>
            <select 
              name="is_active" 
              defaultValue={user.is_active ? "true" : "false"}
              required
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#0f172a',
                fontSize: '0.95rem'
              }}
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
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
              {loading ? 'Menyimpan...' : 'Perbarui Pengguna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
