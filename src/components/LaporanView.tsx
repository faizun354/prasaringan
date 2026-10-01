import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Activity, AttendanceRecord, Santri } from '../types';

interface LaporanViewProps {
  santriList: Santri[];
  activities: Activity[];
  attendanceLogs: AttendanceRecord[];
  filterNis?: string;
  readOnly?: boolean;
  onAddAttendance?: (record: AttendanceRecord) => void;
  onUpdateAttendance?: (record: AttendanceRecord) => void;
  onDeleteAttendance?: (id: string) => void;
}

interface ActivityTableProps {
  activity: Activity;
  logs: AttendanceRecord[];
  filterNis?: string;
  readOnly?: boolean;
  onOpenManualModal?: (activityTitle: string) => void;
  onUpdateAttendance?: (record: AttendanceRecord) => void;
  onDeleteAttendance?: (id: string) => void;
}

// Komponen Tabel per Kegiatan
const ActivityTable: React.FC<ActivityTableProps> = ({
  activity,
  logs,
  filterNis = '',
  readOnly = false,
  onOpenManualModal
  , onUpdateAttendance, onDeleteAttendance
}) => {
  const [searchNis, setSearchNis] = useState(filterNis);
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(1);

  // Helper untuk mencocokkan tanggal
  const matchesDate = (logDate: string, selectedDate: string, logId?: string) => {
    if (!selectedDate) return true;
    if (logDate && logDate.includes(selectedDate)) return true;

    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const d = parseInt(parts[2]);
      const dateObj = new Date(y, m, d);

      const formattedId = dateObj.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }); // cth: "27 Sep 2026"
      if (logDate && logDate.toLowerCase().includes(formattedId.toLowerCase())) return true;

      const dayStr = String(parts[2]);
      const monStr = String(parts[1]);
      const yrStr = String(parts[0]);
      if (logDate && (logDate.includes(`${dayStr}/${monStr}/${yrStr}`) || logDate.includes(`${dayStr}-${monStr}-${yrStr}`))) {
        return true;
      }
    }

    if (logId && logId.startsWith('scan-')) {
      const ms = parseInt(logId.replace('scan-', ''));
      if (!isNaN(ms)) {
        const logD = new Date(ms);
        if (logD.toISOString().slice(0, 10) === selectedDate) return true;
      }
    }

    return false;
  };

  // Filter log presensi khusus kegiatan ini berdasarkan NIS & Tanggal
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Filter NIS jika ada filterNis dari props (role santri)
      if (filterNis && log.nis.toUpperCase() !== filterNis.toUpperCase()) {
        return false;
      }
      // Filter input NIS
      if (searchNis && !log.nis.toLowerCase().includes(searchNis.toLowerCase().trim())) {
        return false;
      }
      // Filter Tanggal
      if (filterDate && !matchesDate(log.date, filterDate, log.id)) {
        return false;
      }
      return true;
    });
  }, [logs, filterNis, searchNis, filterDate]);
  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / 7));
  const pageLogs = filteredLogs.slice((page - 1) * 7, page * 7);

  // Ekspor Excel (.xlsx) khusus kegiatan ini
  const handleExportExcel = () => {
    if (filteredLogs.length === 0) return;

    const exportRows = filteredLogs.map((log, idx) => ({
      'No': idx + 1,
      'Waktu Scan': log.timestamp || '-',
      'Tanggal': log.date || '-',
      'NIS': log.nis,
      'Nama Santri': log.nama,
      'Kelas': log.kelas,
      'Status': log.status,
      'Keterangan': log.keterangan || '-',
      'Lokasi Sensor': log.sensorLocation || 'Scanner Gerbang',
      'Petugas': log.petugas || 'Admin Presensi'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Styling lebar kolom agar rapi saat dibuka di Microsoft Excel
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 14 }, // Waktu Scan
      { wch: 16 }, // Tanggal
      { wch: 14 }, // NIS
      { wch: 28 }, // Nama Santri
      { wch: 12 }, // Kelas
      { wch: 14 }, // Status
      { wch: 24 }, // Keterangan
      { wch: 18 }, // Lokasi Sensor
      { wch: 18 }  // Petugas
    ];

    const workbook = XLSX.utils.book_new();
    const cleanSheetName = activity.title.slice(0, 31).replace(/[:\\/?*[\]]/g, '_');
    XLSX.utils.book_append_sheet(workbook, worksheet, cleanSheetName || 'Presensi');

    const safeTitle = activity.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    const fileName = `Presensi_${safeTitle}_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const isFiltered = Boolean((searchNis && searchNis !== filterNis) || filterDate);

  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col gap-4 p-space-lg">
      {/* Header Kegiatan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[22px]">{activity.icon || 'event_available'}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-on-surface">{activity.title}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activity.status === 'Sedang Berlangsung'
                  ? 'bg-primary text-on-primary'
                  : activity.status === 'Selesai'
                    ? 'bg-secondary/15 text-secondary'
                    : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {activity.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
              <span>{activity.time}</span>
              <span>•</span>
              <span>{activity.location}</span>
              <span>•</span>
              <span className="font-semibold text-primary">{filteredLogs.length} Presensi Tercatat</span>
            </div>
          </div>
        </div>

        {/* Action Buttons untuk Admin */}
        {!readOnly && (
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            {onOpenManualModal && (
              <button
                type="button"
                onClick={() => onOpenManualModal(activity.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>Catat Izin / Alpha</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={filteredLogs.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filteredLogs.length === 0
                  ? 'bg-surface-container text-outline cursor-not-allowed'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer shadow-xs'
              }`}
              title="Unduh laporan presensi kegiatan ini dalam format file Microsoft Excel (.xlsx)"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600">table_view</span>
              <span>Ekspor Excel</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar per Kegiatan: Hanya NIS dan Tanggal */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-low/60 p-3 rounded-xl border border-outline-variant/20">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Filter NIS */}
          <div className="flex items-center bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/30 flex-1 sm:max-w-xs focus-within:ring-2 focus-within:ring-primary/20">
            <span className="material-symbols-outlined text-outline text-[18px] mr-2">badge</span>
            <input
              type="text"
              value={searchNis}
              onChange={(e) => setSearchNis(e.target.value)}
              placeholder="Filter berdasarkan NIS..."
              className="bg-transparent outline-none w-full text-xs text-on-surface placeholder:text-outline font-medium"
            />
            {searchNis && (
              <button
                type="button"
                onClick={() => setSearchNis('')}
                className="text-outline hover:text-on-surface text-xs ml-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tanggal */}
          <div className="flex items-center bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/30 flex-1 sm:max-w-xs focus-within:ring-2 focus-within:ring-primary/20">
            <span className="material-symbols-outlined text-outline text-[18px] mr-2">calendar_today</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent outline-none w-full text-xs text-on-surface cursor-pointer font-medium"
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="text-outline hover:text-on-surface text-xs ml-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setSearchNis(filterNis);
              setFilterDate('');
            }}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Tabel Presensi Kegiatan */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Waktu Scan</th>
              <th className="py-3 px-4">NIS</th>
              <th className="py-3 px-4">Nama Santri</th>
              <th className="py-3 px-4">Kelas</th>
              <th className="py-3 px-4 text-center">Hadir / Izin / Alpha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/60 text-xs text-on-surface bg-surface-container-lowest">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-outline text-xs">
                  <span className="material-symbols-outlined text-[36px] block mb-1.5 opacity-30">
                    event_busy
                  </span>
                  {logs.length === 0
                    ? `Belum ada presensi yang tercatat untuk kegiatan "${activity.title}".`
                    : 'Tidak ada data presensi yang sesuai dengan filter NIS atau tanggal.'}
                </td>
              </tr>
            ) : (
              pageLogs.map((log, index) => {
                const statusLower = log.status?.toLowerCase();
                const isHadir = statusLower === 'hadir';
                const isIzin = statusLower === 'izin';
                const isSakit = statusLower === 'sakit';
                const isAlfa = statusLower === 'alfa';

                return (
                  <tr key={log.id} className="hover:bg-surface-container-low/70 transition-colors">
                    {/* 1. No */}
                    <td className="py-3 px-4 text-center text-outline font-medium">{(page - 1) * 7 + index + 1}</td>

                    {/* 2. Waktu Scan */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface font-mono">{log.timestamp} WIB</span>
                        <span className="text-[10px] text-on-surface-variant">{log.date}</span>
                      </div>
                    </td>

                    {/* 3. NIS */}
                    <td className="py-3 px-4 font-mono font-semibold text-primary">{log.nis}</td>

                    {/* 4. Nama Santri */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            log.fotoUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(log.nama)}&background=random`
                          }
                          alt={log.nama}
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-surface shadow-sm"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">{log.nama}</span>
                          {log.keterangan && (
                            <span className="text-[10px] text-on-surface-variant italic">
                              Ket: {log.keterangan}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 5. Kelas */}
                    <td className="py-3 px-4 font-medium text-on-surface">{log.kelas || '-'}</td>

                    {/* 6. Hadir/Izin/Alpha */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isHadir
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : isIzin
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              : isSakit
                                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                                : isAlfa
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                  : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isHadir
                              ? 'bg-emerald-500'
                              : isIzin
                                ? 'bg-amber-500'
                                : isSakit
                                  ? 'bg-sky-500'
                                  : 'bg-rose-500'
                          }`}
                        />
                        <span>{log.status}</span>
                      </span>
                      {!readOnly && <div className="flex justify-center gap-1 mt-2">
                        <button type="button" title="Edit presensi" className="text-primary hover:text-primary-container" onClick={() => {
                          const nextStatus = window.prompt('Status (Hadir, Izin, Sakit, Alfa):', log.status);
                          if (!nextStatus || !['Hadir', 'Izin', 'Sakit', 'Alfa'].includes(nextStatus)) return;
                          const keterangan = window.prompt('Keterangan:', log.keterangan || '') ?? log.keterangan;
                          onUpdateAttendance?.({ ...log, status: nextStatus as AttendanceRecord['status'], keterangan });
                        }}><span className="material-symbols-outlined text-[17px]">edit</span></button>
                        <button type="button" title="Hapus presensi" className="text-error hover:opacity-70" onClick={() => {
                          if (window.confirm(`Hapus presensi ${log.nama} tanggal ${log.date}?`)) onDeleteAttendance?.(log.id);
                        }}><span className="material-symbols-outlined text-[17px]">delete</span></button>
                      </div>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {filteredLogs.length > 7 && <div className="flex items-center justify-between text-xs text-on-surface-variant">
        <span>Menampilkan {(page - 1) * 7 + 1}–{Math.min(page * 7, filteredLogs.length)} dari {filteredLogs.length} data</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg border border-outline-variant disabled:opacity-40">Sebelumnya</button>
          <span>Halaman {page} / {pageCount}</span>
          <button type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg border border-outline-variant disabled:opacity-40">Berikutnya</button>
        </div>
      </div>}
    </div>
  );
};

export const LaporanView: React.FC<LaporanViewProps> = ({
  santriList,
  activities,
  attendanceLogs,
  filterNis,
  readOnly = false,
  onAddAttendance
  , onUpdateAttendance, onDeleteAttendance
}) => {
  // Modal State untuk Catat Izin / Alpha Manual oleh Admin
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedActivityTitle, setSelectedActivityTitle] = useState(
    activities.length > 0 ? activities[0].title : ''
  );
  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [manualStatus, setManualStatus] = useState<'Izin' | 'Alfa' | 'Sakit' | 'Hadir'>('Izin');
  const [manualDate, setManualDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [manualTime, setManualTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });
  const [manualKeterangan, setManualKeterangan] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleOpenManualModal = (actTitle?: string) => {
    if (actTitle) {
      setSelectedActivityTitle(actTitle);
    } else if (activities.length > 0 && !selectedActivityTitle) {
      setSelectedActivityTitle(activities[0].title);
    }
    setManualStatus('Izin');
    setManualKeterangan('');
    if (santriList.length > 0 && !selectedSantriId) {
      setSelectedSantriId(santriList[0].id);
    }
    setShowManualModal(true);
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddAttendance) return;

    const santri = santriList.find((s) => s.id === selectedSantriId);
    if (!santri) {
      alert('Silakan pilih santri terlebih dahulu!');
      return;
    }

    if (!selectedActivityTitle) {
      alert('Silakan pilih kegiatan terlebih dahulu!');
      return;
    }

    // Format tanggal
    let dateFormatted = '';
    if (manualDate) {
      const parts = manualDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        dateFormatted = d.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
    }
    if (!dateFormatted) {
      dateFormatted = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }

    const timeFormatted = manualTime ? `${manualTime}:00` : '08:00:00';

    const newRecord: AttendanceRecord = {
      id: `manual-${Date.now()}`,
      santriId: santri.id,
      nis: santri.nis,
      nama: santri.nama,
      kelas: santri.kelas,
      kamar: santri.kamar || '-',
      fotoUrl: santri.fotoUrl,
      kegiatan: selectedActivityTitle,
      timestamp: timeFormatted,
      date: dateFormatted,
      status: manualStatus,
      keterangan: manualKeterangan.trim() || undefined,
      sensorLocation: 'Input Manual Admin',
      petugas: 'Admin Presensi'
    };

    onAddAttendance(newRecord);
    setShowManualModal(false);
    showToast(`Presensi ${manualStatus} untuk "${santri.nama}" berhasil disimpan!`);
  };

  // Ekspor Seluruh Data Presensi Semua Kegiatan ke 1 File Excel (.xlsx)
  const handleExportAllExcel = () => {
    if (attendanceLogs.length === 0) {
      showToast('Belum ada data presensi yang tercatat untuk diekspor!');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Sheet 1: Master Rekap Semua Presensi
    const allRows = attendanceLogs.map((log, idx) => ({
      'No': idx + 1,
      'Kegiatan': log.kegiatan,
      'Waktu Scan': log.timestamp || '-',
      'Tanggal': log.date || '-',
      'NIS': log.nis,
      'Nama Santri': log.nama,
      'Kelas': log.kelas,
      'Status': log.status,
      'Keterangan': log.keterangan || '-',
      'Lokasi Sensor': log.sensorLocation || 'Scanner Gerbang',
      'Petugas': log.petugas || 'Admin Presensi'
    }));

    const masterSheet = XLSX.utils.json_to_sheet(allRows);
    masterSheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 24 }, // Kegiatan
      { wch: 14 }, // Waktu Scan
      { wch: 16 }, // Tanggal
      { wch: 14 }, // NIS
      { wch: 28 }, // Nama Santri
      { wch: 12 }, // Kelas
      { wch: 14 }, // Status
      { wch: 24 }, // Keterangan
      { wch: 18 }, // Lokasi Sensor
      { wch: 18 }  // Petugas
    ];
    XLSX.utils.book_append_sheet(workbook, masterSheet, 'Semua Presensi');

    // Sheet berikutnya per kegiatan yang memiliki data presensi
    activities.forEach((act) => {
      const actLogs = attendanceLogs.filter(
        (log) =>
          log.kegiatan?.toLowerCase() === act.title.toLowerCase() ||
          (act.code && log.kegiatan?.toLowerCase() === act.code.toLowerCase())
      );

      if (actLogs.length > 0) {
        const actRows = actLogs.map((log, idx) => ({
          'No': idx + 1,
          'Waktu Scan': log.timestamp || '-',
          'Tanggal': log.date || '-',
          'NIS': log.nis,
          'Nama Santri': log.nama,
          'Kelas': log.kelas,
          'Status': log.status,
          'Keterangan': log.keterangan || '-',
          'Petugas': log.petugas || 'Admin Presensi'
        }));

        const sheet = XLSX.utils.json_to_sheet(actRows);
        sheet['!cols'] = [
          { wch: 6 },
          { wch: 14 },
          { wch: 16 },
          { wch: 14 },
          { wch: 28 },
          { wch: 12 },
          { wch: 14 },
          { wch: 24 },
          { wch: 18 }
        ];

        const cleanName = act.title.slice(0, 28).replace(/[:\\/?*[\]]/g, '_');
        try {
          XLSX.utils.book_append_sheet(workbook, sheet, cleanName);
        } catch (_) {}
      }
    });

    const fileName = `Rekap_Presensi_Lengkap_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showToast('Laporan seluruh kegiatan berhasil diunduh dalam format Excel (.xlsx)!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary text-[11px] font-bold uppercase tracking-wider">
              {filterNis ? 'Portal Santri' : 'Laporan Presensi'}
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> {activities.length} Kegiatan Terdaftar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
            Laporan Presensi Santri
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl mt-0.5">
            Daftar presensi per-kegiatan dengan filter mandiri untuk NIS dan tanggal scan.
          </p>
        </div>

        {/* Action Buttons Header (Hanya untuk Admin) */}
        {!readOnly && (
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {onAddAttendance && activities.length > 0 && (
              <button
                type="button"
                onClick={() => handleOpenManualModal()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>+ Catat Izin / Alpha</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportAllExcel}
              disabled={attendanceLogs.length === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm ${
                attendanceLogs.length === 0
                  ? 'bg-surface-container text-outline cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md'
              }`}
              title="Unduh seluruh rekapitulasi presensi semua kegiatan dalam format file Microsoft Excel (.xlsx)"
            >
              <span className="material-symbols-outlined text-[18px]">table_view</span>
              <span>Ekspor Semua (Excel)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Cetak Dokumen</span>
            </button>
          </div>
        )}
      </div>

      {/* Daftar Tabel per Kegiatan */}
      {activities.length === 0 ? (
        <div className="w-full bg-surface-container-lowest rounded-2xl p-12 text-center border border-outline-variant/30 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed/40 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[32px]">event_busy</span>
          </div>
          <h2 className="text-base font-bold text-on-surface">Belum Ada Agenda Kegiatan</h2>
          <p className="text-xs text-on-surface-variant max-w-md">
            Tabel presensi akan otomatis muncul di sini untuk setiap kegiatan yang ditambahkan pada menu Kegiatan.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-lg">
          {activities.map((act) => {
            // Cocokkan attendanceLogs untuk kegiatan ini
            const activityLogs = attendanceLogs.filter(
              (log) =>
                log.kegiatan?.toLowerCase() === act.title.toLowerCase() ||
                (act.code && log.kegiatan?.toLowerCase() === act.code.toLowerCase())
            );

            return (
              <ActivityTable
                key={act.id}
                activity={act}
                logs={activityLogs}
                filterNis={filterNis}
                readOnly={readOnly}
                onOpenManualModal={onAddAttendance ? handleOpenManualModal : undefined}
                onUpdateAttendance={onUpdateAttendance}
                onDeleteAttendance={onDeleteAttendance}
              />
            );
          })}
        </div>
      )}

      {/* Modal Input Manual Izin / Alpha untuk Admin */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Catat Izin / Alpha Manual</h3>
                  <p className="text-xs text-on-surface-variant">Input kehadiran santri oleh pengurus / admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitManual} className="flex flex-col gap-3.5">
              {/* Pilih Kegiatan */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface font-semibold">Kegiatan</label>
                <select
                  value={selectedActivityTitle}
                  onChange={(e) => setSelectedActivityTitle(e.target.value)}
                  className="bg-surface-container-low text-on-surface rounded-xl px-3 py-2.5 text-xs outline-none cursor-pointer border border-outline-variant/30 focus:border-primary"
                >
                  {activities.map((a) => (
                    <option key={a.id} value={a.title}>
                      {a.title} ({a.time})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Santri */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface font-semibold">
                  Santri <span className="text-error">*</span>
                </label>
                {santriList.length === 0 ? (
                  <p className="text-xs text-error">Belum ada santri terdaftar di sistem.</p>
                ) : (
                  <select
                    required
                    value={selectedSantriId}
                    onChange={(e) => setSelectedSantriId(e.target.value)}
                    className="bg-surface-container-low text-on-surface rounded-xl px-3 py-2.5 text-xs outline-none cursor-pointer border border-outline-variant/30 focus:border-primary"
                  >
                    <option value="">-- Pilih Santri --</option>
                    {santriList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nis} - {s.nama} ({s.kelas})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status Kehadiran: Izin, Alfa, Sakit, Hadir */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-on-surface font-semibold">Status Presensi</label>
                <div className="grid grid-cols-4 gap-2">
                  {/* Izin */}
                  <button
                    type="button"
                    onClick={() => setManualStatus('Izin')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                      manualStatus === 'Izin'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500 shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                    <span>Izin</span>
                  </button>

                  {/* Alfa */}
                  <button
                    type="button"
                    onClick={() => setManualStatus('Alfa')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                      manualStatus === 'Alfa'
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500 shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    <span>Alfa</span>
                  </button>

                  {/* Sakit */}
                  <button
                    type="button"
                    onClick={() => setManualStatus('Sakit')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                      manualStatus === 'Sakit'
                        ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500 shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">medical_services</span>
                    <span>Sakit</span>
                  </button>

                  {/* Hadir */}
                  <button
                    type="button"
                    onClick={() => setManualStatus('Hadir')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                      manualStatus === 'Hadir'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500 shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Hadir</span>
                  </button>
                </div>
              </div>

              {/* Tanggal & Waktu */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface font-semibold">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-xs outline-none border border-outline-variant/30"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-on-surface font-semibold">Waktu / Jam</label>
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-xs outline-none border border-outline-variant/30"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface font-semibold">Keterangan / Alasan (Opsional)</label>
                <input
                  type="text"
                  value={manualKeterangan}
                  onChange={(e) => setManualKeterangan(e.target.value)}
                  placeholder="Cth: Izin pulang karena acara keluarga / sakit flu / dsb."
                  className="bg-surface-container-low text-on-surface rounded-xl px-3 py-2 text-xs outline-none border border-outline-variant/30 placeholder:text-outline"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={santriList.length === 0 || !selectedSantriId}
                  className={`px-5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm ${
                    santriList.length === 0 || !selectedSantriId
                      ? 'bg-surface-container text-outline cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-container text-on-primary cursor-pointer'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Simpan Presensi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl border border-inverse-on-surface/10">
            <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            <span className="text-xs font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
