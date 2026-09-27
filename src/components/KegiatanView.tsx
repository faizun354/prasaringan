import React, { useState } from 'react';
import { Activity, PageView, Santri } from '../types';

interface KegiatanViewProps {
  activities: Activity[];
  santriList: Santri[];
  onNavigate: (page: PageView) => void;
  onAddActivity: (activity: Activity) => void;
  onUpdateActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onOpenScannerForActivity: (code: string) => void;
  readOnly?: boolean;
}

const ICON_OPTIONS = [
  { value: 'mosque', label: 'Masjid' },
  { value: 'menu_book', label: 'Kitab/Buku' },
  { value: 'auto_stories', label: 'Al-Quran' },
  { value: 'school', label: 'Madrasah' },
  { value: 'wb_twilight', label: 'Subuh' },
  { value: 'nights_stay', label: 'Malam' },
  { value: 'self_improvement', label: 'Kajian' },
  { value: 'sports_kabaddi', label: 'Olahraga' },
  { value: 'cleaning_services', label: 'Kebersihan' },
  { value: 'festival', label: 'Acara Khusus' },
];

const EMPTY_FORM = {
  title: '',
  time: '',
  location: '',
  petugas: '',
  status: 'Akan Datang' as Activity['status'],
  icon: 'mosque',
};

