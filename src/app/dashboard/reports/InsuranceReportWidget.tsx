"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getInsuranceReport } from '../../actions/auth';
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

interface ReportItem {
  BULAN: string;
  [key: string]: string | number;
}

export default function InsuranceReportWidget() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [data, setData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInsuranceReport(year);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Gagal memuat data laporan penjamin");
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

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  const penjaminList = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(key => key !== 'BULAN');
  }, [data]);

  const chartData = useMemo(() => data.filter(item => item.BULAN !== 'TOTAL'), [data]);
  
  const colors = ['#6366f1', '#e11d48', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="card" style={{ padding: '4rem', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Memuat data laporan penjamin...</p>
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

  const handleExportExcel = () => {
    if (data.length === 0) return;
    
    // Prepare worksheet
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Rekap Penjamin");
    
    // Trigger download
    xlsx.writeFile(wb, `Rekap_Penjamin_${selectedYear}.xlsx`);
  };

  return (
    <div className="card" style={{ backgroundColor: 'white', overflow: 'hidden' }}>
      {/* Widget Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Rekapitulasi Penjamin Tahunan</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Statistik pasien berdasarkan jenis penjamin</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={handleExportExcel}
            className="button-secondary"
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #10b981'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Excel
          </button>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Tahun:</span>
          <select 
            value={selectedYear} 
            onChange={handleYearChange}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', outline: 'none' }}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
          {/* Table Section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>Detail Data</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '12px 8px', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Bulan</th>
                    {penjaminList.map(p => (
                      <th key={p} style={{ padding: '12px 8px', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => {
                    const isTotal = item.BULAN === 'TOTAL';
                    return (
                      <tr 
                        key={idx} 
                        style={{ 
                          borderBottom: idx === data.length - 1 ? 'none' : '1px solid #f1f5f9',
                          backgroundColor: isTotal ? '#f8fafc' : 'transparent',
                          fontWeight: isTotal ? 800 : 'normal'
                        }}
                      >
                        <td style={{ padding: '12px 0px', fontSize: '0.75rem', fontWeight: 700, color: isTotal ? '#0f172a' : '#1e293b' }}>{item.BULAN}</td>
                        {penjaminList.map(p => (
                          <td key={p} style={{ padding: '12px 8px', fontSize: '0.85rem', color: isTotal ? '#0f172a' : '#475569', textAlign: 'right' }}>{item[p]}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>Visualisasi Data</h3>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="BULAN" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  {penjaminList.map((p, index) => (
                    <Bar 
                      key={p} 
                      name={p} 
                      dataKey={p} 
                      fill={colors[index % colors.length]} 
                      radius={[4, 4, 0, 0]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
