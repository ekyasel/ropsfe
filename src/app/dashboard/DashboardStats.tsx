"use client";

import { useState, useEffect, useCallback } from 'react';
import { getRegistrations } from '../actions/auth';

interface Registration {
  id: string;
  nama_pasien: string;
  no_rekam_medis: string;
  tanggal_rencana_operasi: string;
  jam_rencana_operasi: string;
  rencana_tindakan: string;
  dokter_operator: string;
  jenis_operasi: string;
  diagnosis: string;
  pendaftaran_dari: string;
  ruangan_rawat_inap: string;
  umur_tahun: string;
  penjamin: string;
}

export default function DashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    cito: 0,
    elektif: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch registrations for today to get stats
    try {
      const result = await getRegistrations({
        startDate: today,
        endDate: today,
        pageSize: 100
      });

      if (result.success) {
        const data: Registration[] = Array.isArray(result.data) ? result.data : (result.data.data || []);
        
        const cito = data.filter(r => r.jenis_operasi === 'CITO').length;
        const elektif = data.filter(r => r.jenis_operasi === 'ELEKTIF').length;
        
        setStats({
          total: data.length,
          cito,
          elektif
        });
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    // Refresh every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const StatCard = ({ title, value, color, icon }: { title: string, value: number, color: string, icon: React.ReactNode }) => (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', backgroundColor: 'white' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '12px', 
        backgroundColor: `${color}10`, 
        color: color, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{title}</p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{loading ? '...' : value}</h3>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <StatCard 
          title="Total Operasi Hari Ini" 
          value={stats.total} 
          color="#6366f1" 
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
        />
        <StatCard 
          title="CITO" 
          value={stats.cito} 
          color="#e11d48" 
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
        />
        <StatCard 
          title="Elektif" 
          value={stats.elektif} 
          color="#0ea5e9" 
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
        />
      </div>
    </div>
  );
}
