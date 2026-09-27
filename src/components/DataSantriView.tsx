import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { PageView, Santri } from '../types';
import { QRCodeView, generateQRCodeDataUrl } from './QRCodeView';

const ITEMS_PER_PAGE = 10;

interface DataSantriViewProps {
  santriList: Santri[];
  onNavigate: (page: PageView) => void;
  onSelectSantriForCard: (santri: Santri) => void;
  onDeleteSantri?: (id: string) => void;
  readOnly?: boolean;
}

export const DataSantriView: React.FC<DataSantriViewProps> = ({
  santriList,
  onNavigate,
  onSelectSantriForCard,
  onDeleteSantri,
  readOnly = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [modalSantri, setModalSantri] = useState<Santri | null>(null);
  const [deleteConfirmSantri, setDeleteConfirmSantri] = useState<Santri | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedKelas('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const filteredSantri = useMemo(() => {
    return santriList.filter((s) => {
      const matchSearch =
        searchTerm === '' ||
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.kelas.toLowerCase().includes(searchTerm.toLowerCase());

      const matchKelas = selectedKelas === '' || s.kelas === selectedKelas;
      const matchStatus = selectedStatus === '' || s.status === selectedStatus;

      return matchSearch && matchKelas && matchStatus;
    });
  }, [santriList, searchTerm, selectedKelas, selectedStatus]);

  const availableKelas = useMemo(() => {
    return Array.from(new Set(santriList.map((s) => s.kelas).filter(Boolean)));
  }, [santriList]);

  const totalPages = Math.ceil(filteredSantri.length / ITEMS_PER_PAGE);

  const paginatedSantri = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSantri.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSantri, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const startIndex = filteredSantri.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredSantri.length);

  const handleExportExcel = () => {
    if (santriList.length === 0) {
      showToast('Tidak ada data santri untuk diekspor');
      return;
    }

    const data = santriList.map((s, idx) => ({
      'No': idx + 1,
      'NIS': s.nis,
      'Nama Santri': s.nama,
      'Kelas': s.kelas,
      'Angkatan': s.angkatan || '-',
      'Nama Wali': s.namaWali || '-',
      'Status': s.status,
      'Total Hadir': s.totalHadir || 0,
      'Total Izin': s.totalIzin || 0,
      'Total Sakit': s.totalSakit || 0,
      'Total Alfa': s.totalAlfa || 0,
      'Persentase': `${s.persentase || 100}%`,
      'Terakhir Scan': s.lastScan || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 28 },
      { wch: 12 },
      { wch: 12 },
      { wch: 24 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 22 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Santri');
    XLSX.writeFile(workbook, `Data_Santri_${Date.now()}.xlsx`);
    showToast('Data master santri berhasil diekspor ke file Excel (.xlsx)');
  };

  const handleDeleteConfirm = (santri: Santri) => {
    setDeleteConfirmSantri(santri);
  };

  const handleDeleteExecute = () => {
    if (deleteConfirmSantri) {
      if (onDeleteSantri) {
        onDeleteSantri(deleteConfirmSantri.id);
      }
      showToast(`Data santri ${deleteConfirmSantri.nama} berhasil dihapus`);
      setDeleteConfirmSantri(null);
    }
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Header Banner */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/30 mb-space-lg">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-secondary-fixed/25 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-lg">
          <div className="flex flex-col">
            <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Data Santri
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!readOnly && (
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 text-xs font-semibold cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">file_upload</span>
                <span>Import Excel</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={() => showToast('File data santri Excel berhasil divalidasi dan diimpor!')}
                />
              </label>
            )}

            {!readOnly && (
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 text-xs font-semibold cursor-pointer"
                title="Unduh master data santri dalam format Microsoft Excel (.xlsx)"
              >
                <span className="material-symbols-outlined text-[18px]">table_view</span>
                <span>Export Excel</span>
              </button>
            )}

            {!readOnly && (
              <button
                type="button"
                onClick={() => onNavigate('registrasi-santri')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all duration-200 shadow-[0_4px_16px_-4px_rgba(26,111,186,0.3)] text-xs font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>+ Tambah Santri</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col gap-3 mb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Cari nama, NIS/ID, kamar, atau kelas..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-outline-variant"
            />
          </div>

          {/* Dropdowns */}
          <div className="md:col-span-7 flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={selectedKelas}
              onChange={(e) => { setSelectedKelas(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-auto flex-1 px-3 py-2 rounded-lg bg-surface-container-low text-xs text-on-surface cursor-pointer focus:outline-none"
            >
              <option value="">Semua Kelas</option>
              {availableKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-auto flex-1 px-3 py-2 rounded-lg bg-surface-container-low text-xs text-on-surface cursor-pointer focus:outline-none"
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Izin Pulang">Izin Pulang</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>

            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Reset Filter"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 w-10 text-center">No</th>
                <th className="py-3 px-4">ID / NIS</th>
                <th className="py-3 px-4">Nama Santri</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">QR Code</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60 text-on-surface text-xs">
              {paginatedSantri.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-outline text-sm">
                    <span className="material-symbols-outlined text-[48px] block mb-2 opacity-30">person_search</span>
                    Tidak ada data santri yang ditemukan
                  </td>
                </tr>
              ) : (
                paginatedSantri.map((s, index) => (
                  <tr key={s.id} className="hover:bg-surface-container-low/70 transition-colors">
                    <td className="py-3 px-4 text-center text-outline font-medium">
                      {String((currentPage - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded">
                        {s.nis}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-surface shrink-0"
                          alt={s.nama}
                          src={s.fotoUrl}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface text-[13px] leading-snug">{s.nama}</span>
                          <div className="flex items-center gap-1 mt-0.5 text-[11px]">
                            <span className="text-primary font-medium">Santri {s.gender}</span>
                            <span className="text-outline">•</span>
                            <span className="text-on-surface-variant">Angkatan {s.angkatan}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-surface-container text-xs text-on-surface font-semibold">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${s.status === 'Aktif'
                          ? 'bg-secondary-container/30 text-secondary'
                          : s.status === 'Izin Pulang'
                            ? 'bg-tertiary-fixed/60 text-tertiary-container'
                            : 'bg-error-container text-error'
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${s.status === 'Aktif'
                            ? 'bg-secondary'
                            : s.status === 'Izin Pulang'
                              ? 'bg-tertiary-container'
                              : 'bg-error'
                            }`}
                        />
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setModalSantri(s)}
                        className="group flex items-center gap-1.5 p-1 pr-2 rounded-lg hover:bg-surface-container transition-all cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded bg-surface-container-high flex items-center justify-center p-1 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
                            <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h-4v2h2v4h-2v2h4v-4h2v-2h-2v-2zm-4-4h4v2h-4v-2zm6 2h2v4h-2v-4zm-4 4h2v2h-2v-2zm-6-2h2v2H8v-2zm0-4h2v2H8v-2zm2-2h2v2h-2V8z" />
                          </svg>
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-on-surface-variant group-hover:text-primary transition-colors">
                          {s.qrToken.slice(0, 8)}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleDeleteConfirm(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-error hover:bg-error-container/40 border border-error/30 hover:border-error/60 transition-all cursor-pointer text-[11px] font-semibold"
                          title="Hapus Data"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          <span>Hapus</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer - Pagination */}
        <div className="px-4 py-3 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-container/60">
          <div className="flex items-center gap-1 text-on-surface-variant text-xs">
            <span>Menampilkan</span>
            <span className="font-semibold text-on-surface">
              {startIndex} – {endIndex}
            </span>
            <span>dari</span>
            <span className="font-semibold text-on-surface">{filteredSantri.length}</span>
            <span>santri</span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              {getPageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="w-6 flex items-center justify-center text-outline text-xs">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p as number)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                      currentPage === p
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QR Preview Modal */}
      {modalSantri && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl p-6 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setModalSantri(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-1 text-primary mb-1">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="text-[11px] uppercase font-bold tracking-wider">Identitas Resmi Pesantren</span>
            </div>

            <h3 className="text-xl font-bold text-on-surface text-center mb-1">
              {modalSantri.nama}
            </h3>

            <div className="flex items-center gap-1.5 mb-4">
              <span className="font-mono text-xs font-semibold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded">
                {modalSantri.nis}
              </span>
              <span className="text-xs bg-surface-container text-on-surface px-2 py-0.5 rounded">
                Kelas {modalSantri.kelas}
              </span>
              <span className="text-xs bg-surface-container text-on-surface px-2 py-0.5 rounded">
                Angkatan {modalSantri.angkatan}
              </span>
            </div>

            {/* QR Visual */}
            <div className="p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/40 flex flex-col items-center justify-center mb-4">
              <div className="p-3 bg-white rounded-xl shadow-md flex items-center justify-center">
                <QRCodeView value={modalSantri.qrToken || modalSantri.nis} size={192} className="bg-white" />
              </div>
              <span className="font-mono text-xs text-outline tracking-widest mt-2">
                TOKEN: {modalSantri.qrToken}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-center text-on-surface-variant text-xs mb-5">
              <span className="material-symbols-outlined text-[18px] text-secondary">lock</span>
              <span>Enkripsi QR Presensi Permanen (300 DPI)</span>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const url = await generateQRCodeDataUrl(modalSantri.qrToken || modalSantri.nis, 600);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `QR_${modalSantri.nis}_${modalSantri.nama.replace(/\s+/g, '_')}.png`;
                  a.click();
                  showToast(`QR Code ${modalSantri.nama} berhasil diunduh (PNG)!`);
                  setModalSantri(null);
                } catch (e) {
                  showToast('Gagal mengunduh QR Code');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Unduh QR Code (PNG)</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSantri && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[28px]">delete_forever</span>
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-on-surface mb-1">Hapus Data Santri?</h3>
              <p className="text-xs text-on-surface-variant">
                Data santri <span className="font-semibold text-on-surface">{deleteConfirmSantri.nama}</span> dengan NIS{' '}
                <span className="font-mono font-semibold text-primary">{deleteConfirmSantri.nis}</span> akan dihapus secara permanen dan tidak dapat dikembalikan.
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmSantri(null)}
                className="py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteExecute}
                className="py-2.5 rounded-xl bg-error hover:bg-error/80 text-on-error font-semibold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
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
