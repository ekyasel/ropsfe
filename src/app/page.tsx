"use client";

import { useState, useEffect } from "react";
import LoginModal from "./LoginModal";

const FEATURES = [
  {
    num: "01",
    title: "Jadwal Operasi",
    description:
      "Pemantauan jadwal dan status operasi secara real-time untuk efisiensi kamar bedah.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="16" y2="14" /><line x1="8" y1="18" x2="16" y2="18" />
      </svg>
    ),
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
  },
  {
    num: "02",
    title: "Manajemen Personel",
    description:
      "Pengelolaan data staf, dokter spesialis, ruang rawat inap, poli, penjamin dan kelas.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    num: "03",
    title: "Laporan & Analitik",
    description:
      "Akses data laporan & statistik operasional yang mendalam.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><polyline points="3 20 21 20" />
      </svg>
    ),
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
];



export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [systemOnline, setSystemOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/test-supabase')
      .then(r => r.json())
      .then(json => setSystemOnline(json.success === true))
      .catch(() => setSystemOnline(false));
  }, []);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: '"Inter", sans-serif', position: "relative", overflowX: "hidden" }}>

      {/* ── AMBIENT BLOBS ── */}
      <div style={{ position: "fixed", top: "-15%", right: "-8%",  width: "650px", height: "650px", background: "radial-gradient(circle, rgba(8,145,178,.09) 0%, transparent 65%)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-12%", left: "-12%", width: "750px", height: "750px", background: "radial-gradient(circle, rgba(124,58,237,.06) 0%, transparent 65%)", zIndex: 0, pointerEvents: "none" }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(226,232,240,0.9)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
            <div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg,#0891b2,#0e7490)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(8,145,178,.28)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: '"Outfit",sans-serif', fontWeight: 800, fontSize: "1.15rem", color: "#0f172a", lineHeight: 1.1, letterSpacing: "-0.01em" }}>SORA</div>
              <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 500, letterSpacing: "0.01em" }}>Smart Operating Room Access</div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.82rem", color: systemOnline === null ? '#d97706' : (systemOnline ? "#16a34a" : "#dc2626"), display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: systemOnline === null ? '#f59e0b' : (systemOnline ? "#22c55e" : "#ef4444"), display: "inline-block", boxShadow: systemOnline === null ? "0 0 0 2px #fef3c7" : (systemOnline ? "0 0 0 2px #dcfce7" : "0 0 0 2px #fee2e2") }} />
                {systemOnline === null ? 'Memeriksa...' : (systemOnline ? 'Sistem Aktif' : 'Sistem Offline')}
              </span>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="button-primary"
              style={{ padding: "9px 22px", fontSize: "0.875rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.45rem" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Masuk Sistem
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "5.5rem 2rem 4.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,480px)", alignItems: "center", gap: "5rem" }} className="hero-grid">

          {/* Left */}
          <div className="animate-fade-in">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.45rem",
              background: "#ecfeff", color: "#0891b2",
              padding: "5px 13px", borderRadius: "20px",
              fontSize: "0.75rem", fontWeight: 700,
              marginBottom: "1.75rem", border: "1px solid #a5f3fc",
              letterSpacing: "0.05em", textTransform: "uppercase",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0891b2", animation: "pulse 2s infinite", display: "inline-block" }} />
              Platform Terintegrasi
            </div>

            <h1 style={{
              fontFamily: '"Outfit",sans-serif',
              fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
              fontWeight: 800, color: "#0f172a",
              lineHeight: 1.08, letterSpacing: "-0.04em",
              marginBottom: "1.4rem",
            }}>
              <span style={{ background: "linear-gradient(120deg,#0891b2 30%,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                SORA
              </span>
              <br />
              Smart Operating
              <br />
              Room Access
            </h1>

            <p style={{ fontSize: "1.1rem", color: "#475569", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: "480px" }}>
              Platform terintegrasi untuk penjadwalan, monitoring real-time, dan pelaporan data operasi RSUD Sidoarjo Barat secara akurat dan efisien.
            </p>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="button-primary"
                style={{ fontSize: "0.975rem", padding: "13px 34px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "0.55rem", boxShadow: "0 8px 22px rgba(8,145,178,.32)" }}
              >
                Masuk ke Sistem
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "#64748b", fontSize: "0.85rem" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Akses hanya untuk staf resmi
              </div>
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="hero-visual animate-fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              width: "100%", maxWidth: "460px",
              background: "linear-gradient(145deg,#f0f9ff 0%,#e0f2fe 45%,#f5f3ff 100%)",
              borderRadius: "24px", padding: "3rem 2.5rem",
              border: "1px solid #e0f2fe",
              boxShadow: "0 24px 64px rgba(8,145,178,.10), 0 4px 16px rgba(0,0,0,.04)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "-40px", right: "-40px",  width: "160px", height: "160px", borderRadius: "50%", background: "rgba(8,145,178,.08)" }} />
              <div style={{ position: "absolute", bottom: "-50px", left: "-30px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(124,58,237,.06)" }} />

              <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                {/* Medical SVG illustration */}
                <svg viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "300px" }}>
                  {/* OR Table */}
                  <rect x="75"  y="155" width="170" height="12" rx="6" fill="#cbd5e1"/>
                  <rect x="90"  y="135" width="140" height="22" rx="7" fill="#e2e8f0"/>
                  <rect x="82"  y="167" width="7" height="36" rx="3.5" fill="#cbd5e1"/>
                  <rect x="231" y="167" width="7" height="36" rx="3.5" fill="#cbd5e1"/>
                  {/* Patient outline */}
                  <ellipse cx="160" cy="122" rx="26" ry="12" fill="#94a3b8" opacity=".45"/>
                  <rect x="115" y="122" width="90" height="18" rx="6" fill="#94a3b8" opacity=".35"/>
                  {/* Overhead lamp arm */}
                  <line x1="160" y1="0" x2="160" y2="28" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round"/>
                  <ellipse cx="160" cy="34" rx="34" ry="13" fill="#f1f5f9"/>
                  <ellipse cx="160" cy="32" rx="24" ry="9" fill="#fef08a" opacity=".65"/>
                  {/* glow rays */}
                  <line x1="148" y1="47" x2="146" y2="60" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
                  <line x1="155" y1="48" x2="154" y2="63" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
                  <line x1="160" y1="48" x2="160" y2="64" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
                  <line x1="165" y1="48" x2="166" y2="63" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
                  <line x1="172" y1="47" x2="174" y2="60" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
                  {/* IV stand */}
                  <line x1="44" y1="48" x2="44" y2="190" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round"/>
                  <line x1="30" y1="190" x2="58" y2="190" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round"/>
                  <rect x="30" y="54" width="28" height="36" rx="8" fill="#bae6fd" opacity=".8"/>
                  <line x1="44" y1="90" x2="44" y2="132" stroke="#7dd3fc" strokeWidth="1.8" strokeDasharray="4 3"/>
                  {/* Monitor */}
                  <rect x="228" y="56" width="68" height="50" rx="8" fill="#1e293b"/>
                  <rect x="232" y="60" width="60" height="38" rx="5" fill="#0f172a"/>
                  <polyline points="236,79 243,79 247,68 251,90 255,68 259,90 263,79 292,79" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="255" y="106" width="14" height="16" rx="2" fill="#334155"/>
                  {/* Surgeon left */}
                  <circle cx="108" cy="96" r="11" fill="#64748b" opacity=".55"/>
                  <path d="M90 143 Q108 116 126 143" fill="#475569" opacity=".4"/>
                  {/* Surgeon right */}
                  <circle cx="212" cy="96" r="11" fill="#64748b" opacity=".55"/>
                  <path d="M194 143 Q212 116 230 143" fill="#475569" opacity=".4"/>
                  {/* Medical cross top-right */}
                  <rect x="290" y="20" width="14" height="4" rx="2" fill="#0891b2" opacity=".5"/>
                  <rect x="295" y="15" width="4" height="14" rx="2" fill="#0891b2" opacity=".5"/>
                  {/* Heartbeat line bottom */}
                  <polyline points="60,220 85,220 92,208 99,232 106,208 113,232 120,220 260,220" stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity=".3"/>
                </svg>


              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER BAND ── */}
      <div style={{ position: "relative", zIndex: 1, background: "white", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.75rem 2rem", display: "flex", alignItems: "center", gap: "2.5rem", overflowX: "auto" }}>
          {[
            { label: "Penjadwalan terpusat" },
            { label: "Monitoring real-time" },
            { label: "Manajemen staf medis" },
            { label: "Laporan & analitik" },
            { label: "Akses terenkripsi" },
          ].map((item, i) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "2.5rem", flexShrink: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#475569", fontWeight: 500, whiteSpace: "nowrap" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {item.label}
              </span>
              {i < 4 && <span style={{ width: "1px", height: "18px", background: "#e2e8f0", flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Heading */}
          <div style={{ maxWidth: "580px", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem" }}>
              Fitur Unggulan
            </div>
            <h2 style={{ fontFamily: '"Outfit",sans-serif', fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "1rem" }}>
              Semua yang Anda Butuhkan
            </h2>
            <p style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.7 }}>
              Dirancang khusus untuk kebutuhan operasional kamar bedah rumah sakit modern.
            </p>
          </div>

          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }} className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ padding: "2rem 1.75rem" }}>
                {/* Icon */}
                <div style={{ width: "50px", height: "50px", borderRadius: "13px", background: f.bg, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", border: `1px solid ${f.border}` }}>
                  {f.icon}
                </div>
                {/* Number badge */}
                <div style={{ fontSize: "0.68rem", fontWeight: 800, color: f.color, background: f.bg, display: "inline-flex", padding: "3px 9px", borderRadius: "20px", letterSpacing: "0.05em", marginBottom: "0.6rem", border: `1px solid ${f.border}` }}>
                  {f.num}
                </div>
                <h3 style={{ fontFamily: '"Outfit",sans-serif', fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.55rem" }}>{f.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.65 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0f172a", color: "white", padding: "3rem 2rem 2rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem", flexWrap: "wrap", paddingBottom: "2rem", borderBottom: "1px solid #1e293b", marginBottom: "1.75rem" }}>
            {/* Brand */}
            <div style={{ maxWidth: "280px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.85rem" }}>
                <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg,#0891b2,#0e7490)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: '"Outfit",sans-serif', fontWeight: 800, fontSize: "1.05rem", color: "white", letterSpacing: "-0.01em" }}>SORA</div>
                  <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 500 }}>Smart Operating Room Access</div>
                </div>
              </div>
              <p style={{ fontSize: "0.83rem", color: "#64748b", lineHeight: 1.65 }}>
                Sistem manajemen ruang operasi cerdas untuk efisiensi dan koordinasi pelayanan medis RSUD Sidoarjo Barat.
              </p>
            </div>

            {/* Kontak */}
            <div>
              <div style={{ fontSize: "0.72rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "0.9rem" }}>Kontak</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.83rem", color: "#94a3b8" }}>RSUD Sidoarjo Barat</span>
                <span style={{ fontSize: "0.83rem", color: "#94a3b8" }}>Jl. Bibis Bunder, Kamera'an, Tambak Kemerakan</span>
                <span style={{ fontSize: "0.83rem", color: "#94a3b8" }}>Kec. Krian, Kabupaten Sidoarjo, Jawa Timur 61262, Indonesia</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ color: "#334155", fontSize: "0.78rem" }}>© {new Date().getFullYear()} RSUD Sidoarjo Barat. All rights reserved.</p>
            <p style={{ color: "#334155", fontSize: "0.72rem", letterSpacing: "0.05em", fontWeight: 700, textTransform: "uppercase" }}>
              Developed by <span style={{ color: "#0891b2" }}>VXEngine</span>
            </p>
          </div>
        </div>
      </footer>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @media (max-width: 900px) {
          .hero-grid     { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .hero-visual   { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
