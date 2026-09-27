import { Santri, Activity, AttendanceRecord } from '../types';

// API Base URL - default ke localhost:5000 saat development, atau dari import.meta.env
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface BackendStatus {
  online: boolean;
  database: string;
  host: string;
}

// ─── Cek Status Koneksi Backend / MySQL ──────────────────────────────────
export async function checkBackendStatus(): Promise<BackendStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error('Backend not reachable');
    const data = await res.json();
    return {
      online: data.status === 'connected',
      database: data.database || 'db_presensi_pondok',
      host: data.host || 'localhost'
    };
  } catch (e) {
    return {
      online: false,
      database: 'db_presensi_pondok',
      host: 'localhost'
    };
  }
}

// ─── Santri API ─────────────────────────────────────────────────────────
export async function apiGetSantri(): Promise<Santri[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/santri`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function apiSaveSantri(santri: Santri): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/santri`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(santri)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function apiDeleteSantri(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/santri/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// ─── Activities API ─────────────────────────────────────────────────────
export async function apiGetActivities(): Promise<Activity[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/activities`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function apiSaveActivity(activity: Activity): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function apiDeleteActivity(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// ─── Attendance API ─────────────────────────────────────────────────────
export async function apiGetAttendance(): Promise<AttendanceRecord[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/attendance`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function apiSaveAttendance(record: AttendanceRecord): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
