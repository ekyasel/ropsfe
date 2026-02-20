'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRegistrations, updateRegistration } from '../../actions/auth';
import * as XLSX from 'xlsx';

interface Registration {
  id: string;
  waktu_pendaftaran: string;
  pendaftaran_dari: string;
  ruangan_rawat_inap: string;
  jenis_operasi: string;
  klasifikasi_operasi?: string;
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
  dokter_anestesi?: string;
  penjamin: string;
  kelas: string;
  catatan?: string;
  user_created?: string;
  created_at?: string;
}

const MONTHS = [
  { value: 1,  label: 'Januari' },
  { value: 2,  label: 'Februari' },
  { value: 3,  label: 'Maret' },
  { value: 4,  label: 'April' },
  { value: 5,  label: 'Mei' },
  { value: 6,  label: 'Juni' },
  { value: 7,  label: 'Juli' },
  { value: 8,  label: 'Agustus' },
  { value: 9,  label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getLastDay(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

const YEAR_OPTIONS = Array.from({ length: 3 }, (_, i) => currentYear - i);

export default function RekapitulasiWidget() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [currentReg, setCurrentReg] = useState<Registration | null>(null);
  const [editFormData, setEditFormData] = useState({
    catatan: '',
    klasifikasi_operasi: '',
  });
  const [saving, setSaving] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Derived State (Filtered Data)
  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      reg.nama_pasien.toLowerCase().includes(lowerQuery) ||
      reg.no_rekam_medis.toLowerCase().includes(lowerQuery) ||
      reg.dokter_operator.toLowerCase().includes(lowerQuery) ||
      reg.diagnosis.toLowerCase().includes(lowerQuery) ||
      reg.rencana_tindakan.toLowerCase().includes(lowerQuery)
    );
  });

  // Handlers
  const handleEdit = (reg: Registration) => {
    setCurrentReg(reg);
    setEditFormData({
      catatan: reg.catatan || '',
      klasifikasi_operasi: reg.klasifikasi_operasi || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentReg(null);
    setEditFormData({ catatan: '', klasifikasi_operasi: '' });
  };

  const handleSave = async () => {
    if (!currentReg) return;
    setSaving(true);
    try {
      const res = await updateRegistration(currentReg.id, {
        catatan: editFormData.catatan,
        klasifikasi_operasi: editFormData.klasifikasi_operasi,
      });

      if (res.success) {
        // Refresh data
        loadData();
        handleCancel();
      } else {
        alert(res.error || 'Gagal menyimpan perubahan');
      }
    } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    if (filteredRegistrations.length === 0) return;

    const dataToExport = filteredRegistrations.map((reg, idx) => {
      const createdDate = reg.created_at ? new Date(reg.created_at) : null;
      const plannedDate = new Date(reg.tanggal_rencana_operasi);
      
      let waktuTunggu = '';
      if (createdDate) {
        const diff = Math.round((plannedDate.getTime() - createdDate.getTime()) / 86400000);
        waktuTunggu = String(diff);
      }

      return {
        'NO.': idx + 1,
        'WAKTU TUNGGU (HARI)': waktuTunggu,
        'TIMESTAMP': createdDate ? createdDate.toLocaleString('id-ID', { timeZone: 'UTC' }) : '',
        'PENDAFTARAN PASIEN DARI': reg.pendaftaran_dari,
        'RUANGAN RAWAT INAP': reg.ruangan_rawat_inap,
        'ELEKTIF / CITO': reg.jenis_operasi,
        'TANGGAL RENCANA OPERASI': `${plannedDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${reg.jam_rencana_operasi} WIB`,
        'NAMA LENGKAP PASIEN': reg.nama_pasien,
        'NO. REKAM MEDIS': reg.no_rekam_medis,
        'UMUR': `${reg.umur_tahun} Thn`,
        'JENIS KELAMIN': reg.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        'DIAGNOSIS': reg.diagnosis,
        'RENCANA TINDAKAN OPERASI': reg.rencana_tindakan,
        'DOKTER OPERATOR': reg.dokter_operator,
        'DOKTER ANESTESI': reg.dokter_anestesi || '',
        'PENJAMINAN': reg.penjamin,
        'KELAS': reg.kelas,
        'NOMOR TELP 1 (WA)': reg.nomor_telp_1 || '',
        'NOMOR TELP 2 (WA)': reg.nomor_telp_2 || '',
        'CATATAN': reg.catatan || '',
        'KLASIFIKASI OPERASI': reg.klasifikasi_operasi || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekapitulasi');

    // Auto-width columns
    const max_widths = dataToExport.reduce((acc, row) => {
      Object.keys(row).forEach((key, i) => {
        const value = row[key as keyof typeof row] ? String(row[key as keyof typeof row]) : '';
        acc[i] = Math.max(acc[i] || 0, key.length, value.length);
      });
      return acc;
    }, [] as number[]);

    worksheet['!cols'] = max_widths.map(w => ({ wch: w + 2 }));

    const monthName = MONTHS.find(m => m.value === selectedMonth)?.label || selectedMonth;
    XLSX.writeFile(workbook, `Rekapitulasi_Operasi_${monthName}_${selectedYear}.xlsx`);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const startDate = `${selectedYear}-${pad(selectedMonth)}-01`;
    const lastDay = getLastDay(selectedYear, selectedMonth);
    const endDate = `${selectedYear}-${pad(selectedMonth)}-${pad(lastDay)}`;

    try {
      const result = await getRegistrations({
        startDate,
        endDate,
        page: 1,
        pageSize: 10000,
      });

      if (result.success) {
        const rawData = result.data;
        const list = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
        const total = Array.isArray(rawData)
          ? rawData.length
          : (rawData?.pagination?.total ?? rawData?.total ?? list.length);
        setRegistrations(list);
        setTotalRecords(total);
      } else {
        setError(result.error || 'Gagal memuat data');
      }
    } catch {
      setError('Koneksi ke server API gagal');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.875rem',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          alignItems: 'flex-end',
        }}
      >
        {/* Tahun */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Tahun
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={selectStyle}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Bulan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Bulan
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={selectStyle}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Pencarian */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <label
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Pencarian
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Cari Pasien, RM, Dokter, Diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.875rem',
                backgroundColor: '#f8fafc',
                outline: 'none',
              }}
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <button
          onClick={loadData}
          className="button-primary"
          style={{
            padding: '10px 20px',
            fontSize: '0.85rem',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Tampilkan
        </button>

        <button
          onClick={handleExportExcel}
          disabled={!filteredRegistrations.length}
          style={{
            padding: '10px 20px',
            fontSize: '0.85rem',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#10b981', // Emerald 500
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: filteredRegistrations.length ? 'pointer' : 'not-allowed',
            opacity: filteredRegistrations.length ? 1 : 0.5,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Export Excel
        </button>

        {/* Summary badge */}
        {!loading && !error && (
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#64748b',
          }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{filteredRegistrations.length}</span>
            <span>pendaftaran ditemukan</span>
            {registrations.length !== filteredRegistrations.length && (
               <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(dari {registrations.length} total)</span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        flexWrap: 'wrap',
        padding: '0.6rem 1rem',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.78rem',
        color: '#475569',
      }}>
        <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Keterangan Waktu Tunggu:
        </span>
        {[
          { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: '≤ 1 hari', desc: 'Sangat mendesak' },
          { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: '2 – 3 hari', desc: 'Mendesak' },
          { color: '#166534', bg: '#f0fdf4', border: '#bbf7d0', label: '> 3 hari', desc: 'Terencana' },
        ].map(({ color, bg, border, label, desc }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '22px',
              borderRadius: '4px',
              backgroundColor: bg,
              border: `1px solid ${border}`,
              fontWeight: 800,
              fontSize: '0.75rem',
              color,
            }}>
              n
            </span>
            <span><strong style={{ color }}>{label}</strong> — {desc}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'white', color: '#64748b' }}>
          <div className="animate-pulse">Memuat data rekapitulasi...</div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', color: '#dc2626' }}>
          <p>{error}</p>
          <button
            onClick={loadData}
            style={{ marginTop: '1rem', color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="card" style={{ padding: '5rem', textAlign: 'center', backgroundColor: 'white', color: '#94a3b8' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Tidak ada data ditemukan
          </h3>
          <p>{searchQuery ? 'Coba kata kunci pencarian lain.' : `Tidak ada pendaftaran operasi untuk ${MONTHS[selectedMonth - 1].label} ${selectedYear}.`}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {[
                    'NO.',
                    'WAKTU TUNGGU (HARI)',
                    'TIMESTAMP',
                    'PENDAFTARAN PASIEN DARI',
                    'RUANGAN RAWAT INAP',
                    'ELEKTIF / CITO',
                    'TANGGAL RENCANA OPERASI',
                    'NAMA LENGKAP PASIEN',
                    'NO. REKAM MEDIS',
                    'UMUR',
                    'JENIS KELAMIN',
                    'DIAGNOSIS',
                    'RENCANA TINDAKAN OPERASI',
                    'DOKTER OPERATOR',
                    'DOKTER ANESTESI',
                    'PENJAMINAN',
                    'KELAS',
                    "NOMOR TELP 1 (WA)",
                    "NOMOR TELP 2 (WA)",
                    'CATATAN',
                    'KLASIFIKASI OPERASI',
                    'AKSI',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 16px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                        borderRight: '1px solid #f1f5f9',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg, idx) => (
                  <tr
                    key={reg.id}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                    className="rekap-row"
                  >
                    {/* NO. */}
                    <td style={{ padding: '13px 16px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>
                      {idx + 1}
                    </td>
                    {/* WAKTU TUNGGU (HARI) */}
                    <td style={{ padding: '13px 16px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', borderRight: '1px solid #f1f5f9',
                      color: (() => {
                        if (!reg.created_at) return '#94a3b8';
                        const diff = Math.round((new Date(reg.tanggal_rencana_operasi).getTime() - new Date(reg.created_at).getTime()) / 86400000);
                        return diff <= 1 ? '#dc2626' : diff <= 3 ? '#d97706' : '#166534';
                      })()
                    }}>
                      {reg.created_at
                        ? Math.round((new Date(reg.tanggal_rencana_operasi).getTime() - new Date(reg.created_at).getTime()) / 86400000)
                        : '—'}
                    </td>
                    {/* TIMESTAMP */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                        {reg.created_at
                          ? new Date(reg.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
                          : '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {reg.created_at
                          ? new Date(reg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
                          : ''}
                      </div>
                    </td>
                    {/* PENDAFTARAN DARI */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#475569', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.pendaftaran_dari}
                    </td>
                    {/* RUANGAN RAWAT INAP */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#475569', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.ruangan_rawat_inap}
                    </td>
                    {/* ELEKTIF / CITO */}
                    <td style={{ padding: '13px 16px', borderRight: '1px solid #f1f5f9' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: reg.jenis_operasi === 'CITO' ? '#fef2f2' : '#f0fdf4',
                        color: reg.jenis_operasi === 'CITO' ? '#dc2626' : '#166534',
                        whiteSpace: 'nowrap',
                      }}>
                        {reg.jenis_operasi}
                      </span>
                    </td>
                    {/* TANGGAL RENCANA OPERASI */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                        {new Date(reg.tanggal_rencana_operasi).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, marginTop: '2px' }}>
                        {reg.jam_rencana_operasi} WIB
                      </div>
                    </td>
                    {/* NAMA LENGKAP PASIEN */}
                    <td style={{ padding: '13px 16px', fontWeight: 700, color: 'var(--accent)', fontSize: '0.88rem', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.nama_pasien}
                    </td>
                    {/* NO. REKAM MEDIS */}
                    <td style={{ padding: '13px 16px', fontSize: '0.85rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.no_rekam_medis}
                    </td>
                    {/* UMUR */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#475569', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.umur_tahun} Thn
                    </td>
                    {/* JENIS KELAMIN */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </td>
                    {/* DIAGNOSIS */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#0f172a', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }} title={reg.diagnosis}>
                      {reg.diagnosis}
                    </td>
                    {/* RENCANA TINDAKAN */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#0f172a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }} title={reg.rencana_tindakan}>
                      {reg.rencana_tindakan}
                    </td>
                    {/* DOKTER OPERATOR */}
                    <td style={{ padding: '13px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.dokter_operator}
                    </td>
                    {/* DOKTER ANESTESI */}
                    <td style={{ padding: '13px 16px', fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.dokter_anestesi || <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    {/* PENJAMINAN */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.penjamin}
                    </td>
                    {/* KELAS */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#475569', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.kelas}
                    </td>
                    {/* NOMOR TELP 1 */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#334155', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.nomor_telp_1 || <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    {/* NOMOR TELP 2 */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#334155', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.nomor_telp_2 || <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    {/* CATATAN */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#475569', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }} title={reg.catatan}>
                      {reg.catatan || <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    {/* KLASIFIKASI OPERASI */}
                    <td style={{ padding: '13px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap', borderRight: '1px solid #f1f5f9' }}>
                      {reg.klasifikasi_operasi ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor:
                            reg.klasifikasi_operasi === 'KHUSUS' ? '#fef2f2' :
                            reg.klasifikasi_operasi === 'BESAR' ? '#fffbeb' :
                            reg.klasifikasi_operasi === 'SEDANG' ? '#eff6ff' :
                            '#f0fdf4', // KECIL
                          color:
                            reg.klasifikasi_operasi === 'KHUSUS' ? '#dc2626' :
                            reg.klasifikasi_operasi === 'BESAR' ? '#d97706' :
                            reg.klasifikasi_operasi === 'SEDANG' ? '#2563eb' :
                            '#166534', // KECIL
                        }}>
                          {reg.klasifikasi_operasi}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                    {/* AKSI */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(reg)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#3b82f6',
                          padding: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s',
                        }}
                        title="Edit Data"
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && currentReg && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
                Edit Catatan & Klasifikasi Operasi
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Klasifikasi Operasi */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Klasifikasi Operasi
                  </label>
                  <select
                    value={editFormData.klasifikasi_operasi}
                    onChange={(e) => setEditFormData({ ...editFormData, klasifikasi_operasi: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  >
                    <option value="">-- Pilih Klasifikasi --</option>
                    <option value="KECIL">KECIL</option>
                    <option value="SEDANG">SEDANG</option>
                    <option value="BESAR">BESAR</option>
                    <option value="KHUSUS">KHUSUS</option>
                  </select>
                </div>

                {/* Catatan */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Catatan
                  </label>
                  <textarea
                    value={editFormData.catatan}
                    onChange={(e) => setEditFormData({ ...editFormData, catatan: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                    placeholder="Tambahkan catatan..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#64748b',
                    backgroundColor: '#f1f5f9',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor: 'var(--accent)', // Using the accent color variable
                    border: 'none',
                    cursor: 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
      )}

      <style>{`
        .rekap-row:hover { background-color: #f8fafc; }
      `}</style>
    </div>
  );
}
