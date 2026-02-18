import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: 'var(--background)'
    }}>
      <section className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '850px' }}>
        <div style={{ 
          display: 'inline-block', 
          backgroundColor: 'var(--accent-soft)', 
          color: 'var(--accent)', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '0.9rem', 
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          Sistem Manajemen Ruang Operasi - RSUD Sidoarjo Barat
        </div>
        <h1 style={{ 
          fontSize: '4rem', 
          marginBottom: '1.5rem',
          color: '#0f172a',
          fontWeight: 800,
          lineHeight: 1.1
        }}>
          Ruang Operasi
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#64748b', 
          marginBottom: '3rem',
          lineHeight: 1.6
        }}>
          Orkestrator digital komprehensif untuk manajemen ruang bedah RSUD Sidoarjo Barat. 
          Pantau personel, lacak kemajuan bedah, dan optimalkan efisiensi ruang operasi 
          dengan presisi.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '1.5rem',
          width: '100%'
        }}>
          <div className="card" style={{ padding: '2rem', textAlign: 'left', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '0.8rem', color: 'var(--accent)' }}>Personnel</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Manage surgeon rosters, nursing staff, and auxiliary medical personnel.
            </p>
          </div>
          <div className="card" style={{ padding: '2rem', textAlign: 'left', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '0.8rem', color: 'var(--accent)' }}>Operations</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Real-time scheduling and status monitoring of active surgical rooms.
            </p>
          </div>
          <div className="card" style={{ padding: '2rem', textAlign: 'left', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '0.8rem', color: 'var(--accent)' }}>Analytics</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Detailed reporting on room turnover times and institutional efficiency.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '4rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="button-primary" style={{ fontSize: '1.1rem', padding: '14px 40px' }}>
            Log In to System
          </Link>
        </div>
      </section>

      {/* Decorative medical elements */}
      <div style={{
        position: 'absolute',
        top: '5%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(8, 145, 178, 0.05) 0%, transparent 70%)',
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
        zIndex: -1
      }} />
    </main>
  );
}
