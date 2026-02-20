import ReportsClient from './ReportsClient';

export default function ReportsPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Laporan Operasi</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Statistik dan rekapitulasi data pendaftaran</p>
        </div>
      </header>

      <ReportsClient />
    </>
  );
}
