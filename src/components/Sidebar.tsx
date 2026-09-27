import React, { useState } from 'react';
import { PageView, Role } from '../types';
import { APP_ASSETS } from '../config/assets';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  role: Role;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  role,
  onLogout
}) => {
  const [logoLoadError, setLogoLoadError] = useState(false);
  const navItem = (page: PageView, label: string, icon: string) => {
    const isActive =
      currentPage === page ||
      (page === 'data-santri' && (currentPage === 'registrasi-santri' || currentPage === 'kartu-santri'));

    return (
      <button
        type="button"
        key={page}
        onClick={() => {
          onNavigate(page);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-left transition-all duration-200 cursor-pointer ${isActive
          ? 'bg-primary text-on-primary font-semibold shadow-[0_4px_16px_-4px_rgba(107,74,165,0.25)]'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
          }`}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <span className="text-[14px] leading-tight">{label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-space-lg transition-transform duration-300 lg:translate-x-0 ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex flex-col gap-space-lg overflow-y-auto">
          {/* Logo & Brand */}
          <div className="px-space-lg flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm shrink-0 overflow-hidden">
              {!logoLoadError ? (
                <img
                  src={APP_ASSETS.LOGO_APP}
                  alt="Logo Prasaringan"
                  className="w-full h-full object-cover"
                  onError={() => setLogoLoadError(true)}
                />
              ) : (
                <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-[18px] font-bold text-primary leading-none">
                Prasaringan
              </span>
              <span className="font-label-sm text-[11px] text-on-surface-variant tracking-wider uppercase mt-1">
                {role === 'admin' ? 'Panel Admin' : 'Portal Santri'}
              </span>
            </div>
          </div>

          {/* Menu Navigasi Berdasarkan Role */}
          {role === 'admin' ? (
            /* Menu Utama Admin — tanpa menu pengaturan sistem */
            <div className="px-space-md">
              <div className="px-space-sm pb-space-xs font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
                Menu Utama
              </div>
              <nav className="flex flex-col gap-1">
                {navItem('dashboard', 'Dashboard', 'dashboard')}
                {navItem('data-santri', 'Data Santri', 'school')}
                {navItem('kegiatan', 'Kegiatan', 'event_available')}
                {navItem('presensi-scanner', 'Presensi (QR Scanner)', 'qr_code_scanner')}
                {navItem('laporan', 'Laporan Presensi', 'bar_chart')}
              </nav>
            </div>
          ) : (
            /* Menu Khusus Santri — 5 halaman */
            <div className="px-space-md">
              <div className="px-space-sm pb-space-xs font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
                Menu Santri
              </div>
              <nav className="flex flex-col gap-1">
                {navItem('dashboard', 'Dashboard', 'dashboard')}
                {navItem('presensi-scanner', 'Presensi (QR Scanner)', 'qr_code_scanner')}
                {navItem('kegiatan', 'Kegiatan', 'event_available')}
                {navItem('data-santri', 'Data Santri', 'school')}
                {navItem('laporan', 'Laporan Presensi', 'bar_chart')}
              </nav>
            </div>
          )}
        </div>

        {/* Server Status & Quick Logout */}
        <div className="px-space-md flex flex-col gap-2">
          <button
            onClick={onLogout}
            type="button"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs text-outline hover:text-error hover:bg-error-container/20 rounded-xl transition-colors cursor-pointer border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Keluar Akun ({role === 'admin' ? 'Admin' : 'Santri'})</span>
          </button>
        </div>
      </aside>
    </>
  );
};
