"use client";

import { useState, useEffect, useCallback } from 'react';
import { getParameters, deleteParameter } from '../../actions/auth';
import EditParameterModal from './EditParameterModal';
import AddParameterModal from './AddParameterModal';
import Swal from 'sweetalert2';

const TABS = [
  { id: 'DOKTER', label: 'Dokter' },
  { id: 'RUANG_RAWAT_INAP', label: 'Ruang Rawat Inap' },
  { id: 'POLI', label: 'Poli' },
  { id: 'PENJAMIN', label: 'Penjamin' },
  { id: 'KELAS', label: 'Kelas' },
];

interface Parameter {
  id: string;
  param_type: string;
  param_code: string;
  param_name: string;
  param_value: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function MasterDataTabs() {
  const [activeTab, setActiveTab] = useState('DOKTER');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    setError(null);
    try {
      const result = await getParameters();
      if (result.success) {
        setParameters(result.data);
      } else {
        setError(result.error || "Gagal memuat data");
      }
    } catch {
      setError("Koneksi ke server API gagal");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure any synchronous render phase is over
    const timer = setTimeout(() => {
      loadData(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Menghapus "${name}" tidak dapat dibatalkan!`,
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
      setDeleteLoadingId(id);
      const deleteResult = await deleteParameter(id);
      if (deleteResult.success) {
        Swal.fire({
          title: 'Terhapus!',
          text: `"${name}" telah berhasil dihapus.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadData();
      } else {
        Swal.fire({
          title: 'Gagal!',
          text: deleteResult.error || 'Terjadi kesalahan saat menghapus.',
          icon: 'error'
        });
      }
      setDeleteLoadingId(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Memuat data...
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>
          {error}
        </div>
      );
    }

    const filteredData = parameters.filter(p => p.param_type === activeTab);
    const tab = TABS.find(t => t.id === activeTab);

    if (filteredData.length === 0) {
      return (
        <div className="card animate-fade-in" style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: '#f1f5f9', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            margin: '0 auto 1.5rem'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2H2v10h10V2z"></path><path d="M22 2h-10v10h10V2z"></path><path d="M12 12H2v10h10V12z"></path><path d="M22 12h-10v10h10V12z"></path>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Data {tab?.label} Kosong
          </h2>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
            Belum ada data {tab?.label.toLowerCase()} yang tersedia di sistem saat ini.
          </p>
        </div>
      );
    }

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'white' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Nama {tab?.label}</th>
                {activeTab === 'RUANG_RAWAT_INAP' && (
                  <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>PIC Whatsapp</th>
                )}
                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{item.param_name}</td>
                  {activeTab === 'RUANG_RAWAT_INAP' && (
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#64748b' }}>
                      {item.param_value ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#22c55e' }}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                          {item.param_value}
                        </div>
                      ) : '-'}
                    </td>
                  )}
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: item.is_active ? '#f0fdf4' : '#fef2f2',
                      color: item.is_active ? '#166534' : '#991b1b'
                    }}>
                      {item.is_active ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => {
                          setSelectedParameter(item);
                          setIsEditModalOpen(true);
                        }}
                        style={{ 
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, item.param_name)}
                        disabled={deleteLoadingId === item.id}
                        style={{ 
                          background: '#fef2f2',
                          border: '1px solid #fee2e2',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: deleteLoadingId === item.id ? 0.5 : 1
                        }}
                        title="Hapus"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: activeTab === tab.id ? 'var(--accent)' : '#64748b',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.25rem' }}>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="button-primary"
          style={{
            padding: '10px 20px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            borderRadius: '10px',
            boxShadow: '0 4px 6px -1px rgba(15, 118, 110, 0.1), 0 2px 4px -1px rgba(15, 118, 110, 0.06)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tambah {TABS.find(t => t.id === activeTab)?.label}
        </button>
      </div>
      
      <div style={{ minHeight: '400px' }}>
        {renderContent()}
      </div>

      {selectedParameter && (
        <EditParameterModal 
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedParameter(null);
          }}
          parameter={selectedParameter}
          onSuccess={loadData}
        />
      )}

      <AddParameterModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        paramType={activeTab}
        onSuccess={loadData}
      />
    </div>
  );
}
