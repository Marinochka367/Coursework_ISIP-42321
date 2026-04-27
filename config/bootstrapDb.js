const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');

function validateDbName(dbName) {
  return /^[a-zA-Z0-9_]+$/.test(dbName);
}

function applyDbNameToInitSql(sql, dbName) {
  return sql
    .replace(
      /CREATE DATABASE IF NOT EXISTS\s+[^\s;]+/i,
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\``
    )
    .replace(/USE\s+[^\s;]+/i, `USE \`${dbName}\``);
}

async function ensureDatabaseReady() {
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    throw new Error('DB_NAME is not set in environment variables.');
  }

  if (!validateDbName(dbName)) {
    throw new Error('DB_NAME contains unsupported characters. Use letters, numbers and underscore.');
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
    multipleStatements: true
  });

  try {
    const [dbRows] = await connection.query(
      'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbName]
    );

    const [usersTableRows] = await connection.query(
      `SELECT TABLE_NAME
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
       LIMIT 1`,
      [dbName]
    );

    const needsInitialization = dbRows.length === 0 || usersTableRows.length === 0;
    if (!needsInitialization) {
      return;
    }

    const initSqlPath = path.join(__dirname, '..', 'sql', 'init.sql');
    const initSqlRaw = await fs.readFile(initSqlPath, 'utf8');
    const initSql = applyDbNameToInitSql(initSqlRaw, dbName);
    await connection.query(initSql);

    console.log(`Database "${dbName}" initialized from sql/init.sql`);
  } finally {
    await connection.end();
  }
}

module.exports = { ensureDatabaseReady };
