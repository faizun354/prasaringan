import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Pool koneksi MySQL untuk performa optimal di VPS
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_presensi_pondok',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test koneksi
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Berhasil terhubung ke database MySQL:', process.env.DB_NAME || 'db_presensi_pondok');
    connection.release();
    return true;
  } catch (error) {
    console.warn('⚠️ Gagal terhubung ke MySQL:', error.message);
    console.warn('   Pastikan MySQL sudah berjalan dan database "db_presensi_pondok" sudah dibuat melalui MySQL Workbench.');
    return false;
  }
}

export default pool;
