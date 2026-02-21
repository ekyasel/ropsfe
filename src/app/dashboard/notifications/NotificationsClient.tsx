"use client";

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

type LogEntry = {
  id: string;
  job_name: string;
  status: "success" | "failed" | "running" | string;
  summary: string;
  details: string;
  started_at: string;
  finished_at: string;
  timestamp: string;
};

type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function toLocalDateString(dateStr: string) {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function todayWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

type RoomStatus = {
  room: string;
  surgery_count: number;
  status: "sent" | "skipped" | "failed" | string;
  phone: string | null;
  failure_reason: string | null;
  last_attempt: string | null;
};

type WhatsAppStatusResponse = {
  target_date: string;
  total_surgeries: number;
  rooms: RoomStatus[];
  overall_log_status: string;
};

export default function NotificationsClient() {
  const [date, setDate]                   = useState(todayWIB());
  const [page, setPage]                   = useState(1);
  const [logs, setLogs]                   = useState<LogEntry[]>([]);
  const [pagination, setPagination]       = useState<Pagination | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  
  // Resend feature states
  const [resendDate, setResendDate]       = useState(todayWIB());
  const [resending, setResending]         = useState(false);

  // Room status states
  const [roomStatuses, setRoomStatuses]   = useState<RoomStatus[]>([]);
  const [fetchedTargetDate, setFetchedTargetDate] = useState<string | null>(null);
  const [loadingRooms, setLoadingRooms]   = useState(false);
  const [roomError, setRoomError]         = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cron-logs?page=${page}&pageSize=20&date=${date}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `Error ${res.status}`);
        setLogs([]);
        setPagination(null);
      } else {
        setLogs(json.data ?? []);
        setPagination(json.pagination ?? null);
      }
    } catch {
      setError("Gagal terhubung ke server.");
      setLogs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [date, page]);

  const fetchRoomStatus = useCallback(async (targetDate: string) => {
    setLoadingRooms(true);
    setRoomError(null);
    setFetchedTargetDate(null);
    try {
      const res = await fetch(`/api/cron/whatsapp-status?executionDate=${targetDate}`);
      const json: WhatsAppStatusResponse = await res.json();
      if (!res.ok) {
        setRoomStatuses([]);
        // Don't set error if not found for that date, just keep empty
        if (res.status !== 404) setRoomError((json as WhatsAppStatusResponse & { error?: string }).error || "Gagal memuat status ruangan.");
      } else {
        setRowStatuses(json.rooms ?? []);
        setFetchedTargetDate(json.target_date);
      }
    } catch {
      setRoomError("Gagal memuat status ruangan.");
      setRoomStatuses([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  const setRowStatuses = (rooms: RoomStatus[]) => setRoomStatuses(rooms);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchRoomStatus(resendDate); }, [resendDate, fetchRoomStatus]);

  const handleDateChange = (val: string) => { setDate(val); setPage(1); };

  const handleResend = async (roomName?: string) => {
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: roomName ? `Apakah akan resend notifikasi untuk ruangan ${roomName}?` : 'Apakah akan resend notifikasi untuk semua ruangan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Kirim',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0891b2',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    setResending(true);
    try {
      const res = await fetch('/api/whatsapp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDate: fetchedTargetDate ?? resendDate, // Use the surgery date from status API
          room: roomName ?? 'all'
        })
      });
      const json = await res.json();
      if (!res.ok) {
        Swal.fire({
          title: 'Gagal',
          text: json.error || 'Gagal mengirim ulang notifikasi.',
          icon: 'error'
        });
      } else {
        Swal.fire({
          title: 'Berhasil',
          text: roomName ? `Notifikasi untuk ruangan ${roomName} berhasil dikirim ulang.` : 'Notifikasi berhasil dikirim ulang ke antrean.',
          icon: 'success'
        });
        // Refresh statuses to show "running" or new status
        fetchRoomStatus(resendDate);
        // If the date being resent is the same as the filtered date, refresh logs
        if (resendDate === date) {
          fetchLogs();
        }
      }
    } catch {
      Swal.fire({
        title: 'Kesalahan',
        text: 'Terjadi kesalahan saat menghubungi server.',
        icon: 'error'
      });
    } finally {
      setResending(false);
    }
  };

  const sc = (s: string) =>
    s === "success" || s === "sent" ? { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" } :
    s === "failed" || s === "error"  ? { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" } :
    s === "skipped" ? { color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" } :
    s === "need_resend" ? { color: "#d97706", bg: "#fffbeb", border: "#fde68a" } :
                      { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };

  const label = (s: string) =>
    s === "success" || s === "sent" ? "Sukses" : 
    s === "failed" || s === "error" ? "Gagal" : 
    s === "skipped" ? "Lewati" :
    s === "need_resend" ? "Perlu Kirim" :
    s;

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>Notifikasi WhatsApp</h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Manajemen dan riwayat eksekusi job notifikasi</p>
        </div>
      </header>

      {/* Resend Section */}
      <section style={{ marginTop: "1.5rem", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Kirim Ulang Notifikasi
          </h2>
          {fetchedTargetDate && (
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600 }}>
              Notifikasi Untuk Operasi Tanggal : {fetchedTargetDate}
            </div>
          )}
        </div>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Pilih tanggal untuk memicu ulang pengiriman notifikasi WhatsApp harian secara manual.
        </p>
        
        <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Pilih Tanggal</label>
            <input
              type="date" value={resendDate}
              onChange={(e) => setResendDate(e.target.value)}
              style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 12px", fontSize: "0.875rem", color: "#0f172a", outline: "none", minWidth: "200px" }}
            />
          </div>
          <button 
            onClick={() => fetchRoomStatus(resendDate)}
            style={{ height: "40px", padding: "8px 15px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Refresh Status
          </button>
        </div>

        {/* Room Status Table */}
        <div style={{ marginTop: "1rem", border: "1px solid #f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", color: "#64748b" }}>
                <th style={{ padding: "10px 15px", fontWeight: 600 }}>Ruangan</th>
                <th style={{ padding: "10px 15px", fontWeight: 600 }}>Pasien</th>
                <th style={{ padding: "10px 15px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "10px 15px", fontWeight: 600 }}>No. WA</th>
                <th style={{ padding: "10px 15px", fontWeight: 600 }}>Keterangan</th>
                <th style={{ padding: "10px 15px", fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loadingRooms ? (
                <tr>
                  <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Memuat status ruangan...
                    </div>
                  </td>
                </tr>
              ) : roomStatuses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                    {roomError || "Tidak ada data status notifikasi untuk tanggal ini."}
                  </td>
                </tr>
              ) : (
                roomStatuses.map((room, idx) => {
                  const s = sc(room.status);
                  return (
                    <tr key={idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 15px", fontWeight: 700, color: "#0f172a" }}>{room.room}</td>
                      <td style={{ padding: "12px 15px", color: "#475569" }}>{room.surgery_count}</td>
                      <td style={{ padding: "12px 15px" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "2px 8px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          {label(room.status)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 15px", color: "#64748b", fontFamily: "monospace" }}>{room.phone || "-"}</td>
                      <td style={{ padding: "12px 15px", color: "#64748b", fontSize: "0.8rem", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {room.failure_reason || "-"}
                      </td>
                      <td style={{ padding: "8px 15px" }}>
                        {(room.status === 'failed' || room.status === 'skipped' || room.status === 'need_resend') && (
                          <button 
                            onClick={() => handleResend(room.room)}
                            disabled={resending}
                            style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px", background: "white", border: "1px solid #0891b2", color: "#0891b2", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                            Kirim Ulang
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ margin: "2.5rem 0 1rem", borderTop: "1px solid #e2e8f0" }}></div>

      {/* Filter Section */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>Riwayat Log Pengiriman Notifikasi Oleh System</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Filter Tanggal
        </label>
        <input
          type="date" value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "7px 12px", fontSize: "0.875rem", color: "#0f172a", outline: "none" }}
        />
        <button onClick={fetchLogs} className="button-primary"
          style={{ padding: "7px 18px", fontSize: "0.85rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Segarkan
        </button>
        {pagination && <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#94a3b8" }}>{pagination.total} log ditemukan</span>}
      </div>

      {/* Content */}
      <div style={{ marginTop: "1.25rem" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ display: "block", margin: "0 auto 0.75rem", animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Memuat data...
          </div>
        )}

        {error && !loading && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "1rem 1.25rem", color: "#dc2626", fontSize: "0.875rem" }}>
            ⚠ {error}
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div style={{ textAlign: "center", padding: "3.5rem", color: "#94a3b8" }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ display: "block", margin: "0 auto 1rem", opacity: 0.35 }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>Tidak ada log</p>
            <p style={{ fontSize: "0.82rem" }}>Tidak ditemukan log untuk tanggal ini.</p>
          </div>
        )}

        {!loading && logs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {logs.map((log) => {
              const s = sc(log.status);
              const isExp = expandedId === log.id;
              let parsed: Record<string, unknown> | null = null;
              try { parsed = JSON.parse(log.details); } catch {}

              return (
                <div key={log.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, flexShrink: 0, marginTop: "6px" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{log.job_name}</span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "2px 9px", borderRadius: "20px" }}>
                          {label(log.status)}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.84rem", color: "#475569", marginBottom: "0.5rem", lineHeight: 1.5 }}>{log.summary}</p>
                      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.75rem", color: "#94a3b8" }}>
                        <span>▶ {toLocalDateString(log.started_at)}</span>
                        <span>⏹ {toLocalDateString(log.finished_at)}</span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedId(isExp ? null : log.id)}
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}>
                      {isExp ? "Tutup" : "Detail"}
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isExp ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                  </div>

                  {isExp && (
                    <div style={{ marginTop: "0.85rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.85rem 1rem" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Detail</div>
                      <pre style={{ fontSize: "0.78rem", color: "#334155", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0, fontFamily: "monospace", lineHeight: 1.6 }}>
                        {parsed ? JSON.stringify(parsed, null, 2) : log.details}
                      </pre>
                      <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "#cbd5e1" }}>ID: {log.id}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "0.82rem", border: "1px solid #e2e8f0", background: "white", cursor: page <= 1 ? "not-allowed" : "pointer", color: page <= 1 ? "#cbd5e1" : "#475569" }}>
              ← Sebelumnya
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "0.82rem", border: p === page ? "1px solid #0891b2" : "1px solid #e2e8f0", background: p === page ? "#ecfeff" : "white", color: p === page ? "#0891b2" : "#475569", fontWeight: p === page ? 700 : 400, cursor: "pointer" }}>
                {p}
              </button>
            ))}
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
              style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "0.82rem", border: "1px solid #e2e8f0", background: "white", cursor: page >= pagination.totalPages ? "not-allowed" : "pointer", color: page >= pagination.totalPages ? "#cbd5e1" : "#475569" }}>
              Berikutnya →
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
