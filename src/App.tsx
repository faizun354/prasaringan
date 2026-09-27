/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PageView, Role, Santri, Activity, AttendanceRecord } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { DataSantriView } from './components/DataSantriView';
import { ScannerView } from './components/ScannerView';
import { LaporanView } from './components/LaporanView';
import { RegistrasiSantriView } from './components/RegistrasiSantriView';
import { KartuSantriView } from './components/KartuSantriView';
import { KegiatanView } from './components/KegiatanView';
import { PetugasView } from './components/PetugasView';
import { PengaturanView } from './components/PengaturanView';

// ─── Base URL API (auto-detect: proxy saat dev, sama-origin saat production) ─
const API_BASE = '/api';

// ─── Admin pages (role === 'admin' only) ───────────────────────────────────
const ADMIN_PAGES: PageView[] = [
  'dashboard',
  'data-santri',
  'kegiatan',
  'laporan',
  'petugas',
  'pengaturan',
  'registrasi-santri',
  'kartu-santri',
  'presensi-scanner'
];

// ─── Santri pages (role === 'santri') ──────────────────────────────────────
// Satu akun bersama untuk semua santri (mahasantri / mahasantri123)
const SANTRI_PAGES: PageView[] = [
  'dashboard',
  'presensi-scanner',
  'kegiatan',
  'data-santri',
  'laporan'
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>('admin');
  const [loggedInNis, setLoggedInNis] = useState<string>(''); // untuk santri: filter laporan
  const [currentPage, setCurrentPage] = useState<PageView>('login');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ─── Core state dari MySQL via API ──────────────────────────────────────
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // ─── Helper fetch JSON ────────────────────────────────────────────────
  const apiFetch = async (path: string, options?: RequestInit) => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  };

  // ─── Load semua data dari MySQL saat login berhasil ──────────────────
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [santriData, activitiesData, attendanceData] = await Promise.all([
        apiFetch('/santri'),
        apiFetch('/activities'),
        apiFetch('/attendance'),
      ]);
      setSantriList(santriData);
      setActivities(activitiesData);
      setAttendanceLogs(attendanceData);
      setDbConnected(true);
    } catch (err) {
      console.error('Gagal load data dari MySQL:', err);
      setDbConnected(false);
      // Fallback: pakai data dari localStorage jika server tidak tersedia
      try {
        const s = localStorage.getItem('pondok_santri_list');
        const a = localStorage.getItem('pondok_activities');
        const l = localStorage.getItem('pondok_attendance_logs');
        if (s) setSantriList(JSON.parse(s));
        if (a) setActivities(JSON.parse(a));
        if (l) setAttendanceLogs(JSON.parse(l));
      } catch (_) {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data segera setelah login
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);



  const [selectedCardSantri, setSelectedCardSantri] = useState<Santri | null>(null);
  const [activeActivityCode, setActiveActivityCode] = useState<string>('');

  // ─── Navigasi dengan role guard ────────────────────────────────────────
  const handleNavigate = (page: PageView) => {
    if (role === 'admin' && ADMIN_PAGES.includes(page)) {
      setCurrentPage(page);
      return;
    }
    if (role === 'santri' && SANTRI_PAGES.includes(page)) {
      setCurrentPage(page);
      return;
    }
    // Fallback ke halaman default sesuai role
    setCurrentPage(role === 'santri' ? 'dashboard' : 'dashboard');
  };

  // ─── Auth handlers ─────────────────────────────────────────────────────
  const handleLoginSuccess = (selectedRole: Role, nis?: string) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
    if (nis) setLoggedInNis(nis);
    setCurrentPage('dashboard');
  };

  const handleOpenDirectScanner = () => {
    setRole('santri');
    setIsAuthenticated(true);
    setCurrentPage('presensi-scanner');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole('admin');
    setLoggedInNis('');
    setCurrentPage('login');
  };

  // ─── Santri CRUD ───────────────────────────────────────────────────────
  const handleAddSantri = async (newSantri: Santri) => {
    // Optimistic update (tampil langsung di UI)
    setSantriList((prev) => [newSantri, ...prev]);
    // Simpan ke MySQL
    try {
      await apiFetch('/santri', {
        method: 'POST',
        body: JSON.stringify(newSantri),
      });
    } catch (err) {
      console.error('Gagal simpan santri ke MySQL:', err);
      // Fallback: simpan ke localStorage
      localStorage.setItem('pondok_santri_list', JSON.stringify([newSantri, ...santriList]));
    }
  };

  const handleDeleteSantri = async (id: string) => {
    setSantriList((prev) => prev.filter((s) => s.id !== id));
    setAttendanceLogs((prev) => prev.filter((log) => log.santriId !== id));
    try {
      await apiFetch(`/santri/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Gagal hapus santri dari MySQL:', err);
    }
  };

  // ─── Activity CRUD ─────────────────────────────────────────────────────
  const handleAddActivity = async (newActivity: Activity) => {
    setActivities((prev) => [newActivity, ...prev]);
    try {
      await apiFetch('/activities', {
        method: 'POST',
        body: JSON.stringify(newActivity),
      });
    } catch (err) {
      console.error('Gagal simpan kegiatan ke MySQL:', err);
    }
  };

  const handleUpdateActivity = async (updated: Activity) => {
    setActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    try {
      await apiFetch(`/activities/${updated.id}`, {
        method: 'PUT',
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Gagal update kegiatan di MySQL:', err);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    try {
      await apiFetch(`/activities/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Gagal hapus kegiatan dari MySQL:', err);
    }
  };

  // ─── Attendance ────────────────────────────────────────────────────────
  const handleAddAttendance = async (record: AttendanceRecord) => {
    // Optimistic update state lokal
    setAttendanceLogs((prev) => [record, ...prev]);

    if (record.status === 'Hadir') {
      setActivities((prev) =>
        prev.map((a) => {
          if (a.code === record.kegiatan || a.title === record.kegiatan) {
            return { ...a, hadirCount: a.hadirCount + 1 };
          }
          return a;
        })
      );
    }

    setSantriList((prev) =>
      prev.map((s) => {
        if (s.id === record.santriId) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return {
            ...s,
            lastScan: `Hari ini, ${timeStr} WIB`,
            totalHadir: record.status === 'Hadir' ? (s.totalHadir || 0) + 1 : (s.totalHadir || 0),
            totalIzin: record.status === 'Izin' ? (s.totalIzin || 0) + 1 : (s.totalIzin || 0),
            totalAlfa: record.status === 'Alfa' ? (s.totalAlfa || 0) + 1 : (s.totalAlfa || 0),
          };
        }
        return s;
      })
    );

    // Kirim ke MySQL
    try {
      await apiFetch('/attendance', {
        method: 'POST',
        body: JSON.stringify(record),
      });
    } catch (err) {
      console.error('Gagal catat presensi ke MySQL:', err);
    }
  };


  // ─── Guard: belum login ────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onOpenDirectScanner={handleOpenDirectScanner}
        santriList={santriList}
      />
    );
  }

  // ─── Loading screen saat fetch data dari MySQL ─────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-on-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-on-surface-variant font-medium">Memuat data dari database...</p>
      </div>
    );
  }

  const loggedInSantri = santriList.find((s) => s.nis.toUpperCase() === loggedInNis.toUpperCase());

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        role={role}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Header */}
        <Header
          onNavigate={handleNavigate}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          role={role}
          onLogout={handleLogout}
          userName={role === 'admin' ? 'Administrator Pondok' : 'Portal Mahasantri'}
          userAvatar={undefined}
        />

        {/* Status DB (hanya tampil jika tidak terhubung) */}
        {!dbConnected && (
          <div className="lg:pl-0 px-4 pt-16">
            <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-2 text-xs text-error flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">wifi_off</span>
              Mode Offline — server MySQL tidak terhubung. Data ditampilkan dari cache lokal.
            </div>
          </div>
        )}

        {/* Dynamic Page Viewport */}
        <main className="relative pt-24 px-space-md sm:px-space-lg lg:px-space-xl min-h-[calc(100vh-5rem)] w-full">
          {/* ─── ADMIN PAGES ─────────────────────────────────── */}
          {role === 'admin' && currentPage === 'dashboard' && (
            <DashboardView
              santriList={santriList}
              activities={activities}
              attendanceLogs={attendanceLogs}
              onNavigate={handleNavigate}
              onOpenScannerForActivity={(code) => {
                setActiveActivityCode(code);
                handleNavigate('presensi-scanner');
              }}
            />
          )}

          {role === 'admin' && currentPage === 'data-santri' && (
            <DataSantriView
              santriList={santriList}
              onNavigate={handleNavigate}
              onSelectSantriForCard={setSelectedCardSantri}
              onDeleteSantri={handleDeleteSantri}
            />
          )}

          {role === 'admin' && currentPage === 'kegiatan' && (
            <KegiatanView
              activities={activities}
              santriList={santriList}
              onNavigate={handleNavigate}
              onAddActivity={handleAddActivity}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
              onOpenScannerForActivity={(code) => {
                setActiveActivityCode(code);
                handleNavigate('presensi-scanner');
              }}
            />
          )}

          {role === 'admin' && currentPage === 'laporan' && (
            <LaporanView
              santriList={santriList}
              activities={activities}
              attendanceLogs={attendanceLogs}
              onAddAttendance={handleAddAttendance}
            />
          )}

          {role === 'admin' && currentPage === 'registrasi-santri' && (
            <RegistrasiSantriView
              onNavigate={handleNavigate}
              onSaveSantri={handleAddSantri}
              onSelectSantriForCard={setSelectedCardSantri}
            />
          )}

          {role === 'admin' && currentPage === 'kartu-santri' && (
            (selectedCardSantri || santriList[0]) ? (
              <KartuSantriView
                santri={selectedCardSantri || santriList[0]}
                santriList={santriList}
                onSelectSantri={setSelectedCardSantri}
                onNavigate={handleNavigate}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[36px]">badge</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Belum Ada Data Santri</h3>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                    Daftarkan santri terlebih dahulu di menu <strong>Tambah Santri</strong> untuk men-generate dan mencetak Kartu Tanda Santri dengan QR Code.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate('registrasi-santri')}
                  className="px-5 py-2.5 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:bg-primary-container transition-all cursor-pointer shadow-sm"
                >
                  + Tambah Santri Baru Sekarang
                </button>
              </div>
            )
          )}

          {role === 'admin' && currentPage === 'petugas' && (
            <PetugasView onNavigate={handleNavigate} />
          )}

          {role === 'admin' && currentPage === 'pengaturan' && (
            <PengaturanView />
          )}

          {/* ─── SANTRI PAGES (shared account: mahasantri) ─────── */}
          {role === 'santri' && currentPage === 'dashboard' && (
            <DashboardView
              santriList={santriList}
              activities={activities}
              attendanceLogs={attendanceLogs}
              onNavigate={handleNavigate}
              onOpenScannerForActivity={(code) => {
                setActiveActivityCode(code);
                handleNavigate('presensi-scanner');
              }}
            />
          )}

          {role === 'santri' && currentPage === 'kegiatan' && (
            <KegiatanView
              activities={activities}
              santriList={santriList}
              onNavigate={handleNavigate}
              onAddActivity={() => {}}
              onUpdateActivity={() => {}}
              onDeleteActivity={() => {}}
              onOpenScannerForActivity={(code) => {
                setActiveActivityCode(code);
                handleNavigate('presensi-scanner');
              }}
              readOnly={true}
            />
          )}

          {role === 'santri' && currentPage === 'data-santri' && (
            <DataSantriView
              santriList={santriList}
              onNavigate={handleNavigate}
              onSelectSantriForCard={setSelectedCardSantri}
              readOnly={true}
            />
          )}

          {role === 'santri' && currentPage === 'laporan' && (
            <LaporanView
              santriList={santriList}
              activities={activities}
              attendanceLogs={attendanceLogs}
              readOnly={true}
            />
          )}

          {/* ─── SHARED: Scanner (Admin & Santri) ─────────────── */}
          {currentPage === 'presensi-scanner' && (
            <ScannerView
              santriList={santriList}
              activities={activities}
              attendanceLogs={attendanceLogs}
              onAddAttendance={handleAddAttendance}
              activeActivityCode={activeActivityCode}
              role={role}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>
    </div>
  );
}
