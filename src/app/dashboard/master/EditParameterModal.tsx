"use client";

import { useState } from 'react';
import { updateParameter } from '../../actions/auth';
import Swal from 'sweetalert2';

interface Parameter {
  id: string;
  param_type: string;
  param_code: string;
  param_name: string;
  param_value: string | null;
  is_active: boolean;
}

interface EditParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameter: Parameter;
  onSuccess: () => void;
}

export default function EditParameterModal({ isOpen, onClose, parameter, onSuccess }: EditParameterModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await updateParameter(parameter.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Perubahan telah disimpan.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      onSuccess();
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
        maxWidth: '450px', 
        padding: '2rem', 
        backgroundColor: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Edit Master Data</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Perbarui informasi item {parameter.param_type.toLowerCase().replace(/_/g, ' ')}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>NAMA {parameter.param_type.replace(/_/g, ' ')}</label>
            <input 
              name="param_name" 
              type="text" 
              defaultValue={parameter.param_name}
              required 
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#0f172a',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>STATUS AKTIF</label>
            <select 
              name="is_active" 
              defaultValue={parameter.is_active.toString()}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#0f172a',
                fontSize: '0.9rem'
              }}
            >
              <option value="true">Aktif</option>
              <option value="false">Non-Aktif</option>
            </select>
          </div>

          {parameter.param_type === 'RUANG_RAWAT_INAP' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>PIC WHATSAPP NO</label>
              <input 
                name="param_value" 
                type="text" 
                defaultValue={parameter.param_value || ''}
                placeholder="Contoh: 08123456789"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#0f172a',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          )}

          {error && (
            <div style={{ 
              color: '#dc2626', 
              fontSize: '0.8rem', 
              textAlign: 'center',
              backgroundColor: '#fef2f2',
              padding: '8px',
              borderRadius: '6px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="button-secondary"
              style={{ flex: 1, padding: '10px' }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="button-primary" 
              disabled={loading}
              style={{ flex: 2, padding: '10px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
