"use client";

import { useState, useEffect, useCallback } from 'react';
import { getRegistrations, getParameters } from '../actions/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Parameter {
  id: string;
  param_type: string;
  param_name: string;
  is_active: boolean;
}

interface Registration {
  id: string;
  nama_pasien: string;
  no_rekam_medis: string;
  tanggal_rencana_operasi: string;
  jam_rencana_operasi: string;
  rencana_tindakan: string;
  dokter_operator: string;
  dokter_anestesi?: string;
  jenis_operasi: string;
  diagnosis: string;
  pendaftaran_dari: string;
  ruangan_rawat_inap: string;
  umur_tahun: string;
  jenis_kelamin: string;
  nomor_telp_1: string;
  nomor_telp_2?: string;
  penjamin: string;
  kelas: string;
  ruang_operasi?: string;
}

export default function SurgeryCalendar() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [ruangOperasis, setRuangOperasis] = useState<Parameter[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Registration | null>(null);
  const [showFullscreenTimeline, setShowFullscreenTimeline] = useState(false);

  const loadMonthData = useCallback(async () => {
    // Fetch a broad range to cover the month view (e.g. 1st to 31st)
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    try {
      const result = await getRegistrations({
        startDate,
        endDate,
        page: 1,
        pageSize: 100 // Get all for the month
      });

      if (result.success) {
        setRegistrations(Array.isArray(result.data) ? result.data : (result.data.data || []));
      }
    } catch (error) {
      console.error("Failed to load calendar data:", error);
    }
  }, [currentDate]);

  const loadParams = useCallback(async () => {
    try {
      const result = await getParameters();
      if (result.success) {
        const data = result.data as Parameter[];
        setRuangOperasis(data.filter(p => p.param_type === 'RUANG_OPERASI' && p.is_active).sort((a, b) => a.param_name.localeCompare(b.param_name)));
      }
    } catch (error) {
      console.error("Failed to load parameters:", error);
    }
  }, []);

  useEffect(() => {
    loadParams();
  }, [loadParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMonthData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMonthData]);

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleEventClick = (event: Registration) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });

    const prevMonthDays = daysInMonth(year, month - 1);
    const calendarDays = [];

    // Padding for first day
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push({ day: prevMonthDays - i, currentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= days; i++) {
      calendarDays.push({ day: i, currentMonth: true });
    }

    // Chunking into weeks
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <div className="card" style={{ padding: '1.25rem', backgroundColor: 'white', height: '520px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{monthName} {year}</h2>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="button-secondary" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              ‹
            </button>
            <button 
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedDate(today);
              }}
              className="button-secondary" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Hari Ini
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="button-secondary" 
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              ›
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
            <div key={d} style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{d}</div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {weeks.map((week, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', flex: 1 }}>
              {week.map((date, j) => {
                const isSelected = date.currentMonth && selectedDate.getDate() === date.day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                const hasEvents = date.currentMonth && registrations.some(r => {
                  const regDate = new Date(r.tanggal_rencana_operasi);
                  return regDate.getDate() === date.day && regDate.getMonth() === month && regDate.getFullYear() === year;
                });

                return (
                  <div 
                    key={j}
                    onClick={() => date.currentMonth && setSelectedDate(new Date(year, month, date.day))}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      cursor: date.currentMonth ? 'pointer' : 'default',
                      backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                      color: isSelected ? 'white' : (date.currentMonth ? '#1e293b' : '#cbd5e1'),
                      fontWeight: isSelected ? 800 : (date.currentMonth ? 600 : 400),
                      fontSize: '0.85rem',
                      position: 'relative',
                      transition: 'all 0.2s',
                      minHeight: '40px'
                    }}
                    className={date.currentMonth ? "hover-scale" : ""}
                  >
                    {date.day}
                    {hasEvents && !isSelected && (
                      <div style={{ 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--accent)', 
                        position: 'absolute', 
                        bottom: '4px' 
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimelineContent = (isFullScreen = false) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = registrations.filter(r => {
      const regDate = new Date(r.tanggal_rencana_operasi);
      return regDate.getDate() === selectedDate.getDate() && 
             regDate.getMonth() === selectedDate.getMonth() && 
             regDate.getFullYear() === selectedDate.getFullYear();
    });

    const colList = [
      { id: 'unassigned', param_name: 'Belum Teralokasi' },
      ...ruangOperasis
    ] as Parameter[];

    const columnWidth = isFullScreen ? 220 : 180;

    return (
      <div style={{ flex: 1, overflowX: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', minWidth: `${colList.length * columnWidth + 60}px`, borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 5 }}>
          <div style={{ width: '60px' }}></div>
          {colList.map(col => (
            <div key={col.id} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', padding: '0 10px' }}>
              {col.param_name}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', minWidth: `${colList.length * columnWidth + 60}px` }}>
          {hours.map(hour => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            
            return (
              <div key={hour} style={{ display: 'flex', borderBottom: '1px solid #f8fafc', minHeight: isFullScreen ? '80px' : '80px' }}>
                <div style={{ width: '60px', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', paddingTop: '10px', textAlign: 'center', backgroundColor: '#fdfdfd', borderRight: '1px solid #f1f5f9' }}>
                  {timeStr}
                </div>
                {colList.map(col => {
                  const eventsInCell = dayEvents.filter(e => {
                    if (!e.jam_rencana_operasi) {
                      return hour === 0 && col.id === 'unassigned';
                    }
                    return e.jam_rencana_operasi.substring(0, 2) === hour.toString().padStart(2, '0') &&
                      (e.ruang_operasi === col.param_name || (!e.ruang_operasi && col.id === 'unassigned'));
                  });

                  return (
                    <div key={col.id} style={{ flex: 1, padding: '6px', borderRight: '1px solid #f8fafc', display: 'flex', flexDirection: 'column', gap: '0.4rem', backgroundColor: eventsInCell.length > 0 ? '#fff' : 'transparent' }}>
                      {eventsInCell.map(event => (
                        <div 
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          style={{
                            padding: isFullScreen ? '4px 8px' : '8px 10px',
                            borderRadius: '8px',
                            backgroundColor: event.jenis_operasi === 'CITO' ? '#fff1f2' : '#f0f9ff',
                            borderLeft: `4px solid ${event.jenis_operasi === 'CITO' ? '#e11d48' : '#0ea5e9'}`,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                          }}
                          className="event-card"
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: isFullScreen ? '1px' : '3px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: event.jenis_operasi === 'CITO' ? '#e11d48' : '#0ea5e9', backgroundColor: event.jenis_operasi === 'CITO' ? '#fee2e2' : '#e0f2fe', padding: '1px 4px', borderRadius: '4px' }}>
                                {event.jenis_operasi}
                              </span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>{event.jam_rencana_operasi ? event.jam_rencana_operasi.substring(0, 5) : '-'}</span>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: isFullScreen ? '0.9rem' : '0.85rem', color: '#0f172a' }}>
                              {event.nama_pasien} <span style={{ fontWeight: 400, color: '#64748b' }}>/{event.umur_tahun}th</span>
                            </div>
                            <div style={{ fontSize: isFullScreen ? '0.75rem' : '0.8rem', fontWeight: 600, color: '#475569', lineHeight: '1.4', marginTop: isFullScreen ? '0px' : '2px' }}>
                              {event.rencana_tindakan}
                            </div>
                            <div style={{ marginTop: isFullScreen ? '2px' : '6px', paddingTop: isFullScreen ? '2px' : '6px', borderTop: '1px dashed #e2e8f0' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                                dr. {event.dokter_operator}
                              </div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                                <span>Anestesi: {event.dokter_anestesi || '-'}</span>
                                <span style={{ color: 'var(--accent)' }}>{event.kelas}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    const dayName = selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    
    return (
      <div className="card" style={{ padding: '1.25rem', backgroundColor: 'white', height: '520px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Timeline Operasi</h3>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{dayName}</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleDownloadPDF}
              className="button-secondary"
              style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Download PDF"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </button>
            <button 
              onClick={() => setShowFullscreenTimeline(true)}
              className="button-secondary"
              style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Layar Penuh"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
            </button>
          </div>
        </div>

        {renderTimelineContent()}
      </div>
    );
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const dayName = selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const dayEvents = [...registrations]
      .filter(r => {
        const regDate = new Date(r.tanggal_rencana_operasi);
        return regDate.getDate() === selectedDate.getDate() && 
               regDate.getMonth() === selectedDate.getMonth() && 
               regDate.getFullYear() === selectedDate.getFullYear();
      })
      .sort((a, b) => (a.jam_rencana_operasi || '00:00').localeCompare(b.jam_rencana_operasi || '00:00'));

    // Header
    doc.setFontSize(18);
    doc.text('JADWAL RENCANA OPERASI', 148.5, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text(dayName, 148.5, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Unit Ruang Operasi RSSB - SORA v1.0', 148.5, 28, { align: 'center' });
    
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(15, 32, 282, 32);

    // Table
    const tableData = dayEvents.map((event, index) => [
      index + 1,
      `${event.jam_rencana_operasi ? event.jam_rencana_operasi.substring(0, 5) : '-'}${event.jenis_operasi === 'CITO' ? '\n(CITO)' : ''}`,
      `${event.nama_pasien}\nRM: ${event.no_rekam_medis}\n${event.umur_tahun}th / ${event.jenis_kelamin}`,
      `${event.ruang_operasi || 'BELUM TERALOKASI'}\n${event.kelas}`,
      `${event.rencana_tindakan}\nDx: ${event.diagnosis}`,
      `dr. ${event.dokter_operator}\nAnes: ${event.dokter_anestesi || '-'}`,
      event.penjamin
    ]);

    autoTable(doc, {
      startY: 38,
      head: [['No', 'Jam', 'Pasien', 'Ruang / Kelas', 'Tindakan & Diagnosa', 'Tim Medis', 'Penjamin']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], halign: 'center' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 20 },
        2: { cellWidth: 45 },
        3: { halign: 'center', cellWidth: 35 },
        5: { cellWidth: 40 },
        6: { halign: 'center', cellWidth: 25 }
      }
    });

    // Signature
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    const dateStr = `Sidoarjo, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(dateStr, 240, finalY, { align: 'center' });
    doc.text('Petugas Ruang Operasi', 240, finalY + 7, { align: 'center' });
    doc.line(210, finalY + 30, 270, finalY + 30);

    const fileName = `Jadwal_Operasi_${selectedDate.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const renderFullscreenTimelineModal = () => {
    if (!showFullscreenTimeline) return null;
    const dayName = selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f1f5f9' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em' }}>Timeline Operasi</h1>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>{dayName}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }} className="no-print">
            <button 
              onClick={handleDownloadPDF}
              className="button-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Download PDF
            </button>
            <button 
              onClick={() => setShowFullscreenTimeline(false)}
              className="no-print"
              style={{ backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: '#64748b' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {renderTimelineContent(true)}
        </div>
        
        <div style={{ marginTop: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }} className="no-print">
          Unit Ruang Operasi RSSB - SORA v1.0
        </div>
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!showDetailModal || !selectedEvent) return null;

    const data = [
      { label: 'No. Rekam Medis', value: selectedEvent.no_rekam_medis },
      { label: 'Nama Pasien', value: selectedEvent.nama_pasien },
      { label: 'Umur / JK', value: `${selectedEvent.umur_tahun} th / ${selectedEvent.jenis_kelamin}` },
      { label: 'Nomor Telp Pasien', value: selectedEvent.nomor_telp_2 ? `${selectedEvent.nomor_telp_1} / ${selectedEvent.nomor_telp_2}` : selectedEvent.nomor_telp_1 },
      { label: 'Diagnosis', value: selectedEvent.diagnosis },
      { label: 'Rencana Tindakan', value: selectedEvent.rencana_tindakan },
      { label: 'Jadwal', value: `${selectedEvent.tanggal_rencana_operasi} Pkl ${selectedEvent.jam_rencana_operasi ? selectedEvent.jam_rencana_operasi.substring(0, 5) : '-'}` },
      { label: 'Ruang Operasi', value: selectedEvent.ruang_operasi || '-' },
      { label: 'Jenis Operasi', value: selectedEvent.jenis_operasi, color: selectedEvent.jenis_operasi === 'CITO' ? '#e11d48' : '#0ea5e9' },
      { label: 'Dokter Operator', value: `dr. ${selectedEvent.dokter_operator}` },
      { label: 'Dokter Anestesi', value: selectedEvent.dokter_anestesi ? `dr. ${selectedEvent.dokter_anestesi}` : '-' },
      { label: 'Pendaftaran Pasien Dari', value: selectedEvent.pendaftaran_dari },
      { label: 'Ruangan Rawat Inap', value: selectedEvent.ruangan_rawat_inap },
      { label: 'Penjamin', value: `${selectedEvent.penjamin} (${selectedEvent.kelas})` },
    ];

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: '20px'
      }} onClick={() => setShowDetailModal(false)}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: selectedEvent.jenis_operasi === 'CITO' ? '#fff1f2' : '#f0f9ff'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Detail Jadwal Operasi</h2>
            <button 
              onClick={() => setShowDetailModal(false)}
              style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.map((item, id) => (
                <div key={id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: item.color || '#1e293b' }}>{item.value || '-'}</div>
                </div>
              ))}
            </div>
            
            <button 
              className="button-primary"
              style={{ width: '100%', marginTop: '32px' }}
              onClick={() => setShowDetailModal(false)}
            >
              Tutup Detail
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '340px 1fr', 
      gap: '1.5rem',
      marginTop: '1.5rem',
      alignItems: 'start'
    }} className="calendar-grid-container">
      {renderCalendar()}
      {renderTimeline()}
      {renderDetailModal()}
      {renderFullscreenTimelineModal()}

      <style jsx>{`
        @media (max-width: 1024px) {
          .calendar-grid-container {
            grid-template-columns: 1fr !important;
          }
        }
        .hover-scale {
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .hover-scale:hover {
          transform: scale(1.1);
        }
        .event-card {
          transition: all 0.2s ease;
        }
        .event-card:hover {
          transform: translateX(4px);
          filter: brightness(0.98);
        }
      `}</style>
    </div>
  );
}
