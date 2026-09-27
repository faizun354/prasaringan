import React, { useState, useEffect } from 'react';
import { PageView, Santri } from '../types';
import { QRCodeView } from './QRCodeView';

interface RegistrasiSantriViewProps {
  onNavigate: (page: PageView) => void;
  onSaveSantri: (santri: Santri) => void;
  onSelectSantriForCard: (santri: Santri) => void;
}

export const RegistrasiSantriView: React.FC<RegistrasiSantriViewProps> = ({
  onNavigate,
  onSaveSantri
}) => {
  const [nis, setNis] = useState('SNT-0429');
  const [nama, setNama] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [kelas, setKelas] = useState('');
  const [wali, setWali] = useState('');
  const [fotoUrl, setFotoUrl] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCeAtKjAUi5v36zW2Z4CeXYZ6hq6-QWZo2-FfEUprSXHa-OEYQcvs5EvTOYkElHFk58k7Lhx6hnNb7Qr7EfEyXJs0wJ0s-y_FOkQ4jMuYR3o87q1s93tjpR77Cxi7BUlp6uwmbzsIVFWcFdqng8BfgTNy7HvfNJ6Y-yyFtqnxCnjEn6yeTmY0rHs4dgdp4Wa55bh5WH5C7qR-yFhpUj15gvvnst8bnOUum2esVBMDXaLdRFuw7_7wsh'
  );
  const [qrToken, setQrToken] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-generate NIS on mount
  useEffect(() => {
    const num = Math.floor(Math.random() * 900) + 100;
    setNis(`SNT-${num}`);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const generateQrToken = () => {
    if (!nama || !nis) return;
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const year = new Date().getFullYear();
    const token = `#PK-${year}-${nis}-${rand}`;
    setQrToken(token);
    setQrGenerated(true);
    showToast('QR Token berhasil di-generate! Token sudah siap digunakan.');
  };

  const handleSaveAndBack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrGenerated || !qrToken) {
      showToast('Generate QR Code terlebih dahulu sebelum menyimpan!');
      return;
    }
    const newSantri: Santri = {
      id: `snt-${Date.now()}`,
      nis,
      nama,
      gender: 'Putra',
      angkatan: angkatan || '2026',
      kelas: kelas || '-',
      jenjang: 'Santri',
      kamar: '-',
      komplek: 'Pondok Pesantren',
      status: 'Aktif',
      fotoUrl,
      qrToken,
      namaWali: wali,
      totalHadir: 0,
      totalIzin: 0,
      totalSakit: 0,
      totalAlfa: 0,
      persentase: 100,
      statusDisiplin: 'Sangat Disiplin',
      lastScan: 'Baru Diterbitkan'
    };

    onSaveSantri(newSantri);
    showToast(`Santri ${nama} berhasil didaftarkan!`);
    setTimeout(() => onNavigate('data-santri'), 1000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Top Breadcrumb & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-space-lg">
        <div className="flex flex-col">
          <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <button
              type="button"
              onClick={() => onNavigate('data-santri')}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">school</span>
              <span>Data Santri</span>
            </button>
            <span className="text-outline text-xs">/</span>
            <span className="text-primary font-semibold">Tambah Santri Baru</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
            Registrasi Santri Baru & Penerbitan QR ID
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
            Tambahkan data santri baru ke database. Token QR identitas permanen akan digenerate otomatis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('data-santri')}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Batal / Kembali</span>
        </button>
      </div>

      <form onSubmit={handleSaveAndBack}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* LEFT: 2-Part Form (7 cols) */}
          <div className="xl:col-span-7 flex flex-col gap-space-lg">
            {/* Bagian 1/2: Data Identitas Diri */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">badge</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">Data Identitas Diri</h3>
                    <p className="text-xs text-on-surface-variant">Informasi identitas santri</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-xs font-semibold text-outline font-mono">
                  BAGIAN 1/2
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* NIS Pondok (Sistem) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">
                    NIS (Sistem) <span className="text-error">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      className="w-full h-11 px-3.5 bg-primary-fixed/30 text-primary font-mono font-bold text-sm rounded-xl border border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="material-symbols-outlined absolute right-3 text-secondary text-[20px]">
                      verified
                    </span>
                  </div>
                  <span className="text-[10px] text-outline">Digenerate otomatis secara berurutan</span>
                </div>

                {/* Nama Lengkap */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">
                    Nama Lengkap <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama lengkap santri..."
                    className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface text-sm rounded-xl border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>

                {/* Angkatan */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">
                    Angkatan <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={angkatan}
                    onChange={(e) => setAngkatan(e.target.value)}
                    placeholder="Cth: 2026 atau Angkatan 14"
                    className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2/2: Penempatan Akademik */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                    <span className="material-symbols-outlined text-[22px]">domain</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">Penempatan Akademik</h3>
                    <p className="text-xs text-on-surface-variant">Kelas dan wali santri</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-xs font-semibold text-outline font-mono">
                  BAGIAN 2/2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kelas */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">
                    Kelas <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Cth: 10-A, Ulya 1, dsb."
                    className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Wali */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">
                    Wali <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={wali}
                    onChange={(e) => setWali(e.target.value)}
                    placeholder="Cth: Ustadz Wildan / Nama Wali"
                    className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Photo, QR Code, Actions (5 cols) */}
          <div className="xl:col-span-5 flex flex-col gap-space-lg">
            {/* Pas Foto Santri */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">photo_camera</span>
                  <h3 className="text-sm font-bold text-on-surface">Pas Foto Santri</h3>
                </div>
                <span className="text-[11px] text-outline">Latar Biru / Merah</span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={fotoUrl}
                    alt="Pasfoto Preview"
                    className="w-20 h-24 rounded-xl object-cover shadow-md bg-surface-container-high ring-2 ring-primary/20"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-mono px-1 rounded">
                    3×4
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-xs font-bold text-on-surface">Unggah Foto Resmi</span>
                  <p className="text-[10px] text-on-surface-variant leading-tight">
                    Format JPG atau PNG (Maks. 2MB). Foto akan dicetak pada kartu identitas.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-semibold cursor-pointer hover:bg-primary-container transition-colors flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">file_upload</span>
                      <span>Pilih Berkas</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Generator Panel */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">qr_code_2</span>
                  <h3 className="text-sm font-bold text-on-surface">Generate QR Code Identitas</h3>
                </div>
                {qrGenerated && (
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    QR Siap
                  </span>
                )}
              </div>

              {/* QR Preview Area */}
              <div className={`w-full rounded-xl p-4 border flex flex-col gap-3 transition-all ${
                qrGenerated
                  ? 'bg-secondary-container/10 border-secondary/30'
                  : 'bg-surface-container-low border-outline-variant/40'
              }`}>
                <div className="flex items-center gap-4">
                  {/* QR Visual */}
                  <div className={`w-24 h-24 rounded-xl p-1 shadow-sm border flex items-center justify-center shrink-0 transition-all ${
                    qrGenerated ? 'bg-white border-secondary/30' : 'bg-surface-container border-outline-variant/30'
                  }`}>
                    {qrGenerated && qrToken ? (
                      <QRCodeView value={qrToken} size={88} className="bg-white" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-outline/50 gap-1">
                        <span className="material-symbols-outlined text-[28px]">qr_code</span>
                        <span className="text-[9px]">Belum Ada</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 gap-1">
                    <span className="text-sm font-bold text-on-surface truncate">
                      {nama || <span className="text-outline italic font-normal text-xs">Nama belum diisi</span>}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {kelas && <span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-semibold text-primary">Kelas: {kelas}</span>}
                      {angkatan && <span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] text-on-surface truncate">Angkatan: {angkatan}</span>}
                    </div>
                    {qrGenerated ? (
                      <>
                        <span className="text-[9px] text-outline uppercase tracking-wider mt-1">TOKEN QR AKTIF</span>
                        <span className="text-[10px] font-mono text-secondary font-bold break-all">
                          🔒 {qrToken}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-outline italic mt-1">Token QR belum digenerate</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-container flex items-center justify-between text-[10px] text-outline">
                  <span>Sistem Presensi Santri</span>
                  <span>ID Digital</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={generateQrToken}
                disabled={!nama || !nis}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  !nama || !nis
                    ? 'bg-surface-container text-outline cursor-not-allowed'
                    : qrGenerated
                      ? 'bg-secondary-container text-secondary hover:bg-secondary/20 cursor-pointer'
                      : 'bg-secondary text-on-secondary shadow-md hover:bg-secondary/80 cursor-pointer'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {qrGenerated ? 'refresh' : 'qr_code'}
                </span>
                <span>
                  {qrGenerated ? 'Generate Ulang QR Code' : 'Generate QR Code Identitas'}
                </span>
              </button>
              {!nama && (
                <p className="text-[10px] text-outline text-center -mt-1">
                  Isi Nama Santri terlebih dahulu untuk generate QR
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={!qrGenerated}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  qrGenerated
                    ? 'bg-primary hover:bg-primary-container text-on-primary shadow-md hover:shadow-lg cursor-pointer'
                    : 'bg-surface-container text-outline cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                <span>✓ Simpan & Tambahkan ke Data Santri</span>
              </button>
              {!qrGenerated && (
                <p className="text-[10px] text-outline text-center -mt-1">
                  Generate QR Code terlebih dahulu sebelum menyimpan
                </p>
              )}

              <button
                type="button"
                onClick={() => onNavigate('data-santri')}
                className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Batal / Kembali</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
            toastMessage.includes('terlebih dahulu')
              ? 'bg-error-container text-error border-error/20'
              : 'bg-inverse-surface text-inverse-on-surface border-inverse-on-surface/10'
          }`}>
            <span className={`material-symbols-outlined text-[20px] ${
              toastMessage.includes('terlebih dahulu') ? 'text-error' : 'text-secondary'
            }`}>
              {toastMessage.includes('terlebih dahulu') ? 'warning' : 'check_circle'}
            </span>
            <span className="text-xs font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
