import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Santri, Activity, AttendanceRecord, Role, PageView } from '../types';
import { playScannerBeep } from '../utils/audio';

interface ScannerViewProps {
  santriList: Santri[];
  activities: Activity[];
  attendanceLogs: AttendanceRecord[];
  onAddAttendance: (record: AttendanceRecord) => void;
  activeActivityCode?: string;
  role?: Role;
  onNavigate?: (page: PageView) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  santriList,
  activities,
  attendanceLogs,
  onAddAttendance,
  activeActivityCode,
  role = 'admin',
  onNavigate
}) => {
  const [currentActivityCode, setCurrentActivityCode] = useState(
    activeActivityCode || (activities.length > 0 ? activities[0].code : '')
  );

  useEffect(() => {
    if (activeActivityCode) {
      setCurrentActivityCode(activeActivityCode);
    } else if (activities.length > 0 && !currentActivityCode) {
      setCurrentActivityCode(activities[0].code);
    }
  }, [activeActivityCode, activities]);

  const [cameraSource, setCameraSource] = useState('webcam-real');
  const [validatorState, setValidatorState] = useState<'idle' | 'success' | 'duplicate'>('idle');
  const [beepEnabled, setBeepEnabled] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showChangeActivityModal, setShowChangeActivityModal] = useState(false);
  const [manualNis, setManualNis] = useState('');
  const [manualStatus, setManualStatus] = useState<'Hadir' | 'Izin' | 'Alfa'>('Hadir');
  const [manualReason, setManualReason] = useState('Kartu Tertinggal di Asrama');
  const [quickNisInput, setQuickNisInput] = useState('');
  const [lastScannedSantri, setLastScannedSantri] = useState<Santri | null>(null);
  const [scanTimestamp, setScanTimestamp] = useState('');
  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [unrecognizedCode, setUnrecognizedCode] = useState<string | null>(null);
  const [scanFlash, setScanFlash] = useState(false);
  const [isQrEngineActive, setIsQrEngineActive] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeActivity =
    activities.find((a) => a.code === currentActivityCode) || (activities.length > 0 ? activities[0] : null);

  // Stop / start camera stream
  useEffect(() => {
    if (cameraSource === 'webcam-real') {
      setUseRealWebcam(true);
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          })
          .then((stream) => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
          })
          .catch((err) => {
            console.warn('Camera access error:', err);
            setCameraError(
              'Akses kamera tidak diizinkan atau tidak tersedia. Anda tetap dapat menggunakan Unggah Foto QR atau Input Manual NIS.'
            );
            setUseRealWebcam(false);
          });
      } else {
        setCameraError('Browser tidak mendukung akses kamera langsung.');
        setUseRealWebcam(false);
      }
    } else {
      setUseRealWebcam(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraSource]);

  // Logs for current activity
  const currentActivityLogs = attendanceLogs.filter(
    (log) => activeActivity && (log.kegiatan === activeActivity.title || log.kegiatan === activeActivity.code)
  );

  // Trigger scan when santri is identified
  const triggerScan = (santri: Santri) => {
    if (!activeActivity) {
      alert('Pilih kegiatan terlebih dahulu sebelum melakukan presensi!');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds()
    ).padStart(2, '0')}`;
    setScanTimestamp(timeStr);
    setLastScannedSantri(santri);

    // Cek apakah santri sudah tercatat hadir pada kegiatan ini hari ini
    const isAlreadyAttended = currentActivityLogs.some(
      (log) => log.santriId === santri.id || log.nis.toUpperCase() === santri.nis.toUpperCase()
    );

    if (isAlreadyAttended) {
      setValidatorState('duplicate');
      if (beepEnabled) playScannerBeep(false);
    } else {
      setValidatorState('success');
      if (beepEnabled) playScannerBeep(true);

      const dateStr = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      const newRecord: AttendanceRecord = {
        id: `scan-${Date.now()}`,
        santriId: santri.id,
        nis: santri.nis,
        nama: santri.nama,
        kelas: santri.kelas,
        kamar: santri.kamar,
        fotoUrl: santri.fotoUrl,
        kegiatan: activeActivity.title,
        timestamp: timeStr,
        date: dateStr,
        status: 'Hadir',
        sensorLocation: activeActivity.location || 'Kamera Utama Gerbang',
        petugas: activeActivity.petugas || 'Admin Presensi'
      };
      onAddAttendance(newRecord);
    }
  };

  // Process decoded string from live optical reader or uploaded image
  const handleProcessDecodedText = (decoded: string) => {
    const clean = decoded.trim();
    if (!clean) return;

    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 600);

    // Cari santri yang cocok berdasarkan token, NIS, atau string yang memuat token/NIS
    const found = santriList.find((s) => {
      if (s.qrToken && s.qrToken === clean) return true;
      if (s.nis && s.nis.toUpperCase() === clean.toUpperCase()) return true;
      if (s.qrToken && clean.includes(s.qrToken)) return true;
      if (s.qrToken && s.qrToken.includes(clean)) return true;
      if (s.nis && clean.toUpperCase().includes(s.nis.toUpperCase())) return true;
      return false;
    });

    if (found) {
      setUnrecognizedCode(null);
      triggerScan(found);
    } else {
      setUnrecognizedCode(clean);
      if (beepEnabled) playScannerBeep(false);
      setTimeout(() => setUnrecognizedCode(null), 5000);
    }
  };

  // Continuous Optical Scanning Loop on Live Video Frames
  useEffect(() => {
    let animationFrameId: number;
    let isSubscribed = true;

    const tick = () => {
      if (!isSubscribed) return;

      if (
        isQrEngineActive &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth'
            });

            if (code && code.data) {
              const now = Date.now();
              // Cooldown 2.5s antar pembacaan agar tidak re-trigger instan
              if (now - lastScanTimeRef.current > 2500) {
                lastScanTimeRef.current = now;
                handleProcessDecodedText(code.data);
              }
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    if (useRealWebcam) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      isSubscribed = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [useRealWebcam, isQrEngineActive, santriList, activeActivity, currentActivityLogs]);

  // Decode QR from uploaded image file
  const handleImageUploadDecode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (code && code.data) {
            handleProcessDecodedText(code.data);
          } else {
            alert('Tidak dapat mendeteksi QR Code dari gambar yang diunggah. Pastikan QR code terlihat jelas dan kontras.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSimulateRandomScan = () => {
    if (santriList.length === 0) {
      alert('Belum ada santri terdaftar. Silakan tambahkan santri terlebih dahulu di menu Registrasi Santri.');
      return;
    }
    const randomSantri = santriList[Math.floor(Math.random() * santriList.length)];
    triggerScan(randomSantri);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNis = manualNis.trim().toUpperCase();
    const found = santriList.find(
      (s) => s.nis.toUpperCase() === cleanNis || (s.qrToken && s.qrToken.includes(cleanNis))
    );

    if (found) {
      if (manualStatus === 'Hadir') {
        triggerScan(found);
      } else {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
          now.getSeconds()
        ).padStart(2, '0')}`;
        const dateStr = now.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        const newRecord: AttendanceRecord = {
          id: `manual-${Date.now()}`,
          santriId: found.id,
          nis: found.nis,
          nama: found.nama,
          kelas: found.kelas,
          kamar: found.kamar || '-',
          fotoUrl: found.fotoUrl,
          kegiatan: activeActivity ? activeActivity.title : 'Kegiatan',
          timestamp: timeStr,
          date: dateStr,
          status: manualStatus,
          keterangan: manualReason,
          sensorLocation: 'Input Manual Admin',
          petugas: activeActivity?.petugas || 'Admin Presensi'
        };

        onAddAttendance(newRecord);
        setLastScannedSantri(found);
        setScanTimestamp(timeStr);
        setValidatorState('success');
      }
      setShowManualModal(false);
      setManualNis('');
      setManualStatus('Hadir');
    } else {
      alert(`Santri dengan NIS atau Token "${manualNis}" tidak ditemukan dalam daftar santri terdaftar!`);
    }
  };

  const handleQuickNisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNisInput.trim()) return;
    const clean = quickNisInput.trim().toUpperCase();
    const found = santriList.find(
      (s) => s.nis.toUpperCase() === clean || s.nama.toUpperCase().includes(clean) || (s.qrToken && s.qrToken.includes(clean))
    );

    if (found) {
      triggerScan(found);
      setQuickNisInput('');
    } else {
      alert(`Santri dengan kata kunci / NIS "${quickNisInput}" tidak ditemukan!`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Metric computations for active activity
  const totalSantri = santriList.length;
  const hadirCount = currentActivityLogs.filter((l) => l.status === 'Hadir').length;
  const izinCount = santriList.filter((s) => s.status === 'Izin Pulang').length;
  const belumHadirCount = Math.max(0, totalSantri - hadirCount - izinCount);
  const persentaseHadir = totalSantri > 0 ? Math.round((hadirCount / totalSantri) * 100) : 0;

  // Jika belum ada kegiatan sama sekali
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm gap-5">
        <div className="w-20 h-20 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[44px]">event_busy</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-on-surface">Belum Ada Kegiatan Tersedia</h2>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            Presensi santri memerlukan jadwal kegiatan aktif (misalnya: Kajian Subuh, Sholat Berjamaah, atau KBM Madrasah).
            Silakan buat kegiatan baru terlebih dahulu agar scanner dapat digunakan.
          </p>
        </div>
        {role === 'admin' && onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('kegiatan')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-sm shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Buka Menu Kegiatan & Tambah Sekarang</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-space-lg pb-10">
      {/* Hidden off-screen canvas for frame pixel processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for uploading QR code picture */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUploadDecode}
        className="hidden"
      />

      {/* Active Event Banner */}
      {activeActivity ? (
        <section className="w-full bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md relative z-10">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                  {activeActivity.title}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${
                    activeActivity.status === 'Sedang Berlangsung'
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {activeActivity.status === 'Sedang Berlangsung' && (
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  )}
                  {activeActivity.status}
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-xs text-on-surface-variant font-mono">
                  ID: {activeActivity.code}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-on-surface-variant mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                  <span>{activeActivity.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">place</span>
                  <span>{activeActivity.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-container">person_check</span>
                  <span>
                    Petugas: <strong className="text-on-surface">{activeActivity.petugas}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto self-end lg:self-center">
              <button
                type="button"
                onClick={() => setShowChangeActivityModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-container-high text-primary hover:bg-surface-container-highest transition-colors font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                <span>Pilih Sesi Kegiatan ({activities.length})</span>
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg w-full items-start">
        {/* LEFT COLUMN: Live Scanner Viewport & Alerts (7 cols) */}
        <section className="xl:col-span-7 flex flex-col gap-space-lg">
          {/* Camera Viewport Card */}
          <div
            className={`w-full bg-inverse-surface text-inverse-on-surface rounded-2xl p-space-md sm:p-space-lg shadow-xl relative overflow-hidden flex flex-col gap-space-md border transition-colors duration-300 ${
              scanFlash ? 'border-secondary ring-4 ring-secondary/40' : 'border-outline/20'
            }`}
          >
            {/* Viewport Top Bar Controls */}
            <div className="flex items-center justify-between z-20 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary animate-pulse text-[20px]">videocam</span>
                <span className="text-xs font-bold tracking-wider uppercase text-inverse-on-surface/90">
                  Optical QR Reader Active (jsQR Engine)
                </span>
              </div>

              {/* Action buttons on camera */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-highest/20 hover:bg-surface-container-highest/40 backdrop-blur-md border border-white/10 text-inverse-on-surface text-xs font-semibold cursor-pointer transition-colors"
                  title="Unggah foto QR Code dari galeri atau berkas komputer"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed">upload_file</span>
                  <span>Scan dari Gambar</span>
                </button>

                <div className="flex items-center gap-1 bg-surface-container-highest/20 rounded-lg px-2.5 py-1 backdrop-blur-md border border-white/10">
                  <span className="material-symbols-outlined text-[15px] text-inverse-on-surface/80">
                    flip_camera_ios
                  </span>
                  <select
                    value={cameraSource}
                    onChange={(e) => setCameraSource(e.target.value)}
                    className="bg-transparent text-inverse-on-surface text-xs focus:outline-none cursor-pointer"
                  >
                    <option className="bg-inverse-surface text-inverse-on-surface" value="webcam-real">
                      Kamera Langsung (Webcam)
                    </option>
                    <option className="bg-inverse-surface text-inverse-on-surface" value="simulated">
                      Mode Hemat Daya / Kios Statis
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Camera Viewfinder Box */}
            <div className="relative w-full h-[320px] sm:h-[380px] rounded-xl overflow-hidden bg-black/95 flex items-center justify-center select-none shadow-inner border border-white/10">
              {useRealWebcam ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0 opacity-40 bg-center bg-cover scale-105"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAigAcy18wXjJ_3UOXatWpD0w5ni2Db7eqv7shNtqB0VMfC3WF3gcWVK3-NbO3tS4tnSVScjUjRL31X3WV9xv0Sy2SFyQjnGu9aFVnOYN81d1Bb4GNvrl1lGDe8y_eL8Sj9lCCmHVYArpjyQnhDYKeZv3xznW4zx_U4ou9Oc_cqD1L53RjspLh8hAjW8oDd2dpC-NLW3MQOI2sRmvOLAAVhNpOgLTpZEwafwVtuydLo5F0GhO5nxJ5r')`
                  }}
                />
              )}

              {cameraError && (
                <div className="absolute top-12 mx-4 p-3 rounded-xl bg-black/85 text-yellow-300 text-xs z-30 flex items-start gap-2 border border-yellow-500/40 max-w-md shadow-lg">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
                  <div className="flex flex-col">
                    <span className="font-semibold">Info Sensor Kamera</span>
                    <span className="text-[11px] text-yellow-200 mt-0.5">{cameraError}</span>
                  </div>
                </div>
              )}

              {/* Lens Vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

              {/* Scanning Target Box */}
              <div className={`relative w-52 h-52 sm:w-60 sm:h-60 rounded-xl flex items-center justify-center z-10 pointer-events-none transition-all duration-200 ${
                scanFlash ? 'scale-105' : 'scale-100'
              }`}>
                {/* Glowing Corners */}
                <div className="absolute -top-1 -left-1 w-8 h-8 rounded-tl-lg border-t-4 border-l-4 border-primary-fixed shadow-[0_0_12px_rgba(212,187,255,0.8)]" />
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-tr-lg border-t-4 border-r-4 border-primary-fixed shadow-[0_0_12px_rgba(212,187,255,0.8)]" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-bl-lg border-b-4 border-l-4 border-primary-fixed shadow-[0_0_12px_rgba(212,187,255,0.8)]" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-br-lg border-b-4 border-r-4 border-primary-fixed shadow-[0_0_12px_rgba(212,187,255,0.8)]" />

                {/* Target Center Crosshair */}
                <div className="w-12 h-12 rounded-full border border-primary-fixed/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-secondary-fixed shadow-[0_0_8px_#7cfba7]" />
                </div>

                {/* Bouncing Horizontal Laser Scanner Line */}
                <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-secondary-fixed to-transparent shadow-[0_0_14px_#7cfba7] animate-bounce" />

                {/* Watermark QR */}
                <div className="absolute inset-4 opacity-15 border border-dashed border-primary-fixed pointer-events-none rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[80px] text-primary-fixed">qr_code_2</span>
                </div>
              </div>

              {/* Bottom Instruction Pill */}
              <div className="absolute bottom-4 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-inverse-surface/85 backdrop-blur-md shadow-lg border border-primary-fixed/20 text-inverse-on-surface">
                <span className="material-symbols-outlined text-[16px] text-secondary-fixed">center_focus_strong</span>
                <span className="text-xs">Arahkan QR Code kartu santri ke bingkai sensor</span>
              </div>

              {/* Live Signal Indicator */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 font-mono text-[10px] text-secondary-fixed">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-ping" />
                60 FPS • SCANNER AKTIF
              </div>
            </div>

            {/* Quick NIS Type Scanner Input */}
            <form onSubmit={handleQuickNisSubmit} className="flex items-center gap-2 z-20">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-inverse-on-surface/50 text-[18px]">
                  qr_code_scanner
                </span>
                <input
                  type="text"
                  value={quickNisInput}
                  onChange={(e) => setQuickNisInput(e.target.value)}
                  placeholder="Ketik NIS / Scan Barcode (Contoh: SNT-0429 lalu tekan Enter)..."
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-highest/30 text-inverse-on-surface placeholder:text-inverse-on-surface/40 text-xs border border-white/10 focus:border-secondary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-secondary text-on-secondary font-semibold text-xs hover:bg-secondary/90 transition-all cursor-pointer shadow-sm shrink-0"
              >
                Scan / Enter
              </button>
            </form>

            {/* Footer Stats */}
            <div className="flex items-center justify-between text-inverse-on-surface/70 text-xs px-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">memory</span>
                Pemindaian Otomatis Frame Kamera Aktif
              </span>
              <span className="font-mono text-inverse-on-surface/60 text-[11px]">
                {santriList.length} Santri Terdata di Sistem
              </span>
            </div>
          </div>

          {/* Quick simulation controls */}
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <span className="text-xs text-outline uppercase tracking-wider font-semibold">
              Alat Uji & Simulasi:
            </span>
            <div className="inline-flex p-1 bg-surface-container-high rounded-xl gap-1">
              <button
                type="button"
                onClick={handleSimulateRandomScan}
                disabled={santriList.length === 0}
                className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                title={santriList.length === 0 ? 'Tambah santri terlebih dahulu' : 'Simulasi scan santri'}
              >
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                <span>Scan Uji Coba Acak (Beep)</span>
              </button>
            </div>
          </div>

          {/* Alert: QR terbaca namun tidak terdaftar */}
          {unrecognizedCode && (
            <div className="w-full bg-error-container text-on-error-container rounded-2xl p-4 border border-error/30 shadow-md flex items-start gap-3 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-error text-[24px] shrink-0 mt-0.5">error</span>
              <div className="flex flex-col">
                <span className="font-bold text-sm">QR Code Terbaca, Namun Santri Tidak Ditemukan!</span>
                <span className="text-xs mt-0.5">
                  Isi data QR: <code className="font-mono font-bold bg-white/40 px-1 py-0.5 rounded">{unrecognizedCode}</code>
                </span>
                <span className="text-[11px] text-on-error-container/80 mt-1">
                  Pastikan santri sudah terdaftar di menu <strong>Data Santri</strong> dengan token / NIS yang sesuai.
                </span>
              </div>
            </div>
          )}

          {/* STATE 1: Success State Alert Box */}
          {validatorState === 'success' && lastScannedSantri && (
            <div className="w-full bg-secondary/10 rounded-2xl p-space-md sm:p-space-lg shadow-[0_4px_20px_-4px_rgba(0,109,58,0.18)] border border-secondary/20 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-md"
                      alt={lastScannedSantri.nama}
                      src={lastScannedSantri.fotoUrl}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[15px]">check</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold tracking-wider uppercase text-secondary">
                        ✓ Presensi Berhasil Diverifikasi
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary text-[10px] font-bold">
                        HADIR TEPAT WAKTU
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-on-surface mt-0.5">
                      {lastScannedSantri.nama}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-on-surface-variant">
                      <span>
                        NIS: <strong className="text-on-surface font-mono">{lastScannedSantri.nis}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Kelas: <strong className="text-on-surface">{lastScannedSantri.kelas}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Kamar: <strong className="text-on-surface">{lastScannedSantri.kamar}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-center self-stretch md:self-auto bg-surface-container-lowest/85 p-space-md rounded-xl border border-outline-variant/30">
                  <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">
                    Waktu Pemindaian
                  </span>
                  <span className="text-lg font-bold text-secondary font-mono tracking-tight">
                    {scanTimestamp} WIB
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    Tercatat di Log Presensi
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Duplicate Alert Box */}
          {validatorState === 'duplicate' && lastScannedSantri && (
            <div className="w-full bg-tertiary-fixed/40 rounded-2xl p-space-md sm:p-space-lg shadow-[0_4px_20px_-4px_rgba(119,87,0,0.18)] border border-tertiary-container/30 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-md grayscale"
                      alt={lastScannedSantri.nama}
                      src={lastScannedSantri.fotoUrl}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-tertiary-container text-tertiary-fixed flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[15px]">priority_high</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold tracking-wider uppercase text-tertiary-container">
                        ⚠ Santri Sudah Melakukan Presensi
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-tertiary-fixed text-[10px] font-bold">
                        DUPLIKASI SCAN DIABAIKAN
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-on-surface mt-0.5">
                      {lastScannedSantri.nama}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-on-surface-variant">
                      <span>
                        NIS: <strong className="text-on-surface font-mono">{lastScannedSantri.nis}</strong>
                      </span>
                      <span>•</span>
                      <span>Status: Sudah Terdaftar Hadir</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-center self-stretch md:self-auto bg-surface-container-lowest/90 p-space-md rounded-xl border border-outline-variant/30">
                  <span className="text-[10px] text-tertiary-container uppercase font-bold tracking-wider">
                    Peringatan Sistem
                  </span>
                  <span className="text-xs text-on-surface-variant">Kartu sudah pernah dipindai untuk sesi ini.</span>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: Idle State (when no scan yet) */}
          {validatorState === 'idle' && (
            <div className="w-full bg-surface-container-low rounded-2xl p-space-md sm:p-space-lg border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-2 py-8">
              <span className="material-symbols-outlined text-[36px] text-outline">qr_code_scanner</span>
              <p className="text-sm font-semibold text-on-surface">Menunggu Pemindaian Kartu Santri</p>
              <p className="text-xs text-on-surface-variant max-w-sm">
                Arahkan kartu ke kamera, unggah gambar QR code, ketikkan NIS di kolom atas, atau gunakan input manual jika kartu tertinggal.
              </p>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Live Attendance Monitor & Streaming (5 cols) */}
        <section className="xl:col-span-5 flex flex-col gap-space-lg">
          {/* Real-time Attendance Stat Counter */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
                <h3 className="text-sm font-bold text-on-surface">Ringkasan Sesi Ini</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold font-mono">
                {totalSantri} Total Santri
              </span>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="flex flex-col bg-secondary/10 rounded-xl p-2.5">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Hadir</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-secondary">{hadirCount}</span>
                  <span className="text-[11px] text-secondary font-medium">{persentaseHadir}%</span>
                </div>
                <span className="text-[10px] text-on-surface-variant mt-0.5">Tervalidasi QR</span>
              </div>

              <div className="flex flex-col bg-surface-container rounded-xl p-2.5">
                <span className="text-[10px] text-tertiary-container font-bold uppercase tracking-wider">Izin</span>
                <span className="text-2xl font-bold text-tertiary-container mt-1">{izinCount}</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5">Dispensasi</span>
              </div>

              <div className="flex flex-col bg-surface-container rounded-xl p-2.5">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Sakit</span>
                <span className="text-2xl font-bold text-on-surface mt-1">0</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5">Poskestren</span>
              </div>

              <div className="flex flex-col bg-error-container/40 rounded-xl p-2.5">
                <span className="text-[10px] text-on-error-container font-bold uppercase tracking-wider">Belum Scan</span>
                <span className="text-2xl font-bold text-on-error-container mt-1">{belumHadirCount}</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5">Santri</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Progres Presensi Terkumpul</span>
                <span className="font-bold text-secondary">
                  {hadirCount} / {totalSantri} ({persentaseHadir}%)
                </span>
              </div>
              <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-secondary h-full transition-all duration-500"
                  style={{ width: `${persentaseHadir}%` }}
                />
              </div>
            </div>
          </div>

          {/* Live Activity Streaming Feed */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">stream</span>
                <h3 className="text-sm font-bold text-on-surface">Presensi Terbaru Terverifikasi</h3>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-secondary font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                Live Log
              </span>
            </div>

            {/* List */}
            <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto pr-1">
              {currentActivityLogs.length === 0 ? (
                <div className="py-8 text-center text-outline text-xs flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-[28px] opacity-40">fact_check</span>
                  <span>Belum ada presensi terekam pada sesi kegiatan ini.</span>
                </div>
              ) : (
                currentActivityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-surface"
                        alt={log.nama}
                        src={log.fotoUrl}
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-on-surface truncate">{log.nama}</span>
                          <span className="font-mono text-[10px] text-outline shrink-0">{log.nis}</span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant truncate">
                          {log.kelas} • {log.kamar}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold">
                        Hadir
                      </span>
                      <span className="font-mono text-xs text-on-surface-variant mt-0.5">{log.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/30 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex-1 min-w-[130px] px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">fullscreen</span>
              Mode Kios Layar Penuh
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[130px] px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Unggah Foto QR
            </button>

            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="flex-1 min-w-[130px] px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">keyboard</span>
              Input Manual (NIS)
            </button>

            <button
              type="button"
              onClick={() => {
                const nextState = !beepEnabled;
                setBeepEnabled(nextState);
                if (nextState) playScannerBeep(true);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                beepEnabled
                  ? 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                  : 'bg-surface-container text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {beepEnabled ? 'volume_up' : 'volume_off'}
              </span>
              <span>{beepEnabled ? 'Beep: Aktif' : 'Beep: Mute'}</span>
            </button>
          </div>
        </section>
      </div>

      {/* Manual Input Dialog */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">pin</span>
                <h3 className="text-lg font-bold text-on-surface">Input Presensi Manual</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Gunakan opsi ini jika kartu identitas santri tertinggal, rusak, atau QR code tidak dapat dipindai oleh sensor kamera.
            </p>

            <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface font-semibold">Nomor Induk Santri (NIS)</label>
                <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-2 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-outline mr-2 text-[18px]">badge</span>
                  <input
                    type="text"
                    required
                    value={manualNis}
                    onChange={(e) => setManualNis(e.target.value)}
                    placeholder="Contoh: SNT-0429"
                    className="bg-transparent outline-none font-mono text-xs text-on-surface placeholder:text-outline w-full uppercase"
                  />
                </div>
              </div>

              {/* Pilih Status Presensi Manual */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface font-semibold">Status Presensi</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualStatus('Hadir')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      manualStatus === 'Hadir'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500 shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Hadir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualStatus('Izin')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      manualStatus === 'Izin'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500 shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                    <span>Izin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualStatus('Alfa')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      manualStatus === 'Alfa'
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500 shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    <span>Alfa</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface font-semibold">Alasan / Keterangan</label>
                <select
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-xs outline-none cursor-pointer border border-outline-variant/30"
                >
                  <option>Kartu Tertinggal di Asrama</option>
                  <option>Izin Pulang ke Rumah (Izin)</option>
                  <option>Sakit di Kamar / UKS (Izin/Sakit)</option>
                  <option>Tanpa Keterangan (Alfa)</option>
                  <option>Barcode / QR Code Tergores Rusak</option>
                  <option>Kartu Hilang (Proses Pembuatan Ulang)</option>
                  <option>Santri Baru Belum Memiliki Kartu Fisik</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary-container transition-all cursor-pointer"
                >
                  Verifikasi Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Activity Modal */}
      {showChangeActivityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">Pilih Sesi Kegiatan Presensi</h3>
              <button
                type="button"
                onClick={() => setShowChangeActivityModal(false)}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              Tentukan agenda ibadah atau akademik yang sedang berlangsung saat ini:
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {activities.map((act) => (
                <button
                  type="button"
                  key={act.id}
                  onClick={() => {
                    setCurrentActivityCode(act.code);
                    setShowChangeActivityModal(false);
                  }}
                  className={`w-full p-3 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                    act.code === currentActivityCode
                      ? 'bg-primary-fixed/30 border-primary text-primary'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
                    <div>
                      <p className="font-bold text-xs">{act.title}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        {act.time} • {act.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-container-high">
                    {act.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
