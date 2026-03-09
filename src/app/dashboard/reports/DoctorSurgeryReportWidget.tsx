"use client";

import { useState, useEffect, useCallback } from 'react';
import { getDoctorSurgeryCount, getParameters } from '../../actions/auth';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import * as xlsx from 'xlsx';

interface TindakanData {
  jenis: string;
  count: number;
}

interface DoctorSurgeryData {
  dokter: string;
  year: number;
  tindakan: TindakanData[];
  total: number;
}

interface Parameter {
  id: string;
  param_type: string;
  param_name: string;
  is_active: boolean;
}

const COLORS = ['#6366f1', '#e11d48', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function DoctorSurgeryReportWidget() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState<Parameter[]>([]);
  const [data, setData] = useState<DoctorSurgeryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await getParameters();
      if (res.success) {
        const docList = res.data.filter((p: Parameter) => p.param_type === 'DOKTER' && p.is_active);
        setDoctors(docList);
        if (docList.length > 0 && !selectedDoctor) {
          setSelectedDoctor(docList[0].param_name);
        }
      }
    };
    fetchDoctors();
  }, [selectedDoctor]);

  const loadData = useCallback(async (year: string, doctor: string) => {
    if (!doctor) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getDoctorSurgeryCount(year, doctor);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Gagal memuat data laporan");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menghubungi server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      loadData(selectedYear, selectedDoctor);
    }
  }, [selectedYear, selectedDoctor, loadData]);

  const handleExportExcel = () => {
    if (!data || data.tindakan.length === 0) return;
    
    const exportData = data.tindakan.map(item => ({
      'Jenis Tindakan': item.jenis,
      'Jumlah': item.count
    }));
    
    // Add total row
    exportData.push({
      'Jenis Tindakan': 'TOTAL',
      'Jumlah': data.total
    });

    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Ringkasan Tindakan");
    xlsx.writeFile(wb, `Ringkasan_Tindakan_${selectedDoctor}_${selectedYear}.xlsx`);
  };

  if (!selectedDoctor && doctors.length === 0) {
    return null; // Don't show anything if no doctors exist
  }

  return (
    <div className="card" style={{ backgroundColor: 'white', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Ringkasan Tindakan Operasi</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Statistik jumlah tindakan per dokter spesialis</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleExportExcel}
            disabled={!data}
            className="button-secondary"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #10b981', opacity: !data ? 0.5 : 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Excel
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Dokter:</span>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}
            >
              <option value="">Pilih Dokter</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.param_name}>{doc.param_name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Tahun:</span>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem', minHeight: '400px', position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Memuat data tindakan...</p>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', textAlign: 'center' }}>
            <div style={{ color: '#ef4444', marginBottom: '1.5rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Gagal Memuat Laporan</h3>
            <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '2rem' }}>{error}</p>
            <button onClick={() => loadData(selectedYear, selectedDoctor)} className="button-primary">Coba Lagi</button>
          </div>
        ) : !data || data.tindakan.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Tidak Ada Data</h3>
            <p style={{ color: '#64748b' }}>Belum ada data tindakan operasi untuk {selectedDoctor} di tahun {selectedYear}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Summary Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', maxWidth: '300px' }}>
              <div style={{ padding: '1.25rem', backgroundColor: '#eef2ff', borderRadius: '12px', border: '1px solid #e0e7ff' }}>
                <div style={{ color: '#4338ca', marginBottom: '0.5rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', marginBottom: '0.25rem' }}>TOTAL TINDAKAN</p>
                <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e1b4b' }}>{data.total}</h4>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1.5fr', gap: '2rem' }}>
              {/* Table */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Detail Tindakan</h3>
                <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                      <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                        <th style={{ padding: '12px 0', textAlign: 'left', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Jenis Tindakan</th>
                        <th style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.tindakan.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{item.jenis}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, color: '#6366f1' }}>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Visualisasi Berdasarkan Tindakan</h3>
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data.tindakan} margin={{ left: 80, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis dataKey="jenis" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} width={80} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar name="Jumlah" dataKey="count" radius={[0, 4, 4, 0]}>
                        {data.tindakan.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
