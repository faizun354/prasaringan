import React, { useState } from 'react';
import { PageView, Role } from '../types';

interface HeaderProps {
  onNavigate: (page: PageView) => void;
  onOpenMobileSidebar: () => void;
  role: Role;
  onLogout: () => void;
  onSearchGlobal?: (query: string) => void;
  userName?: string;
  userAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenMobileSidebar,
  role,
  onLogout,
  onSearchGlobal,
  userName,
  userAvatar
}) => {
  const [searchVal, setSearchVal] = useState('');

  const displayName = userName || (role === 'admin' ? 'Admin PPM' : 'Santri');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      if (onSearchGlobal) onSearchGlobal(searchVal);
      onNavigate('data-santri');
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-20 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-md lg:px-space-xl border-b border-surface-container-high/60">
      {/* Left: Mobile Menu Toggle & Search */}
      <div className="flex items-center gap-space-md">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
          title="Buka Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Quick Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden xl:flex items-center bg-surface-container-lowest rounded-xl px-space-md py-1.5 shadow-[0_2px_8px_-2px_rgba(45,42,53,0.04)] border border-outline-variant/40"
        >
          <span className="material-symbols-outlined text-outline mr-2 text-[18px]">search</span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Cari santri, kamar, atau kelas..."
            className="bg-transparent outline-none font-body-sm text-[13px] text-on-surface placeholder:text-outline w-64"
          />
        </form>
      </div>

      {/* Right: Static Profile Info (tanpa popup & tanpa tombol lonceng / bantuan) */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        <div className="flex items-center gap-space-sm p-1.5 rounded-xl bg-surface-container/60 border border-outline-variant/20">
          <div className="relative">
            {userAvatar ? (
              <img
                alt="Profile Avatar"
                src={userAvatar}
                className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-primary/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px] select-none">person</span>
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary rounded-full ring-2 ring-surface" />
          </div>
          <div className="hidden md:flex flex-col text-left pr-1">
            <span className="font-title-md text-[13px] font-semibold text-on-surface leading-tight">
              {displayName}
            </span>
            <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-semibold self-start mt-0.5">
              {role === 'admin' ? 'Admin Utama' : 'Santri'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
