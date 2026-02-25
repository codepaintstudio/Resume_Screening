const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function fixDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'resume_screening',
  };

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    console.log('Adding columns to students table...');
    
    // Check if columns already exist
    const [columns] = await connection.query(`SHOW COLUMNS FROM students`);
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('summary')) {
      await connection.query(`ALTER TABLE students ADD COLUMN summary TEXT`);
      console.log('✅ Added summary column');
    } else {
      console.log('ℹ️ summary column already exists');
    }

    if (!columnNames.includes('skills')) {
      await connection.query(`ALTER TABLE students ADD COLUMN skills JSON`);
      console.log('✅ Added skills column');
    } else {
      console.log('ℹ️ skills column already exists');
    }

    console.log('🎉 Database fix complete!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    if (connection) await connection.end();
  }
}

fixDatabase();
