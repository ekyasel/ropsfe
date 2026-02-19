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
  dokter_anestesi?: string;
  jenis_operasi: string;
  diagnosis: string;
  pendaftaran_dari: string;
  ruangan_rawat_inap: string;
  umur_tahun: string;
  jenis_kelamin: string;
  nomor_telp_1: string;
  penjamin: string;
  kelas: string;
}

export default function SurgeryCalendar() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Registration | null>(null);

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

  const renderTimeline = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i); // 00:00 to 23:00
    const dayName = selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    
    // Filter registrations for selected date
    const dayEvents = registrations.filter(r => {
      const regDate = new Date(r.tanggal_rencana_operasi);
      return regDate.getDate() === selectedDate.getDate() && 
             regDate.getMonth() === selectedDate.getMonth() && 
             regDate.getFullYear() === selectedDate.getFullYear();
    });

    return (
      <div className="card" style={{ padding: '1.25rem', backgroundColor: 'white', height: '520px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Timeline Operasi</h3>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{dayName}</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
          {hours.map(hour => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const eventsAtHour = dayEvents.filter(e => e.jam_rencana_operasi.startsWith(timeStr.substring(0, 2)));

            return (
              <div key={hour} style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '40px', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', paddingTop: '8px' }}>
                  {timeStr}
                </div>
                <div style={{ 
                  flex: 1, 
                  borderTop: '1px solid #f1f5f9', 
                  paddingTop: '6px',
                  paddingBottom: eventsAtHour.length > 0 ? '8px' : '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  minHeight: eventsAtHour.length > 0 ? 'auto' : '28px'
                }}>
                  {eventsAtHour.length > 0 ? (
                    eventsAtHour.map(event => (
                      <div 
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          backgroundColor: event.jenis_operasi === 'CITO' ? '#fff1f2' : '#f0f9ff',
                          borderLeft: `4px solid ${event.jenis_operasi === 'CITO' ? '#e11d48' : '#0ea5e9'}`,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          cursor: 'pointer'
                        }}
                        className="event-card"
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: event.jenis_operasi === 'CITO' ? '#e11d48' : '#0ea5e9', textTransform: 'uppercase' }}>
                              {event.ruangan_rawat_inap || 'POLI'} • {event.jenis_operasi}
                            </span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>{event.jam_rencana_operasi.substring(0, 5)}</span>
                          </div>
                          
                          <div style={{ marginTop: '2px' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                              {event.nama_pasien} <span style={{ fontWeight: 400, color: '#64748b' }}>/{event.umur_tahun} TH</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginTop: '2px', lineHeight: '1.4' }}>
                              {event.rencana_tindakan}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>
                              dr. {event.dokter_operator}
                              <span style={{ display: 'block', fontWeight: 600, color: '#94a3b8', marginTop: '1px' }}>
                                Anestesi: {event.dokter_anestesi || '-'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>
                              {event.penjamin} <span style={{ color: 'var(--accent)' }}>{event.kelas}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>
            );
          })}
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
      { label: 'Diagnosis', value: selectedEvent.diagnosis },
      { label: 'Rencana Tindakan', value: selectedEvent.rencana_tindakan },
      { label: 'Jadwal', value: `${selectedEvent.tanggal_rencana_operasi} Pkl ${selectedEvent.jam_rencana_operasi.substring(0, 5)}` },
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
        zIndex: 1000,
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
      gap: '1.5rem',
      marginTop: '1.5rem'
    }}>
      {renderCalendar()}
      {renderTimeline()}
      {renderDetailModal()}

      <style jsx>{`
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
