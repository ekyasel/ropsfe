"use client";

import { useState } from 'react';
import LoginModal from './LoginModal';

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
          Optimalkan efisiensi dan koordinasi tim medis dengan platform manajemen 
          kamar bedah modern. Solusi terintegrasi untuk penjadwalan, monitoring, 
          dan pelaporan data operasi secara akurat.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '1.5rem',
          width: '100%'
        }}>
          <div className="card" style={{ padding: '2rem', textAlign: 'left', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '0.8rem', color: 'var(--accent)' }}>Jadwal Operasi</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Pemantauan jadwal dan status operasi secara real-time untuk efisiensi kamar bedah.
            </p>
          </div>
          <div className="card" style={{ padding: '2rem', textAlign: 'left', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '0.8rem', color: 'var(--accent)' }}>Manajemen Personel</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Pengelolaan staf medis, dokter spesialis, perawat bedah, dan tim farmasi.
            </p>
          </div>
          <div className="card" style={{ padding: '2rem', textAlign: 'left', backgroundColor: 'white' }}>
            <h3 style={{ marginBottom: '0.8rem', color: 'var(--accent)' }}>Laporan & Analitik</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Akses data kinerja, turnover time, dan statistik operasional yang mendalam.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '4rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="button-primary" 
            style={{ fontSize: '1.1rem', padding: '14px 40px' }}
          >
            Log In to System
          </button>
        </div>
      </section>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

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
