import React, { useState } from 'react';

export interface PiketEntry {
  id: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  createdAt?: string;
}

interface PiketAmalsholihViewProps {
  entries: PiketEntry[];
  canUpload: boolean;
  onAdd: (entry: PiketEntry) => Promise<void>;
}

const compressImage = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Foto tidak dapat dibaca.'));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error('File yang dipilih bukan gambar yang valid.'));
    image.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      if (!context) return reject(new Error('Gagal memproses foto.'));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    image.src = String(reader.result);
  };
  reader.readAsDataURL(file);
});

export const PiketAmalsholihView: React.FC<PiketAmalsholihViewProps> = ({ entries, canUpload, onAdd }) => {
  const [beforeImage, setBeforeImage] = useState('');
  const [afterImage, setAfterImage] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const selectImage = async (file: File | undefined, setter: (value: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Pilih file gambar.'); return; }
    try { setter(await compressImage(file)); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Gagal memproses foto.'); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!beforeImage || !afterImage || !description.trim()) {
      setError('Lengkapi foto before, foto after, dan deskripsi.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onAdd({ id: `piket-${Date.now()}`, beforeImage, afterImage, description: description.trim() });
      setBeforeImage(''); setAfterImage(''); setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data.');
    } finally { setIsSaving(false); }
  };

  return (
    <section className="flex flex-col gap-5 pb-10">
      <header className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Dokumentasi Kegiatan</span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-on-surface">Piket Amalsholih</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Dokumentasi kondisi sebelum dan sesudah piket.</p>
      </header>

      {canUpload && <form onSubmit={submit} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 flex flex-col gap-4">
        <h2 className="font-bold text-on-surface">Tambah Dokumentasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {([{ label: 'Foto Before', value: beforeImage, set: setBeforeImage }, { label: 'Foto After', value: afterImage, set: setAfterImage }] as const).map((field) => (
            <label key={field.label} className="flex flex-col gap-2 text-sm font-semibold text-on-surface-variant">
              {field.label}
              <input type="file" accept="image/*" onChange={(e) => void selectImage(e.target.files?.[0], field.set)} className="text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-primary-fixed file:px-3 file:py-2 file:font-semibold file:text-primary" />
              {field.value && <img src={field.value} alt={`Pratinjau ${field.label}`} className="h-40 w-full rounded-xl object-cover" />}
            </label>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold text-on-surface-variant">Deskripsi
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000} className="w-full rounded-xl border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary" placeholder="Keterangan kegiatan piket..." />
        </label>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        <button disabled={isSaving} className="self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-60">{isSaving ? 'Menyimpan...' : 'Simpan Dokumentasi'}</button>
      </form>}

      <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
        <table className="w-full min-w-[760px] table-fixed text-left">
          <colgroup><col className="w-[7%]" /><col className="w-[34%]" /><col className="w-[34%]" /><col className="w-[25%]" /></colgroup>
          <thead><tr className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant"><th className="p-4 text-center">Nomor</th><th className="p-4">Foto Before</th><th className="p-4">Foto After</th><th className="p-4">Deskripsi</th></tr></thead>
          <tbody className="divide-y divide-outline-variant/30">
            {entries.length > 0 ? entries.map((entry, index) => (
              <tr key={entry.id} className="align-top">
                <td className="p-4 text-center font-semibold text-on-surface">{index + 1}</td>
                <td className="p-3"><img src={entry.beforeImage} alt={`Before ${index + 1}`} loading="lazy" className="w-full h-56 rounded-xl bg-surface-container object-cover" /></td>
                <td className="p-3"><img src={entry.afterImage} alt={`After ${index + 1}`} loading="lazy" className="w-full h-56 rounded-xl bg-surface-container object-cover" /></td>
                <td className="p-4 whitespace-pre-wrap break-words text-sm text-on-surface">{entry.description}</td>
              </tr>
            )) : <tr><td colSpan={4} className="p-10 text-center text-sm text-on-surface-variant">Belum ada dokumentasi piket amalsholih.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
};
