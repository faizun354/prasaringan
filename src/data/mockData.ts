import { Santri, Activity, AttendanceRecord } from '../types';

// Data santri dimulai kosong — isi melalui menu Tambah Santri
export const INITIAL_SANTRI_LIST: Santri[] = [];

// Kegiatan dimulai kosong — tambah melalui menu Kegiatan
export const INITIAL_ACTIVITIES: Activity[] = [];

// Log presensi dimulai kosong — terisi otomatis saat santri scan QR
export const INITIAL_ATTENDANCE_LOG: AttendanceRecord[] = [];
