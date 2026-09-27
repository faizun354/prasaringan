import React, { useState } from 'react';
import { PageView, Santri } from '../types';

interface KartuSantriViewProps {
  santri: Santri;
  santriList: Santri[];
  onSelectSantri: (santri: Santri) => void;
  onNavigate: (page: PageView) => void;
}

export const KartuSantriView: React.FC<KartuSantriViewProps> = ({
  santri,
  santriList,
  onSelectSantri,
  onNavigate
}) => {
  const [printLayout, setPrintLayout] = useState<'single' | 'a4'>('single');
  const [paperType, setPaperType] = useState('pvc_heavy');
  const [cardSide, setCardSide] = useState<'both' | 'front' | 'back'>('both');
  const [cropMarks, setCropMarks] = useState(true);
  const [officialStamp, setOfficialStamp] = useState(true);
  const [showRegenAlert, setShowRegenAlert] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [currentToken, setCurrentToken] = useState(santri.qrToken || '#PK-9812A-SNT0001');

  const handleRegenerateToken = () => {
    const confirmAction = window.confirm(
      'Apakah Anda yakin ingin meregenerasi token QR santri ini? Token QR lama akan dinonaktifkan permanen demi keamanan.'
    );
    if (confirmAction) {
      const newToken = `#PK-${Date.now().toString(36).toUpperCase()}-${santri.nis}`;
      setCurrentToken(newToken);
      setShowRegenAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    setTimeout(() => {
      setIsDownloadingPdf(false);
      window.print();
    }, 900);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Breadcrumb and Page Actions Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md pb-space-lg">
        <div className="flex flex-col">
          <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate('data-santri')}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">school</span>
              <span>Data Santri</span>
            </button>
            <span className="text-outline text-xs">/</span>
            <div className="relative inline-block">
              <select
                value={santri.id}
                onChange={(e) => {
                  const found = santriList.find((s) => s.id === e.target.value);
                  if (found) onSelectSantri(found);
                }}
                className="bg-transparent text-on-surface font-semibold text-xs cursor-pointer outline-none hover:text-primary pr-4"
              >
                {santriList.map((s) => (
                  <option key={s.id} value={s.id}>
                    Detail Santri ({s.nama})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-outline text-xs">/</span>
            <span className="text-primary font-semibold">Kartu Identitas QR</span>
          </nav>

          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
              Kartu Identitas Presensi Santri (Siap Cetak)
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Ready to Print
            </span>
          </div>

          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Kartu fisik RFID/QR Code beresolusi tinggi (300 DPI) untuk akses presensi scanner optical pondok pesantren modern.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container hover:shadow-lg transition-all shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Cetak Kartu Sekarang</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high text-primary hover:bg-surface-container-highest transition-all font-semibold text-xs cursor-pointer shadow-sm"
          >
            {isDownloadingPdf ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">download</span>
            )}
            <span>Unduh PDF (300 DPI)</span>
          </button>

          <button
            type="button"
            onClick={handleRegenerateToken}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-all text-xs font-semibold cursor-pointer border border-outline-variant/30"
            title="Gunakan saat kartu hilang atau rusak"
          >
            <span className="material-symbols-outlined text-[16px]">cached</span>
            <span className="hidden sm:inline">Regenerasi Token</span>
          </button>
        </div>
      </div>

      {/* Regenerate Token Alert */}
      {showRegenAlert && (
        <div className="mb-space-lg p-space-md rounded-2xl bg-secondary-fixed/50 text-on-secondary-fixed flex items-center justify-between shadow-sm border border-secondary/20">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
            <div className="flex flex-col text-xs">
              <span className="font-bold text-sm">Kunci Enkripsi Token Berhasil Diperbarui</span>
              <span className="opacity-90">
                Token baru: <strong className="font-mono">{currentToken}</strong> telah diaktifkan ke sensor gerbang & asrama santri.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRegenAlert(false)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Main Showcase Grid (12-Col) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* LEFT & CENTER: Physical ID Card Showcase (8 Columns) */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          {/* Preview Visual Stage */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-xl shadow-md relative overflow-hidden border border-outline-variant/30">
            {/* Subtle Grid Canvas */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#53318b 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-lg relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-7 rounded-full bg-primary inline-block" />
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Preview Kartu Standar PVC (CR-80)</h2>
                  <p className="text-xs text-outline">Dimensi 85.60 mm × 53.98 mm • Standard ISO/IEC 7810</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full self-start border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-[16px]">aspect_ratio</span>
                <span className="text-[11px] text-on-surface-variant font-medium">Skala Cetak 100% Nyata</span>
              </div>
            </div>

            {/* Front & Back Cards Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg justify-items-center relative z-10">
              {/* CARD 1: TAMPAK DEPAN (FRONT) */}
              {(cardSide === 'both' || cardSide === 'front') && (
                <div className="flex flex-col items-center w-full max-w-[360px]">
                  <div className="flex items-center justify-between w-full px-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-outline font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">credit_card</span>
                      KARTU DEPAN (Tampak Muka)
                    </span>
                    <span className="text-[10px] text-secondary font-bold bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                      Depan
                    </span>
                  </div>

                  {/* PVC Box Front */}
                  <div
                    className={`w-full h-[225px] rounded-2xl bg-surface-container-lowest shadow-xl relative overflow-hidden flex flex-col justify-between p-4 transition-all duration-300 hover:shadow-2xl border ${
                      cropMarks ? 'border-primary/40 ring-1 ring-primary/20' : 'border-outline-variant/40'
                    }`}
                  >
                    <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary-fixed/40 blur-2xl pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary" />

                    {/* Header */}
                    <div className="flex items-center justify-between relative z-10 pt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">mosque</span>
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-[12px] text-primary font-bold tracking-tight">PESANTREN DARUSSALAM</span>
                          <span className="text-[8.5px] text-on-surface-variant tracking-wider uppercase">
                            Pondok Presensi Smart Card
                          </span>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-primary-container">contactless</span>
                      </div>
                    </div>

                    {/* Student Info & Photo */}
                    <div className="flex items-center gap-3.5 my-auto relative z-10">
                      <div className="relative shrink-0">
                        <img
                          src={santri.fotoUrl}
                          alt={santri.nama}
                          className="w-[78px] h-[92px] rounded-xl object-cover shadow-md bg-surface-container ring-1 ring-black/10"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary rounded-full p-0.5 shadow-sm">
                          <span className="material-symbols-outlined text-[10px] block">verified</span>
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[9px] text-outline font-semibold tracking-wider">NOMOR INDUK SANTRI</span>
                        <div className="text-[15px] font-bold text-on-surface truncate leading-snug">
                          {santri.nama}
                        </div>
                        <span className="text-[11px] font-mono text-primary font-bold mb-1">
                          NIS: {santri.nis}
                        </span>

                        <div className="space-y-0.5 text-on-surface-variant text-[9.5px]">
                          <div className="flex justify-between">
                            <span className="text-outline">Kelas:</span>
                            <span className="font-semibold text-on-surface truncate">{santri.kelas}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-outline">Asrama:</span>
                            <span className="font-semibold text-on-surface truncate">{santri.kamar}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-outline">NIK:</span>
                            <span className="font-mono text-on-surface truncate">{santri.nik || '320129038290001'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex items-center justify-between relative z-10 bg-surface-container-low/70 -mx-4 -mb-4 px-4 py-1.5 border-t border-surface-container/60">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <span className="text-[9px] font-bold tracking-wider text-secondary uppercase">
                          SANTRI AKTIF
                        </span>
                      </div>
                      <span className="text-[9px] text-outline">
                        Angkatan <strong className="text-on-surface">{santri.angkatan} - 2026</strong>
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-outline mt-2 text-center">Tampak depan memuat pasfoto & identitas resmi santri</p>
                </div>
              )}

              {/* CARD 2: TAMPAK BELAKANG (BACK) */}
              {(cardSide === 'both' || cardSide === 'back') && (
                <div className="flex flex-col items-center w-full max-w-[360px]">
                  <div className="flex items-center justify-between w-full px-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-outline font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">qr_code_2</span>
                      KARTU BELAKANG (QR & Enkripsi)
                    </span>
                    <span className="text-[10px] text-primary font-bold bg-primary-fixed px-2 py-0.5 rounded-full">
                      Belakang
                    </span>
                  </div>

                  {/* PVC Box Back */}
                  <div
                    className={`w-full h-[225px] rounded-2xl bg-surface-container-lowest shadow-xl relative overflow-hidden flex flex-col justify-between p-3.5 transition-all duration-300 hover:shadow-2xl border ${
                      cropMarks ? 'border-primary/40 ring-1 ring-primary/20' : 'border-outline-variant/40'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1 pb-1">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-[14px]">security</span>
                        <span className="text-[8.5px] font-bold text-primary uppercase tracking-wider">
                          Optical Presensi Gate
                        </span>
                      </div>
                      <span className="text-[8.5px] font-mono font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                        {currentToken}
                      </span>
                    </div>

                    {/* Middle: Sharp SVG QR + Disclaimers */}
                    <div className="flex items-center gap-3 my-auto">
                      <div className="relative shrink-0 p-1.5 bg-white rounded-xl shadow-md border border-outline-variant/30 flex items-center justify-center">
                        <svg className="w-22 h-22 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
                          <rect x="6" y="6" width="28" height="28" rx="4" fill="currentColor" />
                          <rect x="11" y="11" width="18" height="18" rx="2" fill="#ffffff" />
                          <rect x="15" y="15" width="10" height="10" rx="1" fill="currentColor" />
                          <rect x="66" y="6" width="28" height="28" rx="4" fill="currentColor" />
                          <rect x="71" y="11" width="18" height="18" rx="2" fill="#ffffff" />
                          <rect x="75" y="15" width="10" height="10" rx="1" fill="currentColor" />
                          <rect x="6" y="66" width="28" height="28" rx="4" fill="currentColor" />
                          <rect x="11" y="71" width="18" height="18" rx="2" fill="#ffffff" />
                          <rect x="15" y="75" width="10" height="10" rx="1" fill="currentColor" />
                          <rect x="38" y="8" width="5" height="5" />
                          <rect x="47" y="8" width="5" height="5" />
                          <rect x="56" y="12" width="5" height="5" />
                          <rect x="38" y="18" width="8" height="5" />
                          <rect x="51" y="24" width="7" height="6" />
                          <rect x="8" y="39" width="6" height="5" />
                          <rect x="19" y="46" width="5" height="6" />
                          <rect x="8" y="55" width="8" height="5" />
                          <rect x="24" y="40" width="6" height="5" />
                          <rect x="68" y="38" width="6" height="5" />
                          <rect x="78" y="45" width="16" height="4" />
                          <rect x="85" y="54" width="9" height="5" />
                          <rect x="68" y="52" width="5" height="7" />
                          <rect x="38" y="68" width="6" height="6" />
                          <rect x="48" y="75" width="8" height="6" />
                          <rect x="39" y="86" width="16" height="6" />
                          <rect x="60" y="84" width="7" height="8" />
                          <rect x="72" y="69" width="10" height="6" />
                          <rect x="86" y="78" width="8" height="8" />
                          <circle cx="50" cy="50" r="14" fill="#ffffff" />
                          <circle cx="50" cy="50" r="12" fill="#53318b" />
                          <path d="M50 42L44 48H47V56H53V48H56L50 42Z" fill="#ffffff" />
                          <circle cx="50" cy="40" r="1.5" fill="#fbbc0e" />
                        </svg>
                      </div>

                      <div className="flex flex-col text-[8.5px] text-on-surface-variant leading-tight">
                        <p className="font-semibold text-on-surface mb-1">
                          Kartu ini adalah identitas resmi presensi dan izin santri{' '}
                          <strong className="text-primary">Pondok Pesantren Modern Darussalam</strong>.
                        </p>
                        <p className="text-outline leading-snug">
                          Dekatkan pada kamera optical scanner saat: Sholat Berjamaah, Kegiatan Belajar Madrasah, dan Absensi Gerbang Perizinan (Kunjungan Wali).
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-[7.5px] text-error font-bold">
                          <span className="material-symbols-outlined text-[10px]">report</span>
                          <span>Kehilangan kartu wajib melapor ke Bagian Pengasuhan.</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Barcode & Official Stamp */}
                    <div className="flex items-end justify-between pt-1 -mx-3.5 -mb-3.5 px-3.5 py-1 bg-surface-container-low/60 border-t border-surface-container/60">
                      <div className="flex flex-col">
                        <div className="flex gap-[1.5px] items-end h-4 w-24 opacity-80">
                          <span className="w-[2px] h-4 bg-on-surface" />
                          <span className="w-[1px] h-4 bg-on-surface" />
                          <span className="w-[3px] h-3.5 bg-on-surface" />
                          <span className="w-[1px] h-4 bg-on-surface" />
                          <span className="w-[2px] h-4 bg-on-surface" />
                          <span className="w-[4px] h-4 bg-on-surface" />
                          <span className="w-[1px] h-3 bg-on-surface" />
                          <span className="w-[2px] h-4 bg-on-surface" />
                          <span className="w-[3px] h-4 bg-on-surface" />
                          <span className="w-[1px] h-4 bg-on-surface" />
                          <span className="w-[2px] h-3 bg-on-surface" />
                          <span className="w-[3px] h-4 bg-on-surface" />
                        </div>
                        <span className="font-mono text-[7px] text-outline">{santri.nis}-9812A</span>
                      </div>

                      {officialStamp && (
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-7 h-7 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary/70 absolute inset-0 -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 40 40">
                              <circle cx="20" cy="20" r="18" strokeDasharray="2 1" strokeWidth="1" />
                              <circle cx="20" cy="20" r="14" strokeWidth="1.5" />
                              <text x="20" y="16" fontSize="4" fontWeight="bold" textAnchor="middle" fill="currentColor">
                                DARUSSALAM
                              </text>
                              <text x="20" y="27" fontSize="3" textAnchor="middle" fill="currentColor">
                                TERVALIDASI
                              </text>
                            </svg>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[7px] text-outline">Direktur Pengasuhan,</span>
                            <span className="text-[8px] font-bold text-on-surface leading-none">Ust. Wildan M.A.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-outline mt-2 text-center">Kode QR dioptimalkan untuk scanner berkecepatan 0.2 detik</p>
                </div>
              )}
            </div>

            {/* Quick Switch Viewers */}
            <div className="mt-space-lg pt-3 bg-surface-container-low/60 -mx-space-md sm:-mx-space-xl -mb-space-md sm:-mb-space-xl p-space-md flex flex-wrap items-center justify-between gap-2 border-t border-surface-container/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">layers</span>
                <span className="text-xs font-semibold text-on-surface">Ukuran Potong Presisi:</span>
                <span className="text-xs text-outline">85.6mm × 53.98mm (Corner Radius: 3.18mm)</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-surface-container-lowest rounded-lg text-[10px] text-primary font-bold shadow-sm border border-outline-variant/30">
                  Resolusi: 300 DPI (1012 × 638 px)
                </span>
                <span className="px-2.5 py-1 bg-surface-container-lowest rounded-lg text-[10px] text-secondary font-bold shadow-sm border border-outline-variant/30">
                  Color Space: CMYK Compatible
                </span>
              </div>
            </div>
          </div>

          {/* Audit Log Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">history</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Log Aktivitas & Audit Keamanan Token</h3>
                  <p className="text-xs text-outline">
                    Verifikasi riwayat pemindaian terakhir santri pada optical scanner gerbang & masjid
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold font-mono self-start sm:self-auto">
                Token Aktif: {currentToken}
              </span>
            </div>

            {/* 3 Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-outline uppercase font-semibold">Terakhir Dipindai</span>
                  <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                </div>
                <div className="my-1.5">
                  <div className="font-bold text-sm text-on-surface">Kajian Subuh</div>
                  <div className="text-xs text-on-surface-variant font-medium">Hari ini, 05:08:14 WIB</div>
                </div>
                <span className="text-[10px] text-outline">Petugas: Ustadz Abdul (Gerbang 2)</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-outline uppercase font-semibold">Total Pemindaian</span>
                  <span className="material-symbols-outlined text-secondary text-[18px]">qr_code_scanner</span>
                </div>
                <div className="my-1.5">
                  <div className="font-bold text-sm text-on-surface">842 Kali</div>
                  <div className="text-xs text-secondary font-bold">100% Validasi Sukses</div>
                </div>
                <span className="text-[10px] text-outline">Terhitung sejak 15 Juli 2023</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-outline uppercase font-semibold">Status Integritas</span>
                  <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
                </div>
                <div className="my-1.5">
                  <div className="font-bold text-sm text-secondary">Tervalidasi Aman</div>
                  <div className="text-xs text-on-surface-variant">0 Indikasi Duplikasi</div>
                </div>
                <span className="text-[10px] text-outline">Hash SHA-256 Protected</span>
              </div>
            </div>

            {/* Audit Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold">
                    <th className="py-2.5 px-3 rounded-l-lg">Waktu & Tanggal</th>
                    <th className="py-2.5 px-3">Kegiatan / Agenda</th>
                    <th className="py-2.5 px-3">Titik Optical Reader</th>
                    <th className="py-2.5 px-3">Petugas Pengawas</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Hasil Scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/60">
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-3 font-mono">27 Okt 2026 • 05:08 WIB</td>
                    <td className="py-2.5 px-3 font-bold text-primary">Kajian Subuh & Tahfidz</td>
                    <td className="py-2.5 px-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      Kamera Gerbang Masjid Utama
                    </td>
                    <td className="py-2.5 px-3 text-on-surface-variant">Ust. Abdul Ghaffar</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                        Hadir Tepat Waktu
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-3 font-mono">26 Okt 2026 • 19:42 WIB</td>
                    <td className="py-2.5 px-3 font-bold text-primary">Sholat Isya Berjamaah</td>
                    <td className="py-2.5 px-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      Pintu Sayap Kiri Masjid
                    </td>
                    <td className="py-2.5 px-3 text-on-surface-variant">Ust. Rahmat Hidayat</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                        Hadir Tepat Waktu
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-3 font-mono">26 Okt 2026 • 15:45 WIB</td>
                    <td className="py-2.5 px-3 font-bold text-primary">Madrasah Diniyah Sore</td>
                    <td className="py-2.5 px-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      Ruang Kelas Ulya Lantai 2
                    </td>
                    <td className="py-2.5 px-3 text-on-surface-variant">Ustzh. Maryam</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                        Hadir Tepat Waktu
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: Print Settings Panel (4 Columns) */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-3 border-b border-surface-container/60">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">tune</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Parameter Cetak Mesin</h3>
                <p className="text-xs text-outline">Konfigurasi hardware thermal & printer PVC</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Layout */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span>Layout & Tata Letak</span>
                  <span className="text-primary text-[10px] cursor-pointer hover:underline">Rekomendasi</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintLayout('single')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center cursor-pointer transition-all ${
                      printLayout === 'single'
                        ? 'bg-primary-fixed text-on-primary-fixed border-primary'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] mb-1">id_card</span>
                    <span className="text-xs font-bold">Kartu Satuan</span>
                    <span className="text-[10px] text-outline">Printer ID Card PVC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintLayout('a4')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center cursor-pointer transition-all ${
                      printLayout === 'a4'
                        ? 'bg-primary-fixed text-on-primary-fixed border-primary'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] mb-1">grid_view</span>
                    <span className="text-xs font-bold">Lembar A4 (8 Pcs)</span>
                    <span className="text-[10px] text-outline">Cetak Massal Santri</span>
                  </button>
                </div>
              </div>

              {/* Jenis Media */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Jenis Media & Kertas</label>
                <select
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl text-xs text-on-surface outline-none cursor-pointer border border-outline-variant/30"
                >
                  <option value="pvc_heavy">Kartu PVC Tebal 0.76mm (Standard ISO Card)</option>
                  <option value="pvc_slim">Kartu PVC Tipis 0.50mm (ID Badge)</option>
                  <option value="art_paper_doff">Art Paper 310gsm + Laminasi Doff Hangat</option>
                  <option value="art_paper_glossy">Art Paper 310gsm + Laminasi Glossy Kilap</option>
                  <option value="teslin">Kertas Sintetis Teslin (Waterproof Tahan Air)</option>
                </select>
              </div>

              {/* Sides */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Sisi yang Dicetak (Sides)</label>
                <div className="flex rounded-xl bg-surface-container-low p-1 gap-1 border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setCardSide('both')}
                    className={`flex-1 py-1.5 rounded-lg text-center text-xs font-semibold cursor-pointer transition-all ${
                      cardSide === 'both' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'
                    }`}
                  >
                    Dua Sisi (Bolak-Balik)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardSide('front')}
                    className={`flex-1 py-1.5 rounded-lg text-center text-xs font-semibold cursor-pointer transition-all ${
                      cardSide === 'front' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'
                    }`}
                  >
                    Depan Saja
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardSide('back')}
                    className={`flex-1 py-1.5 rounded-lg text-center text-xs font-semibold cursor-pointer transition-all ${
                      cardSide === 'back' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'
                    }`}
                  >
                    Belakang Saja
                  </button>
                </div>
              </div>

              {/* Crop marks toggle */}
              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-[18px]">crop</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Garis Panduan Potong (Crop Marks)</span>
                    <span className="text-[10px] text-outline">Menambahkan garis potong presisi 2mm bleed</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={cropMarks}
                  onChange={(e) => setCropMarks(e.target.checked)}
                  className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                />
              </div>

              {/* Stamp toggle */}
              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-[18px]">verified</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Tanda Tangan & Stempel Resmi</span>
                    <span className="text-[10px] text-outline">Sertakan stempel validasi direktur pengasuhan</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={officialStamp}
                  onChange={(e) => setOfficialStamp(e.target.checked)}
                  className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                />
              </div>

              {/* Notice */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary-fixed/30 text-on-primary-fixed text-[11px] border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">info</span>
                <span>Untuk printer seperti <strong>Fargo DTC, Evolis Zenius, atau Zebra ZC300</strong>, gunakan orientasi Landscape dengan Bleed 1mm aktif.</span>
              </div>

              {/* Execute Print */}
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Proses Cetak Kartu ({santri.nama})</span>
              </button>
            </div>
          </div>

          {/* Quick Guidance Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary-container text-[18px]">lightbulb</span>
              Petunjuk Pemakaian Fisik
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-surface-container-high text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  <strong>Lanyard Resmi:</strong> Wajib dikalungkan santri selama berada di area umum pondok, masjid, dan saat agenda perizinan pulang.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-surface-container-high text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  <strong>Optical Compatibility:</strong> Kode QR di belakang kartu dapat terbaca otomatis dalam sudut hingga 45° dan jarak 15–40 cm.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-surface-container-high text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  <strong>Regenerasi Cepat:</strong> Jika kartu santri patah atau hilang, klik tombol <em>Regenerasi Token</em> untuk menonaktifkan kode lama secara instan.
                </p>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-surface-container flex items-center justify-between text-outline text-[11px]">
              <span className="font-mono">ID: {santri.nis}-DARUSSALAM</span>
              <button
                type="button"
                onClick={() => alert('Mengunduh template blangko kartu kosong format AI/PSD...')}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Unduh Template Kosong
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
