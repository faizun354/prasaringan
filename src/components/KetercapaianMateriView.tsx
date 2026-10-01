import React, { useEffect, useState } from 'react';
import { Santri } from '../types';

export interface MateriProgress {
  santriId: string;
  alQuran: number;
  alHadist: number;
  spreadsheetUrl: string;
}

interface KetercapaianMateriViewProps {
  santriList: Santri[];
  progress: MateriProgress[];
  onSave: (data: MateriProgress) => Promise<void>;
}

const validSpreadsheetUrl = (value: string) => {
  if (!value.trim()) return true;
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; }
  catch { return false; }
};

export const KetercapaianMateriView: React.FC<KetercapaianMateriViewProps> = ({ santriList, progress, onSave }) => {
  const [drafts, setDrafts] = useState<Record<string, MateriProgress>>({});
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDrafts(Object.fromEntries(santriList.map((santri) => {
      const saved = progress.find((row) => row.santriId === santri.id);
      return [santri.id, saved || { santriId: santri.id, alQuran: 0, alHadist: 0, spreadsheetUrl: '' }];
    })));
  }, [santriList, progress]);

  const update = (santriId: string, field: keyof Omit<MateriProgress, 'santriId'>, value: string) => {
    setDrafts((previous) => ({
      ...previous,
      [santriId]: { ...previous[santriId], [field]: field === 'spreadsheetUrl' ? value : (value === '' ? 0 : Number(value)) },
    }));
  };

  const save = async (santriId: string) => {
    const data = drafts[santriId];
    if (!data || data.alQuran < 0 || data.alQuran > 100 || data.alHadist < 0 || data.alHadist > 100) {
      setMessage('Persentase harus di antara 0 sampai 100.'); return;
    }
    if (!validSpreadsheetUrl(data.spreadsheetUrl)) { setMessage('Link spreadsheet harus menggunakan alamat http atau https.'); return; }
    setSavingId(santriId); setMessage('');
    try { await onSave(data); setMessage('Perubahan berhasil disimpan.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Gagal menyimpan perubahan.'); }
    finally { setSavingId(''); }
  };

  return <section className="flex flex-col gap-5 pb-10">
    <header className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
      <span className="text-xs font-bold uppercase tracking-wider text-primary">Pemantauan Pembelajaran</span>
      <h1 className="mt-1 text-2xl font-bold text-on-surface sm:text-3xl">Ketercapaian Materi</h1>
      <p className="mt-2 text-sm text-on-surface-variant">Perbarui capaian materi dan tautan spreadsheet untuk setiap santri.</p>
    </header>
    {message && <p role="status" className="text-sm text-primary">{message}</p>}
    <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
      <table className="w-full min-w-[850px] table-fixed text-left">
        <colgroup><col className="w-[7%]"/><col className="w-[29%]"/><col className="w-[18%]"/><col className="w-[18%]"/><col className="w-[28%]"/></colgroup>
        <thead><tr className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant"><th className="p-4 text-center">Nomor</th><th className="p-4">Nama Santri</th><th className="p-4">Al Quran</th><th className="p-4">Al Hadist</th><th className="p-4">Link Spreadsheet</th></tr></thead>
        <tbody className="divide-y divide-outline-variant/30">
          {santriList.length === 0 ? <tr><td colSpan={5} className="p-10 text-center text-sm text-on-surface-variant">Data santri belum tersedia.</td></tr> : santriList.map((santri, index) => {
            const row = drafts[santri.id] || { santriId: santri.id, alQuran: 0, alHadist: 0, spreadsheetUrl: '' };
            const safeUrl = validSpreadsheetUrl(row.spreadsheetUrl) && row.spreadsheetUrl ? row.spreadsheetUrl : '';
            return <tr key={santri.id}>
              <td className="p-4 text-center text-sm font-semibold text-on-surface">{index + 1}</td>
              <td className="p-4 text-sm font-semibold text-on-surface">{santri.nama}<span className="mt-1 block text-xs font-normal text-on-surface-variant">{santri.nis}</span></td>
              <td className="p-4"><label className="flex items-center gap-2"><input aria-label={`Al Quran ${santri.nama} persen`} type="number" min="0" max="100" step="1" value={row.alQuran} onChange={(e) => update(santri.id, 'alQuran', e.target.value)} className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"/><span className="text-sm text-on-surface-variant">%</span></label></td>
              <td className="p-4"><label className="flex items-center gap-2"><input aria-label={`Al Hadist ${santri.nama} persen`} type="number" min="0" max="100" step="1" value={row.alHadist} onChange={(e) => update(santri.id, 'alHadist', e.target.value)} className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"/><span className="text-sm text-on-surface-variant">%</span></label></td>
              <td className="p-4"><input aria-label={`Link spreadsheet ${santri.nama}`} type="url" value={row.spreadsheetUrl} onChange={(e) => update(santri.id, 'spreadsheetUrl', e.target.value)} placeholder="https://..." className="mb-2 w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"/><div className="flex flex-wrap gap-2"><button type="button" disabled={!safeUrl} onClick={() => window.open(safeUrl, '_blank', 'noopener,noreferrer')} className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-on-secondary disabled:opacity-40">Buka Spreadsheet</button><button type="button" disabled={savingId === santri.id} onClick={() => void save(santri.id)} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary disabled:opacity-50">{savingId === santri.id ? 'Menyimpan...' : 'Simpan'}</button></div></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </section>;
};
