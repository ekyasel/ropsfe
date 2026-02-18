"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPoliReport, getParameters } from '../../actions/auth';
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
  jumlah: number;
}

interface Parameter {
  param_type: string;
  param_name: string;
  is_active: boolean;
}

export default function PoliReportWidget() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedPoli, setSelectedPoli] = useState('');
  const [poliList, setPoliList] = useState<string[]>([]);
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoli = useCallback(async () => {
    try {
      const result = await getParameters();
      if (result.success && Array.isArray(result.data)) {
        const polis = result.data
          .filter((p: Parameter) => p.param_type === 'POLI' && p.is_active)
          .map((p: Parameter) => p.param_name);
        
        setPoliList(polis);
        
        if (polis.length > 0) {
          if (!selectedPoli) {
            setSelectedPoli(polis[0]);
          }
        } else {
          setLoading(false);
          setError("Tidak ada data Poli yang aktif di Master Data");
        }
      } else {
        setError(result.error || "Gagal memuat daftar poli");
        setLoading(false);
      }
    } catch (err) {
      console.error("Fetch Poli Error:", err);
      setError("Gagal menghubungi server untuk data Poli");
      setLoading(false);
    }
  }, [selectedPoli]);

  const loadData = useCallback(async (year: string, poli: string) => {
    if (!poli) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getPoliReport(year, poli);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Gagal memuat data laporan poli");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menghubungi server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoli();
  }, [fetchPoli]);

  useEffect(() => {
    if (selectedPoli) {
      loadData(selectedYear, selectedPoli);
    }
  }, [selectedYear, selectedPoli, loadData]);

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
    xlsx.utils.book_append_sheet(wb, ws, "Laporan Poli");
    xlsx.writeFile(wb, `Laporan_Poli_${selectedPoli}_${selectedYear}.xlsx`);
  };

  if (loading && poliList.length === 0) {
    return (
      <div className="card" style={{ padding: '4rem', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Memuat konfigurasi poli...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  return (
    <div className="card" style={{ backgroundColor: 'white', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Laporan Per Unit/Poli</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Rincian pasien berdasarkan elektif & cito per poli</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleExportExcel}
            className="button-secondary"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #10b981' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Excel
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Poli:</span>
            <select 
              value={selectedPoli} 
              onChange={(e) => setSelectedPoli(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', minWidth: '150px' }}
            >
              {poliList.map(p => <option key={p} value={p}>{p}</option>)}
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

      {loading ? (
        <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ width: '30px', height: '30px', border: '3px solid #f1f5f9', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>Memuat data {selectedPoli}...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
          <button onClick={() => loadData(selectedYear, selectedPoli)} className="button-primary">Coba Lagi</button>
        </div>
      ) : (
        <div style={{ padding: '1.5rem' }}>
          {/* Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
               <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Elektif</p>
               <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>{totalElektif}</h4>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
               <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>CITO</p>
               <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e11d48' }}>{totalCito}</h4>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#eef2ff', borderRadius: '12px', border: '1px solid #e0e7ff' }}>
               <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase' }}>Total</p>
               <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e1b4b' }}>{totalElektif + totalCito}</h4>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', gap: '2rem' }}>
            {/* Table */}
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Detail Data</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ padding: '10px 0', textAlign: 'left', fontSize: '0.7rem', color: '#64748b' }}>BULAN</th>
                      <th style={{ padding: '10px 0', textAlign: 'right', fontSize: '0.7rem', color: '#64748b' }}>ELEKTIF</th>
                      <th style={{ padding: '10px 0', textAlign: 'right', fontSize: '0.7rem', color: '#64748b' }}>CITO</th>
                      <th style={{ padding: '10px 0', textAlign: 'right', fontSize: '0.7rem', color: '#64748b' }}>JUMLAH</th>
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
                          <td style={{ padding: '10px 0', fontSize: '0.8rem', fontWeight: 600 }}>{item.bulan}</td>
                          <td style={{ padding: '10px 0', textAlign: 'right', fontSize: '0.85rem' }}>{item.elektif}</td>
                          <td style={{ padding: '10px 0', textAlign: 'right', fontSize: '0.85rem' }}>{item.cito}</td>
                          <td style={{ padding: '10px 0', textAlign: 'right', fontSize: '0.85rem' }}>{item.jumlah}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Visualisasi Data</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar name="Elektif" dataKey="elektif" fill="#6366f1" radius={[2, 2, 0, 0]} />
                    <Bar name="CITO" dataKey="cito" fill="#e11d48" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
    </div>
  );
}
