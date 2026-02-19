"use client";

import { useState, useEffect, useCallback } from 'react';
import { getRegistrations, deleteRegistration } from '../../actions/auth';
import AddRegistrationModal from './AddRegistrationModal';
import Swal from 'sweetalert2';

interface Registration {
  id: string;
  waktu_pendaftaran: string;
  pendaftaran_dari: string;
  ruangan_rawat_inap: string;
  jenis_operasi: string;
  tanggal_rencana_operasi: string;
  jam_rencana_operasi: string;
  nama_pasien: string;
  no_rekam_medis: string;
  umur_tahun: string;
  jenis_kelamin: string;
  nomor_telp_1: string;
  nomor_telp_2?: string;
  diagnosis: string;
  rencana_tindakan: string;
  dokter_operator: string;
  penjamin: string;
  kelas: string;
  user_created?: string;
  created_at?: string;
}

interface RegistrationsTableProps {
  refreshKey: number;
}

export default function RegistrationsTable({ refreshKey }: RegistrationsTableProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  
  // Filtering & Pagination State
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_role='))
      ?.split('=')[1];
    if (role) setUserRole(decodeURIComponent(role));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRegistrations({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        pageSize
      });
      
      if (result.success) {
        const rawData = result.data;
        if (Array.isArray(rawData)) {
          setRegistrations(rawData);
          setTotalRecords(rawData.length);
        } else if (rawData && typeof rawData === 'object') {
          const list = rawData.data || [];
          const total = rawData.pagination?.total ?? rawData.total ?? rawData.count ?? list.length;
          
          setRegistrations(list);
          setTotalRecords(total);
        }
      } else {
        setError(result.error || "Gagal memuat data");
      }
    } catch {
      setError("Koneksi ke server API gagal");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleEdit = (reg: Registration) => {
    setSelectedReg(reg);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Hapus Jadwal?',
      text: `Apakah Anda yakin ingin menghapus jadwal operasi untuk pasien ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      const deleteResult = await deleteRegistration(id);
      if (deleteResult.success) {
        Swal.fire({
          title: 'Terhapus!',
          text: 'Jadwal operasi telah dihapus.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        loadData();
      } else {
        Swal.fire('Gagal!', deleteResult.error || 'Gagal menghapus data.', 'error');
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await getRegistrations({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: 1,
        pageSize: 10000 // Fetch all matching records
      });

      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : (result.data.data || []);
        
        const headers = [
          "Dibuat Pada", "No. RM", "Nama Pasien", "Umur", "JK", "Tgl Operasi", "Jam", 
          "Diagnosis", "Rencana Tindakan", "Dokter Operator", 
          "Jenis Operasi", "Asal Poli", "Ruang Rawat", "Kelas", "Penjamin"
        ];

        const csvRows = [headers.join(",")];

        data.forEach((reg: Registration) => {
          const row = [
            `"${reg.created_at ? new Date(reg.created_at).toLocaleString('id-ID', { timeZone: 'UTC' }) : ''}"`,
            `"${reg.no_rekam_medis}"`,
            `"${reg.nama_pasien}"`,
            reg.umur_tahun,
            reg.jenis_kelamin,
            reg.tanggal_rencana_operasi,
            reg.jam_rencana_operasi,
            `"${(reg.diagnosis || '').replace(/"/g, '""')}"`,
            `"${(reg.rencana_tindakan || '').replace(/"/g, '""')}"`,
            `"${reg.dokter_operator}"`,
            reg.jenis_operasi,
            `"${reg.pendaftaran_dari}"`,
            `"${reg.ruangan_rawat_inap}"`,
            reg.kelas,
            `"${reg.penjamin}"`
          ];
          csvRows.push(row.join(","));
        });

        const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Jadwal_Operasi_${startDate}_${endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        Swal.fire('Gagal', 'Gagal mengambil data untuk export', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Terjadi kesalahan saat export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
          Menampilkan <span style={{ color: '#0f172a', fontWeight: 700 }}>{registrations.length}</span> dari <span style={{ color: '#0f172a', fontWeight: 700 }}>{totalRecords}</span> data
        </div>
        
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(1)}
            className="button-secondary"
            style={{ padding: '6px 10px', fontSize: '0.8rem', opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
            title="Halaman Pertama"
          >
            «
          </button>
          
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="button-secondary"
            style={{ padding: '6px 10px', fontSize: '0.8rem', opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
          >
            ‹
          </button>

          <span style={{ fontSize: '0.85rem', padding: '0 10px', color: '#64748b' }}>Hal {page} dari {totalPages}</span>

          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="button-secondary"
            style={{ padding: '6px 10px', fontSize: '0.8rem', opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            ›
          </button>

          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(totalPages)}
            className="button-secondary"
            style={{ padding: '6px 10px', fontSize: '0.8rem', opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
            title="Halaman Terakhir"
          >
            »
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Filter Section */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', backgroundColor: 'white', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Rentang Tanggal</label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => { 
                const newStart = e.target.value;
                setStartDate(newStart); 
                if (endDate && newStart > endDate) {
                  setEndDate(newStart);
                }
                setPage(1); 
              }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', backgroundColor: '#f8fafc' }}
            />
            <span style={{ color: '#94a3b8' }}>sampai</span>
            <input 
              type="date" 
              value={endDate} 
              min={startDate}
              onChange={(e) => { 
                const newEnd = e.target.value;
                if (newEnd >= startDate) {
                  setEndDate(newEnd); 
                  setPage(1); 
                }
              }}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', backgroundColor: '#f8fafc' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Per Halaman</label>
          <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', backgroundColor: '#f8fafc' }}
          >
            <option value={5}>5 Baris</option>
            <option value={10}>10 Baris</option>
            <option value={20}>20 Baris</option>
            <option value={50}>50 Baris</option>
          </select>
        </div>

        <button 
          onClick={loadData}
          className="button-primary"
          style={{ padding: '10px 20px', fontSize: '0.85rem', height: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          Filter Data
        </button>

        <button 
          onClick={handleExport}
          disabled={exporting || registrations.length === 0}
          className="button-secondary"
          style={{ padding: '10px 20px', fontSize: '0.85rem', height: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4', opacity: (exporting || registrations.length === 0) ? 0.6 : 1, cursor: (exporting || registrations.length === 0) ? 'not-allowed' : 'pointer' }}
        >
          {exporting ? 'Mengunduh...' : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export Excel
            </>
          )}
        </button>
        
        {(startDate !== today || endDate !== today) && (
          <button 
            onClick={() => { setStartDate(today); setEndDate(today); setPage(1); }}
            style={{ padding: '10px 15px', fontSize: '0.85rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Reset
          </button>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'white', color: '#64748b' }}>
          <div className="animate-pulse">Memuat data pendaftaran...</div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', color: '#dc2626' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>{error}</p>
          <button onClick={loadData} style={{ marginTop: '1rem', color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Coba Lagi</button>
        </div>
      ) : registrations.length === 0 ? (
        <div className="card" style={{ padding: '5rem', textAlign: 'center', backgroundColor: 'white', color: '#94a3b8' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Belum Ada Jadwal</h3>
          <p>Belum ada pendaftaran operasi yang tercatat untuk kriteria filter ini.</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tgl Operasi</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pasien</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RM / Umur</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dokter</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit / Ruang</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jenis / Penjamin</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tindakan</th>
                    {userRole !== 'Farmasi' && <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>
                            {reg.created_at ? new Date(reg.created_at).toLocaleDateString('id-ID', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric',
                              timeZone: 'UTC'
                            }) : '-'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                            {reg.created_at ? new Date(reg.created_at).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              timeZone: 'UTC'
                            }) : ''}
                          </span>
                        </div>
                        {reg.user_created && (
                          <div style={{ 
                            fontSize: '0.65rem', 
                            color: '#94a3b8', 
                            marginTop: '6px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em',
                            fontWeight: 700
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            {reg.user_created}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                          {new Date(reg.tanggal_rencana_operasi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 800, marginTop: '2px' }}>
                          Pkl: {reg.jam_rencana_operasi} WIB
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.95rem' }}>{reg.nama_pasien}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{reg.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{reg.no_rekam_medis}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{reg.umur_tahun} Thn</div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{reg.dokter_operator}</div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{reg.pendaftaran_dari}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Bed: {reg.ruangan_rawat_inap} - {reg.kelas}</div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.7rem', 
                          fontWeight: 800,
                          backgroundColor: reg.jenis_operasi === 'CITO' ? '#fef2f2' : '#f0fdf4',
                          color: reg.jenis_operasi === 'CITO' ? '#dc2626' : '#166534',
                          marginBottom: '4px'
                        }}>
                          {reg.jenis_operasi}
                        </span>
                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{reg.penjamin}</div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reg.rencana_tindakan}>
                          {reg.rencana_tindakan}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>
                          Dx: {reg.diagnosis}
                        </div>
                      </td>
                      {userRole !== 'Farmasi' && (
                        <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button 
                              onClick={() => handleEdit(reg)}
                              style={{ 
                                padding: '6px', 
                                borderRadius: '6px', 
                                border: '1px solid #e2e8f0', 
                                backgroundColor: 'white', 
                                color: 'var(--accent)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              title="Edit"
                              className="action-btn"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(reg.id, reg.nama_pasien)}
                              style={{ 
                                padding: '6px', 
                                borderRadius: '6px', 
                                backgroundColor: '#fff1f2', 
                                color: '#e11d48', 
                                border: '1px solid #ffe4e6',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              title="Hapus"
                              className="action-btn delete"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {renderPagination()}
        </>
      )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedReg && (
        <AddRegistrationModal 
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedReg(null);
          }}
          onSuccess={() => {
            loadData();
          }}
          initialData={selectedReg}
        />
      )}

      <style jsx>{`
        .table-row-hover:hover {
          background-color: #f8fafc;
        }
        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .action-btn.delete:hover {
          background-color: #e11d48;
          color: white;
        }
        .action-btn:not(.delete):hover {
          background-color: var(--accent);
          color: white;
        }
      `}</style>
    </>
  );
}
