import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Dokumentasi foto Piket Amalsholih
const ensurePiketTable = () => pool.query(`CREATE TABLE IF NOT EXISTS piket_amalsholih (
  id VARCHAR(60) PRIMARY KEY,
  before_image LONGTEXT NOT NULL,
  after_image LONGTEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

app.get('/api/piket-amalsholih', async (_req, res) => {
  try {
    await ensurePiketTable();
    const [rows] = await pool.query('SELECT id, before_image, after_image, description, created_at FROM piket_amalsholih ORDER BY created_at DESC');
    res.json(rows.map((row) => ({ id: row.id, beforeImage: row.before_image, afterImage: row.after_image, description: row.description, createdAt: row.created_at })));
  } catch (error) {
    console.error('Error fetch Piket Amalsholih:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/piket-amalsholih', async (req, res) => {
  const { id, beforeImage, afterImage, description } = req.body;
  if (!id || !String(beforeImage || '').startsWith('data:image/') || !String(afterImage || '').startsWith('data:image/') || !String(description || '').trim()) {
    return res.status(400).json({ error: 'Foto before, foto after, dan deskripsi wajib diisi.' });
  }
  try {
    await ensurePiketTable();
    await pool.query('INSERT INTO piket_amalsholih (id, before_image, after_image, description) VALUES (?, ?, ?, ?)', [id, beforeImage, afterImage, description.trim()]);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error save Piket Amalsholih:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── 1. Health & Connection Check ──────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const isConnected = await testConnection();
  res.json({
    status: isConnected ? 'connected' : 'disconnected',
    database: process.env.DB_NAME || 'db_presensi_pondok',
    host: process.env.DB_HOST || 'localhost',
    timestamp: new Date().toISOString()
  });
});

// ─── 2. Auth Endpoint ──────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT id, username, role, nama FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      const user = rows[0];
      // Jika role cocok atau admin login
      if (!role || user.role === role || user.role === 'admin') {
        return res.json({ success: true, user });
      }
    }

    // Fallback bawaan jika database belum diisi
    if (username === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        user: { id: 1, username: 'admin', role: 'admin', nama: 'Administrator Pesantren' }
      });
    }

    if (username === 'mahasantri' && password === 'mahasantri123') {
      return res.json({
        success: true,
        user: { id: 2, username: 'mahasantri', role: 'santri', nama: 'Portal Umum Santri' }
      });
    }

    return res.status(401).json({ success: false, message: 'Username atau password salah!' });
  } catch (error) {
    console.error('Login error:', error);
    // Fallback jika DB error
    if (username === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        user: { id: 1, username: 'admin', role: 'admin', nama: 'Administrator' }
      });
    }
    if (username === 'mahasantri' && password === 'mahasantri123') {
      return res.json({
        success: true,
        user: { id: 2, username: 'mahasantri', role: 'santri', nama: 'Portal Santri' }
      });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server database' });
  }
});

// ─── 3. Santri Endpoints ───────────────────────────────────────────────
// GET Semua Santri
app.get('/api/santri', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM santri ORDER BY created_at DESC');
    // Map snake_case ke camelCase
    const formatted = rows.map((r) => ({
      id: r.id,
      nis: r.nis,
      nama: r.nama,
      gender: r.gender,
      angkatan: r.angkatan,
      kelas: r.kelas,
      jenjang: r.jenjang || 'Santri',
      status: r.status,
      fotoUrl: r.foto_url,
      qrToken: r.qr_token,
      namaWali: r.nama_wali,
      totalHadir: r.total_hadir,
      totalIzin: r.total_izin,
      totalSakit: r.total_sakit,
      totalAlfa: r.total_alfa,
      persentase: r.persentase,
      statusDisiplin: r.status_disiplin,
      lastScan: r.last_scan
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetch santri:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST Tambah Santri
app.post('/api/santri', async (req, res) => {
  const s = req.body;
  try {
    await pool.query(
      `INSERT INTO santri 
      (id, nis, nama, gender, angkatan, kelas, jenjang, status, foto_url, qr_token, nama_wali, total_hadir, total_izin, total_sakit, total_alfa, persentase, status_disiplin, last_scan) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      nama = VALUES(nama), kelas = VALUES(kelas), angkatan = VALUES(angkatan), foto_url = VALUES(foto_url)`,
      [
        s.id,
        s.nis,
        s.nama,
        s.gender || 'Putra',
        s.angkatan,
        s.kelas,
        s.jenjang || 'Santri',
        s.status || 'Aktif',
        s.fotoUrl || null,
        s.qrToken,
        s.namaWali || null,
        s.totalHadir || 0,
        s.totalIzin || 0,
        s.totalSakit || 0,
        s.totalAlfa || 0,
        s.persentase || 100,
        s.statusDisiplin || 'Sangat Disiplin',
        s.lastScan || 'Baru Diterbitkan'
      ]
    );
    res.json({ success: true, message: 'Data santri berhasil disimpan ke MySQL' });
  } catch (error) {
    console.error('Error insert santri:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE Santri
app.delete('/api/santri/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM santri WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Santri berhasil dihapus' });
  } catch (error) {
    console.error('Error delete santri:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── 4. Activities Endpoints ───────────────────────────────────────────
// GET Semua Kegiatan
app.get('/api/activities', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM activities ORDER BY created_at DESC');
    const formatted = rows.map((a) => ({
      id: a.id,
      code: a.code,
      title: a.title,
      time: a.time,
      location: a.location,
      status: a.status,
      icon: a.icon || 'event_available',
      petugas: a.petugas || 'Admin Presensi',
      hadirCount: a.hadir_count || 0,
      totalSantri: a.total_santri || 0
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetch activities:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST Tambah Kegiatan
app.post('/api/activities', async (req, res) => {
  const a = req.body;
  try {
    await pool.query(
      `INSERT INTO activities 
      (id, code, title, time, location, status, icon, petugas, hadir_count, total_santri) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      title = VALUES(title), time = VALUES(time), location = VALUES(location), status = VALUES(status)`,
      [
        a.id,
        a.code,
        a.title,
        a.time,
        a.location,
        a.status || 'Akan Datang',
        a.icon || 'event_available',
        a.petugas || 'Admin Presensi',
        a.hadirCount || 0,
        a.totalSantri || 0
      ]
    );
    res.json({ success: true, message: 'Kegiatan berhasil disimpan ke MySQL' });
  } catch (error) {
    console.error('Error insert activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT Update Kegiatan
app.put('/api/activities/:id', async (req, res) => {
  const a = req.body;
  try {
    await pool.query(
      `UPDATE activities SET 
       title = ?, time = ?, location = ?, status = ?, icon = ?, petugas = ?, hadir_count = ?, total_santri = ? 
       WHERE id = ?`,
      [
        a.title,
        a.time,
        a.location,
        a.status,
        a.icon,
        a.petugas,
        a.hadirCount,
        a.totalSantri,
        req.params.id
      ]
    );
    res.json({ success: true, message: 'Kegiatan berhasil diupdate' });
  } catch (error) {
    console.error('Error update activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE Kegiatan
app.delete('/api/activities/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM activities WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Kegiatan berhasil dihapus' });
  } catch (error) {
    console.error('Error delete activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── 5. Attendance Endpoints ───────────────────────────────────────────
// GET Semua Log Presensi
app.get('/api/attendance', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendance_records ORDER BY created_at DESC');
    const formatted = rows.map((r) => ({
      id: r.id,
      santriId: r.santri_id,
      nis: r.nis,
      nama: r.nama,
      kelas: r.kelas,
      fotoUrl: r.foto_url,
      kegiatan: r.kegiatan,
      timestamp: r.timestamp,
      date: r.date,
      status: r.status,
      keterangan: r.keterangan,
      sensorLocation: r.sensor_location,
      petugas: r.petugas
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetch attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST Catat Presensi
app.post('/api/attendance', async (req, res) => {
  const log = req.body;
  try {
    // 1. Insert ke attendance_records
    await pool.query(
      `INSERT INTO attendance_records 
      (id, santri_id, nis, nama, kelas, foto_url, kegiatan, timestamp, date, status, keterangan, sensor_location, petugas) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        log.id,
        log.santriId,
        log.nis,
        log.nama,
        log.kelas,
        log.fotoUrl || null,
        log.kegiatan,
        log.timestamp,
        log.date,
        log.status || 'Hadir',
        log.keterangan || null,
        log.sensorLocation || 'Scanner Gerbang',
        log.petugas || 'Admin Presensi'
      ]
    );

    // 2. Update status & counter di santri
    const statusCol =
      log.status === 'Hadir' ? 'total_hadir' :
      log.status === 'Izin' ? 'total_izin' :
      log.status === 'Sakit' ? 'total_sakit' : 'total_alfa';

    await pool.query(
      `UPDATE santri 
       SET last_scan = ?, ${statusCol} = ${statusCol} + 1 
       WHERE id = ?`,
      [log.timestamp, log.santriId]
    );

    // 3. Update counter di activities jika Hadir
    if (log.status === 'Hadir') {
      await pool.query(
        `UPDATE activities 
         SET hadir_count = hadir_count + 1 
         WHERE title = ? OR code = ?`,
        [log.kegiatan, log.kegiatan]
      );
    }

    res.json({ success: true, message: 'Presensi berhasil dicatat ke MySQL' });
  } catch (error) {
    console.error('Error insert attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT Perbarui status/keterangan presensi dari laporan admin
app.put('/api/attendance/:id', async (req, res) => {
  const { status, keterangan } = req.body;
  if (!['Hadir', 'Izin', 'Sakit', 'Alfa'].includes(status)) {
    return res.status(400).json({ error: 'Status presensi tidak valid' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE attendance_records SET status = ?, keterangan = ? WHERE id = ?',
      [status, keterangan || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Data presensi tidak ditemukan' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error update attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE Hapus presensi dari laporan admin
app.delete('/api/attendance/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM attendance_records WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Data presensi tidak ditemukan' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error delete attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── 6. Production Static Files (VPS Deployment) ───────────────────────
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server backend presensi berjalan di port: ${PORT}`);
  console.log(`📡 URL API: http://localhost:${PORT}/api`);
  await testConnection();
});
