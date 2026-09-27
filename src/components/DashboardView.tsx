import React from 'react';
import { PageView, Santri, Activity, AttendanceRecord } from '../types';

interface DashboardViewProps {
  santriList: Santri[];
  activities: Activity[];
  attendanceLogs?: AttendanceRecord[];
  onNavigate: (page: PageView) => void;
  onOpenScannerForActivity?: (activityCode: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  santriList,
  activities,
  onNavigate,
  onOpenScannerForActivity
}) => {
  // ─── Stats dihitung dari data nyata ───────────────────────────────────
  const totalSantri = santriList.length;
  const aktif = santriList.filter((s) => s.status === 'Aktif').length;
  const izinPulang = santriList.filter((s) => s.status === 'Izin Pulang').length;
  const nonAktif = santriList.filter((s) => s.status === 'Non-Aktif').length;

  const totalKegiatan = activities.length;
  const kegiatanBerlangsung = activities.filter((a) => a.status === 'Sedang Berlangsung').length;

  // Kegiatan berlangsung / akan datang / selesai (prioritas tampil di dashboard)
  const featuredActivities = [
    ...activities.filter((a) => a.status === 'Sedang Berlangsung'),
    ...activities.filter((a) => a.status === 'Akan Datang'),
    ...activities.filter((a) => a.status === 'Selesai')
  ];

  const isEmpty = totalSantri === 0 && totalKegiatan === 0;

  return (
    <div className="flex flex-col w-full gap-space-lg pb-10">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm relative overflow-hidden border border-outline-variant/30">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-1 z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-primary-fixed text-primary">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </span>
            <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Dashboard Presensi
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            {isEmpty
              ? 'Belum ada data — mulai dengan menambah santri dan kegiatan.'
              : `${totalSantri} santri terdaftar • ${totalKegiatan} kegiatan terdaftar`}
          </p>
        </div>

        <div className="flex items-center gap-space-sm z-10 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('presensi-scanner')}
            className="flex items-center gap-2 px-space-md py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all duration-200 font-semibold text-sm cursor-pointer shadow-md hover:shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            <span>Mulai Scanner QR</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[36px]">rocket_launch</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">Sistem Siap Digunakan</h2>
            <p className="text-sm text-on-surface-variant mt-1 max-w-md">
              Data santri dan kegiatan masih kosong. Mulai dengan menambah santri melalui menu <strong>Tambah Santri</strong>, lalu tambahkan jadwal kegiatan di menu <strong>Kegiatan</strong>.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => onNavigate('registrasi-santri')}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Tambah Santri Pertama
            </button>
            <button
              type="button"
              onClick={() => onNavigate('kegiatan')}
              className="px-4 py-2.5 rounded-xl bg-surface-container-high text-primary text-sm font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Tambah Kegiatan
            </button>
          </div>
        </div>
      )}

      {!isEmpty && (
        <div className="flex flex-col gap-space-lg">
          {/* Stat Cards: Total Santri & Total Kegiatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {/* Box Total Santri */}
            <div
              onClick={() => onNavigate('data-santri')}
              className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-outline-variant/30 cursor-pointer"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-outline uppercase tracking-wider font-semibold">Total Santri</span>
                  <span className="text-4xl font-extrabold text-on-surface mt-1 leading-none">{totalSantri}</span>
                  <span className="text-xs text-on-surface-variant mt-3 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {aktif} Aktif
                    <span className="text-outline/40">•</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> {izinPulang} Izin
                    <span className="text-outline/40">•</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> {nonAktif} Non-Aktif
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed/60 flex items-center justify-center text-primary shadow-inner">
                  <span className="material-symbols-outlined text-3xl">school</span>
                </div>
              </div>
            </div>

            {/* Box Total Kegiatan */}
            <div
              onClick={() => onNavigate('kegiatan')}
              className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-outline-variant/30 cursor-pointer"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-secondary" />
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-outline uppercase tracking-wider font-semibold">Total Kegiatan</span>
                  <span className="text-4xl font-extrabold text-on-surface mt-1 leading-none">{totalKegiatan}</span>
                  <span className="text-xs text-secondary mt-3 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse" />
                    {kegiatanBerlangsung} kegiatan berlangsung saat ini
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-secondary-fixed/50 flex items-center justify-center text-secondary shadow-inner">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                </div>
              </div>
            </div>
          </div>

          {/* Box Kegiatan Presensi */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[22px]">event_available</span>
                </div>
                <div>
                  <h2 className="text-lg text-on-surface font-bold">Kegiatan Presensi</h2>
                  <span className="text-xs text-on-surface-variant">{totalKegiatan} kegiatan terdaftar di sistem</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('kegiatan')}
                className="text-xs text-primary hover:text-primary-container font-semibold flex items-center gap-1 cursor-pointer bg-primary-fixed/30 hover:bg-primary-fixed/50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Lihat Semua Kegiatan</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>

            {featuredActivities.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[40px] text-outline/50">event_busy</span>
                <p className="text-sm text-center">
                  Belum ada jadwal kegiatan.<br />
                  <button onClick={() => onNavigate('kegiatan')} className="text-primary font-semibold hover:underline cursor-pointer mt-1">
                    Tambah kegiatan baru →
                  </button>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                {featuredActivities.map((act) => {
                  const isOngoing = act.status === 'Sedang Berlangsung';
                  const pct = act.totalSantri > 0 ? Math.round((act.hadirCount / act.totalSantri) * 100) : 0;
                  return (
                    <div
                      key={act.id}
                      className={`p-space-md rounded-xl flex flex-col justify-between gap-3 border transition-all ${
                        isOngoing
                          ? 'bg-primary-fixed/20 border-primary/20 shadow-sm'
                          : 'bg-surface-container-low/60 border-outline-variant/20 hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isOngoing ? 'bg-primary text-on-primary shadow-sm' : 'bg-secondary/20 text-secondary'
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">{act.icon || 'event'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[14px] font-semibold truncate ${isOngoing ? 'text-primary font-bold' : 'text-on-surface'}`}>
                              {act.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOngoing ? 'bg-primary text-on-primary' :
                              act.status === 'Selesai' ? 'bg-secondary/15 text-secondary' :
                              'bg-surface-container-high text-on-surface-variant'
                            }`}>
                              {act.status}
                            </span>
                          </div>
                          <span className="text-xs text-on-surface-variant mt-1 flex items-center gap-1 truncate">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {act.time} · {act.location}
                          </span>
                        </div>
                      </div>

                      {/* Progress Hadir */}
                      <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/15">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-on-surface-variant font-medium">Kehadiran:</span>
                          <span className="font-bold text-on-surface">
                            {act.hadirCount} <span className="text-on-surface-variant font-normal">/ {act.totalSantri} ({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isOngoing ? 'bg-primary' : 'bg-secondary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Action for Ongoing */}
                      {isOngoing && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenScannerForActivity) onOpenScannerForActivity(act.code);
                              onNavigate('presensi-scanner');
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                            <span>Buka Scanner Presensi</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
