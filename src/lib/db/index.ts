import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// 创建 MySQL 连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'resume_screening',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// 创建 Drizzle ORM 实例
export const db = drizzle(pool, { schema, mode: 'default' });

// 导出 schema 供外部使用
export { schema };

// 导出类型
export type Database = typeof db;

// 关闭连接池 (用于应用关闭时)
export async function closePool() {
  await pool.end();
}
