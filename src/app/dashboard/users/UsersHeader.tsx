"use client";

import { useState } from 'react';
import AddUserModal from './AddUserModal';

export default function UsersHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Manajemen Pengguna</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Kelola akses dan profil personel</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="button-primary" 
          style={{ padding: '10px 16px', fontSize: '0.875rem' }}
        >
          + Tambah Pengguna
        </button>
      </header>
      
      <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
