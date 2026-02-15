import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量配置文件
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testDatabaseConnection() {
  console.log('🧪 开始测试数据库连接...\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'resume_screening',
  };

  console.log('📡 数据库配置:');
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log('');

  let connection;
  try {
    // 尝试建立连接
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功!\n');

    // 执行简单查询测试
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('✅ 查询测试成功! 1 + 1 =', (rows as any)[0].result);

    // 检查数据库是否存在
    const [databases] = await connection.query('SHOW DATABASES');
    const dbList = databases as any[];
    const dbExists = dbList.some((db: any) => db.Database === config.database);
    
    console.log('');
    if (dbExists) {
      console.log(`✅ 数据库 '${config.database}' 存在`);
    } else {
      console.log(`⚠️  数据库 '${config.database}' 不存在，请先创建`);
    }

    // 尝试显示表
    try {
      const [tables] = await connection.query('SHOW TABLES');
      const tableList = tables as any[];
      console.log(`📋 数据库中共有 ${tableList.length} 个表`);
      if (tableList.length > 0) {
        console.log('   表列表:');
        (tableList as any[]).forEach((t: any) => {
          const tableName = t[Object.keys(t)[0]];
          console.log(`   - ${tableName}`);
        });
      }
    } catch {
      console.log('⚠️  无法获取表列表 (可能没有权限或数据库为空)');
    }

    console.log('\n🎉 数据库连接测试完成!');
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.log('❌ 数据库连接失败!\n');
    console.log('错误信息:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 提示: 请确保 MySQL 服务正在运行');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 提示: 请检查用户名和密码是否正确');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 提示: 数据库不存在，请先创建数据库');
    }
    
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

testDatabaseConnection();
