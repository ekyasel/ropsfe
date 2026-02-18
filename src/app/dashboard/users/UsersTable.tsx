"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';
import EditUserModal from './EditUserModal';

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  role: string;
}

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Menghapus pengguna "${name}" tidak dapat dibatalkan!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--accent)',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#fff',
      customClass: {
        popup: 'card'
      }
    });

    if (result.isConfirmed) {
      // Since we don't have deleteUser server action yet, we'll implement it or use a placeholder
      Swal.fire({
        title: 'Informasi',
        text: 'Fitur hapus pengguna sedang dalam pengembangan.',
        icon: 'info'
      });
    }
  };

  return (
    <>
      <div className="card" style={{ overflow: 'hidden', backgroundColor: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>NAMA LENGKAP</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>EMAIL</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>STATUS</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>ROLE</th>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{user.full_name}</td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.95rem', color: '#64748b' }}>{user.email}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2', 
                    color: user.is_active ? '#15803d' : '#991b1b', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700 
                  }}>
                    {user.is_active ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.95rem', color: '#64748b' }}>
                  {user.role}
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => handleEditClick(user)}
                      style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada data pengguna ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <EditUserModal 
          user={selectedUser} 
          isOpen={isEditModalOpen} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
}
