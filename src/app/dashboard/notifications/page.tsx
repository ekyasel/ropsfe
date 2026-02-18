"use client";

export default function NotificationsPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Notifikasi</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Pemberitahuan aktivitas dan sistem</p>
        </div>
      </header>
      
      <div className="card" style={{ marginTop: '1.5rem', padding: '2rem', backgroundColor: 'white', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            backgroundColor: '#f8fafc', 
            color: '#94a3b8', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Halaman Notifikasi</h2>
          <p style={{ color: '#64748b', maxWidth: '400px' }}>Fitur pemberitahuan sedang disiapkan. Di sini Anda akan menerima pembaruan terkait pendaftaran baru atau perubahan jadwal operasi.</p>
        </div>
      </div>
    </>
  );
}
