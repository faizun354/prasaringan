import React, { useState } from 'react';
import { Role, Santri } from '../types';
import { APP_ASSETS } from '../config/assets';

// Kredensial admin — di produksi ini sebaiknya dari backend/env
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Kredensial santri — satu akun bersama untuk semua santri
const SANTRI_USERNAME = 'mahasantri';
const SANTRI_PASSWORD = 'mahasantri123';


interface LoginViewProps {
  onLoginSuccess: (role: Role, nis?: string) => void;
  santriList: Santri[];
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  santriList
}) => {
  const [role, setRole] = useState<Role>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (role === 'admin') {
        // Validasi admin — username & password
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          setIsLoading(false);
          setIsSuccess(true);
          setTimeout(() => onLoginSuccess('admin'), 700);
        } else {
          setIsLoading(false);
          setError('Username atau password admin salah. Hubungi IT Pesantren jika lupa.');
        }
      } else {
        // Santri login dengan akun bersama
        if (username.trim() === SANTRI_USERNAME && password.trim() === SANTRI_PASSWORD) {
          setIsLoading(false);
          setIsSuccess(true);
          setTimeout(() => onLoginSuccess('santri'), 700);
        } else {
          setIsLoading(false);
          setError('Username atau password santri salah. Gunakan akun portal yang diberikan pesantren.');
        }
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-3 sm:p-6 lg:p-10 font-body-md text-on-surface">
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-2xl shadow-[0_16px_40px_-8px_rgba(43,30,68,0.18)] overflow-hidden border border-outline-variant/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {/* Left Visual Panel */}
          <div className="lg:col-span-5 relative flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-primary via-primary-container to-surface-tint text-on-primary overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-inverse-primary/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none" />

            {/* Geometric Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" fill="currentColor" height="100%" width="100%">
                <defs>
                  <pattern id="pesantren-geom" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="20" cy="20" r="4" fill="currentColor" />
                    <path d="M0 0 L10 10 M30 30 L40 40 M40 0 L30 10 M10 30 L0 40" stroke="currentColor" strokeWidth="0.75" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#pesantren-geom)" />
              </svg>
            </div>

            {/* Header */}
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-3 mt-2">
                <div className="w-11 h-11 rounded-xl bg-on-primary flex items-center justify-center text-primary shadow-md overflow-hidden p-1">
                  {!logoError ? (
                    <img
                      src={APP_ASSETS.LOGO_APP}
                      alt="Logo Prasaringan"
                      className="w-full h-full object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[26px]">qr_code_scanner</span>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight leading-none text-on-primary">Prasaringan</h1>
                  <p className="text-[12px] text-on-primary-container/90 mt-1">PPM Al-Kautsar</p>
                </div>
              </div>
            </div>

            {/* Central Showcase */}
            <div className="relative z-10 my-6 flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-xl shadow-xl aspect-[16/9] w-full border border-on-primary/15 bg-black/20">
                <img
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  alt="Ilustrasi Login"
                  src={APP_ASSETS.LOGIN_IMAGE}
                  onError={(e) => {
                    // Fallback jika file lokal belum diganti
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-on-primary">
                  <p className="text-[14px] font-bold">Profesional Religius</p>
                  <p className="text-[11px] text-primary-fixed">Sarjana Mubalegh, Mubalegh yang Sarjana</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 bg-on-primary/10 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-on-primary/10">
                  <span className="material-symbols-outlined text-secondary-fixed text-[20px]">bolt</span>
                  <span className="text-[12px] text-on-primary font-medium">Presensi Real-time dan Terintegrasi</span>
                </div>
                <div className="flex items-center gap-2.5 bg-on-primary/10 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-on-primary/10">
                  <span className="material-symbols-outlined text-secondary-fixed text-[20px]">badge</span>
                  <span className="text-[12px] text-on-primary font-medium">Kartu QR Santri</span>
                </div>
                <div className="flex items-center gap-2.5 bg-on-primary/10 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-on-primary/10">
                  <span className="material-symbols-outlined text-secondary-fixed text-[20px]">insights</span>
                  <span className="text-[12px] text-on-primary font-medium">Laporan Rekap Otomatis</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 pt-3 border-t border-on-primary/15 flex items-center justify-between text-on-primary/80">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-fixed" />
                </span>
              </div>
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 bg-surface-container-lowest">
            <div>
              {/* Form Header */}
              <div className="flex items-center justify-between">
              </div>

              <div className="mt-4">
                <h2 className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">Masuk ke Sistem</h2>
                <p className="text-[13px] text-on-surface-variant mt-1">
                  Silakan masuk dengan akun Admin atau Santri
                </p>
              </div>

              {/* Role Switcher */}
              <div className="mt-5 p-1 bg-surface-container rounded-xl flex items-center">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] transition-all duration-200 cursor-pointer ${role === 'admin'
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface font-medium'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  Admin PPM
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('santri')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] transition-all duration-200 cursor-pointer ${role === 'santri'
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface font-medium'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">school</span>
                  Santri
                </button>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
                {/* Username / NIS */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-on-surface font-semibold flex items-center justify-between">
                    <span>{role === 'admin' ? 'Username Admin' : 'Username Portal Santri'}</span>
                    <span className="text-[11px] text-outline font-normal">
                      {role === 'admin' ? 'Akses Administrator' : 'Akun bersama pesantren'}
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      {role === 'admin' ? 'account_circle' : 'group'}
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(''); }}
                      placeholder={role === 'admin' ? 'Masukkan username admin' : 'Masukkan username portal santri'}
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest text-on-surface text-[14px] rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password / QR Token */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-on-surface font-semibold flex items-center justify-between">
                    <span>{role === 'admin' ? 'Password' : 'Password Portal'}</span>
                    {role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => alert('Hubungi IT Pesantren untuk reset password admin.')}
                        className="text-[11px] text-primary hover:underline cursor-pointer"
                      >
                        Lupa Password?
                      </button>
                    )}
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                      {role === 'admin' ? 'lock' : 'lock_person'}
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder={role === 'admin' ? 'Masukkan password' : 'Masukkan password portal santri'}
                      className="w-full h-11 pl-11 pr-11 bg-surface-container-lowest text-on-surface text-[14px] rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 p-1.5 text-outline hover:text-on-surface rounded-full transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-error-container border border-error/20">
                    <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">error</span>
                    <p className="text-[12px] text-error font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-12 rounded-lg font-semibold text-[14px] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${isSuccess
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-primary hover:bg-primary-container text-on-primary'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      <span>Memverifikasi...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      <span>Berhasil Masuk</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">login</span>
                      <span>{role === 'admin' ? 'Masuk ke Dashboard Admin' : 'Masuk ke Akun Santri'}</span>
                    </>
                  )}
                </button>
              </form>

            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-2 text-outline text-[11px]">
              <span>© 2026 PPM Al-Kautsar • Hak Cipta Dilindungi</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => alert('Pusat Bantuan: Hubungi WhatsApp 0812-3456-7890')} className="hover:text-primary transition-colors cursor-pointer">
                  Pusat Bantuan
                </button>
                <span>•</span>
                <button type="button" onClick={() => alert('Data santri dilindungi enkripsi SHA-256.')} className="hover:text-primary transition-colors cursor-pointer">
                  Privasi Santri
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
