"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getYearlyPenjaminReport } from '../../actions/auth';
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

interface ReportItem {
  BULAN: string;
  [key: string]: string | number;
}

export default function YearlyPenjaminReportWidget() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [data, setData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getYearlyPenjaminReport(year);
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

  // Extract penjamin names (all keys except "BULAN")
  const penjaminList = useMemo(() => {
    if (data.length === 0) return [];
    // Use the first row to determine column names, excluding "BULAN"
    return Object.keys(data[0]).filter(key => key !== 'BULAN');
  }, [data]);

  // Filter out the TOTAL row for the chart
  const chartData = useMemo(() => {
    return data.filter(item => item.BULAN !== 'TOTAL');
  }, [data]);

  // Colors for dynamic bars
  const colors = [
    '#6366f1', // Indigo
    '#e11d48', // Rose
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
  ];

  if (loading) {
    return (
      <div className="card" style={{ padding: '4rem', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Memuat data laporan penjamin...</p>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '3rem', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Gagal Memuat Laporan Penjamin</h3>
        <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '2rem' }}>{error}</p>
        <button 
          onClick={() => loadData(selectedYear)}
          className="button-primary"
          style={{ padding: '10px 24px' }}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filters Area */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Laporan Tahunan Penjamin</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Filter berdasarkan tahun rencana operasi</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>TAHUN:</label>
          <select 
            value={selectedYear} 
            onChange={handleYearChange}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0', 
              backgroundColor: '#f8fafc',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#1e293b',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Chart Visualization */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'white', minHeight: '450px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Grafik Perbandingan Penjamin</h3>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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

        {/* Data Table */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Tabel Rekapitulasi Tahunan</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '12px 8px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Bulan</th>
                  {penjaminList.map(p => (
                    <th key={p} style={{ padding: '12px 8px', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? data.map((item, idx) => {
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
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem', fontWeight: 700, color: isTotal ? '#0f172a' : '#1e293b' }}>
                        {item.BULAN}
                      </td>
                      {penjaminList.map(p => (
                        <td 
                          key={p} 
                          style={{ 
                            padding: '12px 8px', 
                            fontSize: '0.9rem', 
                            fontWeight: 600,
                            color: isTotal ? '#0f172a' : '#475569'
                          }}
                        >
                          {item[p]}
                        </td>
                      ))}
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={penjaminList.length + 1} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada data tersedia</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
