"use client";

import { useState } from 'react';
import AddRegistrationModal from './AddRegistrationModal';
import RegistrationsTable from './RegistrationsTable';

export default function SchedulePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Jadwal Operasi</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Kalender dan antrean prosedur bedah aktif</p>
        </div>
        <button 
          className="button-primary" 
          style={{ padding: '10px 16px', fontSize: '0.875rem' }}
          onClick={() => setIsModalOpen(true)}
        >
          + Jadwal Baru
        </button>
      </header>
      
      <div style={{ marginTop: '1.5rem' }}>
        <RegistrationsTable refreshKey={refreshKey} />
      </div>

      <AddRegistrationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </>
  );
}
