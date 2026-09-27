import React from 'react';
import { PageView } from '../types';

interface PetugasViewProps {
  onNavigate: (page: PageView) => void;
}

export const PetugasView: React.FC<PetugasViewProps> = ({ onNavigate }) => {
  const officers = [
    {
      id: 'ptg-1',
      nama: 'Ustadz Wildan M.A.',
      role: 'Admin Utama & Kepala Biro Kedisiplinan',
      lokasi: 'Pusat Kontrol & Server Presensi',
      status: 'Aktif Bertugas',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6zwhlvaYqkHOHNZHX32bImp-KiXKZ57Fqtjo-NFyPswT8x2r9HqNWYGaDczb3-xG9IiCWibd_QZcaWwcbyZBw_97BQY0LfphOiypGJQi5uwt3Wo_DGIJcvqzFVr7dyuvs5x0apKAcwfbYS2kw-p_Buy6VQGqmfdGJLVMtxHwTKqkfdy4P714Eoi6pP3Y6HIgtzW2w2v2HK4zwoNUzYHCrBT-VeQH7JmdIXWGnDhbyUn3BUgV99ntT',
      totalScan: 1420
    },
    {
      id: 'ptg-2',
      nama: 'Ustadz Abdul Somad',
      role: 'Petugas Presensi Sesi 01 (Masjid Utama)',
      lokasi: 'Gerbang 1 & Selasar Timur Masjid',
      status: 'Aktif Bertugas',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB4JpySP1VYtthO9H1KGKVkpVTfDVI3Z8DXpQxlRiTPddOG2QSJoPCK8T4LQeqtJxnXFOWDFd81NbND_besne61LXCnwT7RpOxIcVkvtFxhj4vYsQuMyrVbCpcq4BP3lhSXiyJPrpZffxMHHn8kNyht_GJsn-V9uHvK4Yp2UXpmY8aP75LEfXzNPZJrCYbWO3YIAJ7S_fN5fXSslN7l-yaS__DxetZuCZ5zfOJOJdsrr3ETlu4_aqu',
      totalScan: 948
    },
    {
      id: 'ptg-3',
      nama: 'Ustadz Abdul Ghaffar',
      role: 'Petugas Presensi Subuh & Halaqah',
      lokasi: 'Pintu Sayap Kanan Masjid',
      status: 'Aktif Bertugas',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzF-seYoE13-JzQPb3zGBR-Lomg8AIN4K66wsPtJvpk2npPGiTUHzoqh2mXpcrYKxZ4cXiwtlGMcG6vnDmsEzZV4yD_l2ePv78X7M7PLg2kbd1RNqzNiKWr0ZLzns55DsOdawq4XB9jnbyWLOudIGGwSlodWYQiiYEEl9SMXQWkAs_6bSxQ78JBqhctTb_3anJ6Szvx7J9yDwUH8ldmPx_hdrh3LJadQvcjPdlQQDTPI6XawaucOVv',
      totalScan: 820
    },
    {
      id: 'ptg-4',
      nama: 'Ustadz Rahmat Hidayat',
      role: 'Petugas Pengawas Sholat Isya & Asrama',
      lokasi: 'Pintu Sayap Kiri Masjid',
      status: 'Aktif Bertugas',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE9BUoOyw5s-GxiXzPj0L8_iKkYJCDQLQsTxQ77wFhHxP0wgy15cF9-paQw0R6WAWVLQvf4qVdAblygPyi300Idy42k-T_6Zgq6EJK51eD3oFnSDs84fWKQTTb3pwg5yo5oZVfNC-mR6WmdKTBUvNLJB11s1xq96sRa-Q4f9UX6kG9KtOxM4Hnk0e3hmD-Pj3WyDlJuAddtvPgnkEAmTEdkhpK0mKlL-MTWR80qvrb_UMUQ_rrTtCS',
      totalScan: 654
    },
    {
      id: 'ptg-5',
      nama: 'Ustadzah Maryam',
      role: 'Pengawas Madrasah Diniyah Putri',
      lokasi: 'Gedung Madrasah Lantai 2',
      status: 'Standby',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeAtKjAUi5v36zW2Z4CeXYZ6hq6-QWZo2-FfEUprSXHa-OEYQcvs5EvTOYkElHFk58k7Lhx6hnNb7Qr7EfEyXJs0wJ0s-y_FOkQ4jMuYR3o87q1s93tjpR77Cxi7BUlp6uwmbzsIVFWcFdqng8BfgTNy7HvfNJ6Y-yyFtqnxCnjEn6yeTmY0rHs4dgdp4Wa55bh5WH5C7qR-yFhpUj15gvvnst8bnOUum2esVBMDXaLdRFuw7_7wsh',
      totalScan: 520
    }
  ];

  return (
    <div className="flex flex-col w-full gap-space-lg pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">shield_person</span>
            <span>Biro Kedisiplinan & Pengawas Presensi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Data Petugas Presensi</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Kelola hak akses scanner, penugasan titik gerbang optik, dan pengawas absensi santri.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Membuka modal pendaftaran petugas baru.')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all shadow-md self-start sm:self-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Tambah Petugas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {officers.map((off) => (
          <div
            key={off.id}
            className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <img
                src={off.avatar}
                alt={off.nama}
                className="w-12 h-12 rounded-xl object-cover shadow-sm ring-1 ring-primary/20 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-on-surface truncate">{off.nama}</span>
                <span className="text-[11px] text-primary font-semibold truncate">{off.role}</span>
                <span className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[13px] text-tertiary">place</span>
                  <span className="truncate">{off.lokasi}</span>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-surface-container/60 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-secondary font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse" />
                {off.status}
              </span>
              <span className="text-outline font-mono text-[11px]">{off.totalScan} Validasi</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
