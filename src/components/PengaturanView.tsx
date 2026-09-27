import React, { useState } from 'react';

export const PengaturanView: React.FC = () => {
  const [pesantrenName, setPesantrenName] = useState('Pesantren Modern Darussalam');
  const [tagline, setTagline] = useState('Pondok Presensi Smart Card System');
  const [leadName, setLeadName] = useState('Ustadz Wildan M.A.');
  const [leadTitle, setLeadTitle] = useState('Kepala Biro Kedisiplinan Santri');
  const [autoBeep, setAutoBeep] = useState(true);
  const [waBotEnabled, setWaBotEnabled] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-10">
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">settings</span>
          <span>Konfigurasi Sistem & Server</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Pengaturan PondokPresensi</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Kelola profil institusi pesantren, integrasi API WhatsApp wali santri, dan parameter scanner presensi.
        </p>
      </div>

      {savedAlert && (
        <div className="p-3 bg-secondary-fixed/50 text-on-secondary-fixed rounded-xl flex items-center gap-2 text-xs font-semibold">
          <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
          <span>Pengaturan sistem berhasil disimpan dan disinkronkan ke seluruh terminal scanner.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Card 1: Profil Pesantren */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">mosque</span>
            Profil Lembaga Pesantren
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Nama Resmi Pesantren</label>
            <input
              type="text"
              value={pesantrenName}
              onChange={(e) => setPesantrenName(e.target.value)}
              className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Tagline Kartu Tanda Santri</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Nama Penandatangan</label>
              <input
                type="text"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Jabatan</label>
              <input
                type="text"
                value={leadTitle}
                onChange={(e) => setLeadTitle(e.target.value)}
                className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Scanner & Notification Preferences */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">sensors</span>
            Integrasi & Perangkat Keras
          </h2>

          <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">Feedback Audio Beep Scanner</span>
              <span className="text-[11px] text-on-surface-variant">Bunyikan nada frekuensi 2400Hz saat QR tervalidasi</span>
            </div>
            <input
              type="checkbox"
              checked={autoBeep}
              onChange={(e) => setAutoBeep(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">Broadcast WhatsApp Wali Santri</span>
              <span className="text-[11px] text-on-surface-variant">Kirim ringkasan otomatis saat santri absen atau izin</span>
            </div>
            <input
              type="checkbox"
              checked={waBotEnabled}
              onChange={(e) => setWaBotEnabled(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">Sinkronisasi Cloud Real-Time</span>
              <span className="text-[11px] text-on-surface-variant">Replikasi instan ke server database asrama v2.4 LTS</span>
            </div>
            <input
              type="checkbox"
              checked={cloudSync}
              onChange={(e) => setCloudSync(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-md transition-all cursor-pointer"
            >
              Simpan Perubahan Pengaturan
            </button>
          </div>
        </div>

        {/* Card 3: Manajemen Penyimpanan & Reset */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">database</span>
              <span>Penyimpanan Lokal Sistem (Local Storage)</span>
            </div>
            <p className="text-sm font-bold text-on-surface mt-1">Kosongkan Data & Reset ke Kondisi Awal</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Menghapus semua data santri, jadwal kegiatan, dan riwayat presensi yang tersimpan di perangkat ini.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh data santri, kegiatan, dan presensi? Tindakan ini tidak dapat dibatalkan.')) {
                localStorage.removeItem('pondok_santri_list');
                localStorage.removeItem('pondok_activities');
                localStorage.removeItem('pondok_attendance_logs');
                window.location.reload();
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-error/40 text-error hover:bg-error-container/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>Reset Seluruh Data</span>
          </button>
        </div>
      </form>
    </div>
  );
};
