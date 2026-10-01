export type Role = 'admin' | 'santri';

export type PageView =
  | 'login'
  | 'dashboard'
  | 'data-santri'
  | 'kegiatan'
  | 'presensi-scanner'
  | 'laporan'
  | 'piket-amalsholih'
  | 'ketercapaian-materi'
  | 'petugas'
  | 'pengaturan'
  | 'registrasi-santri'
  | 'kartu-santri';

export type SantriStatus = 'Aktif' | 'Izin Pulang' | 'Non-Aktif';

export interface Santri {
  id: string;
  nis: string;
  nisn?: string;
  nama: string;
  gender: 'Putra' | 'Putri';
  angkatan: string;
  kelas: string;
  jenjang: string;
  kamar: string;
  komplek: string;
  status: SantriStatus;
  fotoUrl: string;
  qrToken: string;
  nik?: string;
  hafalan?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  namaWali?: string;
  noHpWali?: string;
  alamat?: string;
  totalHadir?: number;
  totalIzin?: number;
  totalSakit?: number;
  totalAlfa?: number;
  persentase?: number;
  statusDisiplin?: 'Sangat Disiplin' | 'Baik' | 'Perlu Perhatian';
  lastScan?: string;
}

export interface AttendanceRecord {
  id: string;
  santriId: string;
  nis: string;
  nama: string;
  kelas: string;
  kamar: string;
  fotoUrl: string;
  kegiatan: string;
  timestamp: string; // e.g., '19:42:31'
  date: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';
  keterangan?: string;
  sensorLocation: string;
  petugas: string;
}

export interface Activity {
  id: string;
  code: string;
  title: string;
  time: string;
  location: string;
  status: 'Selesai' | 'Sedang Berlangsung' | 'Akan Datang';
  totalSantri: number;
  hadirCount: number;
  petugas: string;
  icon: string;
}
