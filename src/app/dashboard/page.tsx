"use client";

import SurgeryCalendar from './SurgeryCalendar';
import DashboardStats from './DashboardStats';

export default function DashboardPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Beranda</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Ringkasan aktivitas jadwal operasi</p>
        </div>
      </header>
      
      <DashboardStats />

      <SurgeryCalendar />
    </>
  );
}