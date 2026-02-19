"use client";

import { useState, useEffect, useCallback } from 'react';
import { getParameters, createRegistration, updateRegistration } from '../../actions/auth';
import Swal from 'sweetalert2';

interface Parameter {
  id: string;
  param_type: string;
  param_name: string;
  is_active: boolean;
}

interface RegistrationData {
  id?: string;
  nama_pasien: string;
  no_rekam_medis: string;
  umur_tahun: string;
  jenis_kelamin: string;
  tanggal_rencana_operasi: string;
  jam_rencana_operasi: string;
  rencana_tindakan: string;
  dokter_operator: string;
  pendaftaran_dari: string;
  ruangan_rawat_inap: string;
  jenis_operasi: string;
  penjamin: string;
  kelas: string;
  diagnosis: string;
  nomor_telp_1: string;
  nomor_telp_2?: string;
}

interface AddRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: RegistrationData | null;
}

export default function AddRegistrationModal({ isOpen, onClose, onSuccess, initialData }: AddRegistrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingParams, setFetchingParams] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isEdit = !!initialData?.id;

  // Parameter states
  const [dokters, setDokters] = useState<Parameter[]>([]);
  const [rooms, setRooms] = useState<Parameter[]>([]);
  const [polis, setPolis] = useState<Parameter[]>([]);
  const [penjamins, setPenjamins] = useState<Parameter[]>([]);
  const [kelass, setKelass] = useState<Parameter[]>([]);

  const loadParameters = useCallback(async () => {
    setFetchingParams(true);
    const result = await getParameters();
    if (result.success) {
      const data: Parameter[] = result.data;
      setDokters(data.filter(p => p.param_type === 'DOKTER' && p.is_active));
      setRooms(data.filter(p => p.param_type === 'RUANG_RAWAT_INAP' && p.is_active));
      setPolis(data.filter(p => p.param_type === 'POLI' && p.is_active));
      setPenjamins(data.filter(p => p.param_type === 'PENJAMIN' && p.is_active));
      setKelass(data.filter(p => p.param_type === 'KELAS' && p.is_active));
    } else {
      console.error("Failed to fetch parameters:", result.error);
    }
    setFetchingParams(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        loadParameters();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, loadParameters]);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Set current time for waktu_pendaftaran if needed
    if (!data.waktu_pendaftaran && !isEdit) {
      data.waktu_pendaftaran = new Date().toISOString();
    }

    let result;
    if (isEdit && initialData?.id) {
      result = await updateRegistration(initialData.id, data);
    } else {
      result = await createRegistration(data);
    }

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      Swal.fire({
        title: 'Berhasil!',
        text: isEdit ? 'Jadwal operasi telah diperbarui.' : 'Jadwal operasi telah didaftarkan.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      onSuccess();
      onClose();
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      padding: '20px'
    }}>
      <div className="card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '1000px', 
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        backgroundColor: 'white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        borderRadius: '16px'
      }}>
        <div style={{ padding: '1.75rem 2.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {isEdit ? 'Perbarui Jadwal Operasi' : 'Pendaftaran Jadwal Operasi'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {isEdit ? 'Perbarui informasi pasien dan rencana tindakan medis' : 'Lengkapi data pasien dan rencana tindakan medis secara teliti'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
          <form id="registrationForm" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2.5rem' }}>
              
              {/* Patient Info Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', borderLeft: '3px solid var(--accent)', paddingLeft: '10px' }}>DATA PASIEN</h3>
                
                <div className="form-group">
                  <label>NAMA PASIEN</label>
                  <input name="nama_pasien" type="text" required placeholder="Nama Lengkap" defaultValue={initialData?.nama_pasien} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>NO. REKAM MEDIS</label>
                    <input name="no_rekam_medis" type="text" required placeholder="00-00-00" defaultValue={initialData?.no_rekam_medis} />
                  </div>
                  <div className="form-group">
                    <label>UMUR (TAHUN)</label>
                    <input name="umur_tahun" type="number" required placeholder="Thn" defaultValue={initialData?.umur_tahun} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>JENIS KELAMIN</label>
                    <select name="jenis_kelamin" required defaultValue={initialData?.jenis_kelamin}>
                      <option value="">Pilih</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>KELAS</label>
                    <select name="kelas" required disabled={fetchingParams} defaultValue={initialData?.kelas} key={fetchingParams ? 'loading-kelas' : 'loaded-kelas'}>
                      <option value="">Pilih</option>
                      {kelass.map(p => (
                        <option key={p.id} value={p.param_name}>{p.param_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>TELP 1</label>
                    <input name="nomor_telp_1" type="text" required placeholder="08..." defaultValue={initialData?.nomor_telp_1} />
                  </div>
                  <div className="form-group">
                    <label>TELP 2 (OPSIONAL)</label>
                    <input name="nomor_telp_2" type="text" placeholder="08..." defaultValue={initialData?.nomor_telp_2} />
                  </div>
                </div>
              </div>

              {/* Clinical Info Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', borderLeft: '3px solid var(--accent)', paddingLeft: '10px' }}>RENCANA MEDIS</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>TANGGAL RENCANA OPERASI</label>
                    <input 
                      name="tanggal_rencana_operasi" 
                      type="date" 
                      required 
                      defaultValue={initialData?.tanggal_rencana_operasi || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>JAM RENCANA OPERASI</label>
                    <input name="jam_rencana_operasi" type="time" required defaultValue={initialData?.jam_rencana_operasi} />
                  </div>
                </div>

                <div className="form-group">
                  <label>DOKTER OPERATOR</label>
                  <select name="dokter_operator" required disabled={fetchingParams} defaultValue={initialData?.dokter_operator} key={fetchingParams ? 'loading-dokter' : 'loaded-dokter'}>
                    <option value="">Pilih Dokter</option>
                    {dokters.map(p => (
                      <option key={p.id} value={p.param_name}>{p.param_name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>ASAL PENDAFTARAN</label>
                    <select name="pendaftaran_dari" required disabled={fetchingParams} defaultValue={initialData?.pendaftaran_dari} key={fetchingParams ? 'loading-poli' : 'loaded-poli'}>
                      <option value="">Pilih Poli</option>
                      {polis.map(p => (
                        <option key={p.id} value={p.param_name}>{p.param_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>PENJAMIN</label>
                    <select name="penjamin" required disabled={fetchingParams} defaultValue={initialData?.penjamin} key={fetchingParams ? 'loading-penjamin' : 'loaded-penjamin'}>
                      <option value="">Pilih Penjamin</option>
                      {penjamins.map(p => (
                        <option key={p.id} value={p.param_name}>{p.param_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>RUANGAN RAWAT INAP</label>
                    <select name="ruangan_rawat_inap" required disabled={fetchingParams} defaultValue={initialData?.ruangan_rawat_inap} key={fetchingParams ? 'loading-room' : 'loaded-room'}>
                      <option value="">Pilih Ruangan</option>
                      {rooms.map(p => (
                        <option key={p.id} value={p.param_name}>{p.param_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>JENIS OPERASI</label>
                    <select name="jenis_operasi" required defaultValue={initialData?.jenis_operasi}>
                      <option value="">Pilih Jenis</option>
                      <option value="ELEKTIF">ELEKTIF</option>
                      <option value="CITO">CITO</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions Section (Diagnosis) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', gridColumn: '1 / -1', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  DIAGNOSIS & RENCANA TINDAKAN
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>DIAGNOSIS</label>
                    <textarea name="diagnosis" required rows={3} placeholder="Masukan diagnosis awal pasien secara mendetail" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem' }} defaultValue={initialData?.diagnosis}></textarea>
                  </div>

                  <div className="form-group">
                    <label>RENCANA TINDAKAN</label>
                    <textarea name="rencana_tindakan" required rows={3} placeholder="Detail prosedur atau tindakan yang akan dilakukan" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem' }} defaultValue={initialData?.rencana_tindakan}></textarea>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {error && (
            <div style={{ color: '#dc2626', fontSize: '0.85rem', alignSelf: 'center', marginRight: 'auto' }}>
              {error}
            </div>
          )}
          <button type="button" onClick={onClose} className="button-secondary" style={{ padding: '10px 24px' }}>Batal</button>
          <button type="submit" form="registrationForm" className="button-primary" style={{ padding: '10px 32px' }} disabled={loading}>
            {loading ? (isEdit ? 'Memperbarui...' : 'Mendaftarkan...') : (isEdit ? 'Simpan Perubahan' : 'Daftarkan Jadwal')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
        }
        input, select {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
          color: #0f172a;
          font-size: 0.9rem;
          width: 100%;
        }
        input:focus, select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-soft);
        }
      `}</style>
    </div>
  );
}
