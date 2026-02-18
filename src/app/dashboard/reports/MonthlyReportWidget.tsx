"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMonthlyReport } from '../../actions/auth';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import * as xlsx from 'xlsx';

interface MonthlyData {
  bulan: string;
  elektif: number;
  cito: number;
}

export default function MonthlyReportWidget() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMonthlyReport(year);
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
    loadData(selectedYear);
  }, [selectedYear, loadData]);

  const totalRowFromApi = useMemo(() => data.find(item => item.bulan === 'TOTAL'), [data]);

  const totalElektif = useMemo(() => {
    if (totalRowFromApi) return totalRowFromApi.elektif;
    return data.reduce((sum, item) => sum + item.elektif, 0);
  }, [data, totalRowFromApi]);

  const totalCito = useMemo(() => {
    if (totalRowFromApi) return totalRowFromApi.cito;
    return data.reduce((sum, item) => sum + item.cito, 0);
  }, [data, totalRowFromApi]);

  const chartData = useMemo(() => data.filter(item => item.bulan !== 'TOTAL' && item.bulan !== ''), [data]);

  const handleExportExcel = () => {
    if (data.length === 0) return;
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Ringkasan Tahunan");
    xlsx.writeFile(wb, `Ringkasan_Tahunan_RS_${selectedYear}.xlsx`);
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '4rem', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Memuat ringkasan tahunan...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '3rem', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '1.5rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Gagal Memuat Laporan</h3>
        <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '2rem' }}>{error}</p>
        <button onClick={() => loadData(selectedYear)} className="button-primary">Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="card" style={{ backgroundColor: 'white', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Ringkasan Pasien Tahunan</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Statistik kumulatif pasien berdasarkan kategori elektif & cito</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={handleExportExcel}
            className="button-secondary"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #10b981' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Excel
          </button>
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

      <div style={{ padding: '1.5rem' }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <div style={{ color: '#6366f1', marginBottom: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Elektif</p>
            <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>{totalElektif}</h4>
          </div>
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <div style={{ color: '#e11d48', marginBottom: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total CITO</p>
            <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>{totalCito}</h4>
          </div>
          <div style={{ padding: '1.25rem', backgroundColor: '#eef2ff', borderRadius: '12px', border: '1px solid #e0e7ff' }}>
            <div style={{ color: '#4338ca', marginBottom: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', marginBottom: '0.25rem' }}>KUMULATIF TAHUNAN</p>
            <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e1b4b' }}>{totalElektif + totalCito}</h4>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', gap: '2rem' }}>
          {/* Table */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Detail Data</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '12px 0', textAlign: 'left', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Bulan</th>
                    <th style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Elektif</th>
                    <th style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>CITO</th>
                    <th style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => {
                    const isTotal = item.bulan === 'TOTAL' || item.bulan === '';
                    return (
                      <tr key={idx} style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isTotal ? '#f1f5f9' : 'transparent',
                        fontWeight: isTotal ? '800' : 'normal'
                      }}>
                        <td style={{ padding: '12px 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{item.bulan}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.9rem', color: '#64748b' }}>{item.elektif}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.9rem', color: '#64748b' }}>{item.cito}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{item.elektif + item.cito}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Visualisasi Data</h3>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar name="Elektif" dataKey="elektif" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar name="CITO" dataKey="cito" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