export const KegiatanView: React.FC<KegiatanViewProps> = ({
  activities,
  santriList,
  onNavigate,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onOpenScannerForActivity,
  readOnly = false
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const totalSantri = santriList.length;

  const filtered = activities.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingActivity(null);
    setShowForm(true);
  };

  const openEditForm = (act: Activity) => {
    setForm({
      title: act.title,
      time: act.time,
      location: act.location,
      petugas: act.petugas,
      status: act.status,
      icon: act.icon,
    });
    setEditingActivity(act);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title || !form.time || !form.location || !form.petugas) return;

    if (editingActivity) {
      onUpdateActivity({
        ...editingActivity,
        ...form,
        totalSantri,
      });
    } else {
      const code = `EVT-${new Date().getFullYear()}-${form.title.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`;
      onAddActivity({
        id: `act-${Date.now()}`,
        code,
        ...form,
        totalSantri,
        hadirCount: 0,
      });
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingActivity(null);
  };

  const handleDelete = (id: string) => {
    onDeleteActivity(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Jadwal & Agenda Ibadah / Pembelajaran</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Kegiatan Presensi Pondok</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {activities.length > 0
              ? `${activities.length} kegiatan terdaftar · ${activities.filter((a) => a.status === 'Sedang Berlangsung').length} sedang berlangsung`
              : 'Belum ada kegiatan. Tambahkan jadwal kegiatan presensi pondok.'}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap self-start sm:self-center">
          {!readOnly && (
            <button
              type="button"
              onClick={openAddForm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Tambah Kegiatan</span>
            </button>
          )}
          {activities.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const ongoing = activities.find((a) => a.status === 'Sedang Berlangsung');
                if (ongoing) {
                  onOpenScannerForActivity(ongoing.code);
                  onNavigate('presensi-scanner');
                } else {
                  onNavigate('presensi-scanner');
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high text-primary font-bold text-xs hover:bg-surface-container-highest transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>Buka Scanner</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      {activities.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'Sedang Berlangsung', 'Akan Datang', 'Selesai'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterStatus === status
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/30'
              }`}
            >
              {status === 'all' ? 'Semua Status' : status}
              {status !== 'all' && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-on-surface/10 text-[9px] font-bold">
                  {activities.filter((a) => a.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/30 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[36px]">event_busy</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">Belum Ada Kegiatan</h2>
            <p className="text-sm text-on-surface-variant mt-1 max-w-sm">
              Tambahkan jadwal kegiatan presensi seperti shalat berjamaah, kajian, atau KBM madrasah.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddForm}
            className="px-6 py-3 rounded-xl bg-primary text-on-primary text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Tambah Kegiatan Pertama
          </button>
        </div>
      )}

      {/* Activity Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {filtered.map((act) => {
            const percentage = act.totalSantri > 0 ? Math.round((act.hadirCount / act.totalSantri) * 100) : 0;
            const isOngoing = act.status === 'Sedang Berlangsung';

            return (
              <div
                key={act.id}
                className={`p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border transition-all hover:shadow-md flex flex-col justify-between gap-4 ${
                  isOngoing ? 'border-primary/40 ring-1 ring-primary/20' : 'border-outline-variant/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isOngoing
                          ? 'bg-primary text-on-primary shadow-md'
                          : act.status === 'Selesai'
                          ? 'bg-secondary/20 text-secondary'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">{act.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-on-surface">{act.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOngoing
                              ? 'bg-primary text-on-primary'
                              : act.status === 'Selesai'
                              ? 'bg-secondary/15 text-secondary'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {act.status}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {act.time}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">place</span>
                        {act.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono text-xs text-outline bg-surface-container px-2 py-0.5 rounded">{act.code}</span>
                    {!readOnly && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(act)}
                          className="p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-outline hover:text-primary"
                          title="Edit kegiatan"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(act.id)}
                          className="p-1 rounded-lg hover:bg-error/10 transition-colors cursor-pointer text-outline hover:text-error"
                          title="Hapus kegiatan"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress & Petugas */}
                <div className="pt-2 border-t border-surface-container/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">
                      Petugas: <strong className="text-on-surface">{act.petugas}</strong>
                    </span>
                    <span className="font-bold text-on-surface">
                      {act.hadirCount} / {act.totalSantri} ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isOngoing ? 'bg-primary' : 'bg-secondary'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenScannerForActivity(act.code);
                        onNavigate('presensi-scanner');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                      <span>Buka Scanner</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results for filter */}
      {activities.length > 0 && filtered.length === 0 && (
        <div className="text-center py-10 text-on-surface-variant">
          <span className="material-symbols-outlined text-[36px] text-outline/40">filter_list_off</span>
          <p className="text-sm mt-2">Tidak ada kegiatan dengan status "{filterStatus}"</p>
          <button onClick={() => setFilterStatus('all')} className="text-primary text-sm font-semibold mt-2 hover:underline cursor-pointer">
            Tampilkan semua
          </button>
        </div>
      )}

      {/* ─── Modal Tambah / Edit Kegiatan ──────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg border border-outline-variant/30 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-surface-container">
              <h2 className="font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  {editingActivity ? 'edit' : 'add_circle'}
                </span>
                {editingActivity ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
              </h2>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingActivity(null); }}
                className="p-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-outline"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {/* Nama Kegiatan */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Nama Kegiatan <span className="text-error">*</span></label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Cth: Shalat Subuh Berjamaah"
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface text-sm rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Waktu */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Waktu <span className="text-error">*</span></label>
                <input
                  type="text"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="Cth: 05:00 - 06:00 WIB"
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface text-sm rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Lokasi */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Lokasi <span className="text-error">*</span></label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Cth: Masjid Jami' Pesantren"
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface text-sm rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Petugas */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Petugas / Ustadz <span className="text-error">*</span></label>
                <input
                  type="text"
                  required
                  value={form.petugas}
                  onChange={(e) => setForm({ ...form, petugas: e.target.value })}
                  placeholder="Cth: Ustadz Ahmad Fauzi"
                  className="w-full h-11 px-4 bg-surface-container-low text-on-surface text-sm rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Status Kegiatan</label>
                <div className="flex gap-2 flex-wrap">
                  {(['Akan Datang', 'Sedang Berlangsung', 'Selesai'] as Activity['status'][]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        form.status === s
                          ? s === 'Sedang Berlangsung' ? 'bg-primary text-on-primary' :
                            s === 'Selesai' ? 'bg-secondary text-on-secondary' :
                            'bg-surface-container-highest text-on-surface'
                          : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Ikon Kegiatan</label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, icon: opt.value })}
                      title={opt.label}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        form.icon === opt.value
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{opt.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info jumlah santri */}
              <div className="p-3 rounded-xl bg-secondary-container/20 border border-secondary/20 text-xs text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[16px]">info</span>
                <span>
                  Kegiatan ini akan menggunakan <strong className="text-on-surface">{totalSantri} santri</strong> terdaftar sebagai acuan total presensi.
                  {totalSantri === 0 && ' Tambah santri terlebih dahulu agar presensi terintegrasi.'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 p-5 border-t border-surface-container">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingActivity(null); }}
                className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.title || !form.time || !form.location || !form.petugas}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  form.title && form.time && form.location && form.petugas
                    ? 'bg-primary text-on-primary hover:bg-primary-container cursor-pointer shadow-md'
                    : 'bg-surface-container text-outline cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {editingActivity ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Konfirmasi Hapus ─────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm border border-outline-variant/30 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Hapus Kegiatan?</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Kegiatan akan dihapus permanen. Data presensi terkait tidak akan terhapus.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-error text-on-error font-bold text-sm hover:bg-error/80 transition-colors cursor-pointer shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
