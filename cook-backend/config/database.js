const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST ,
  port: process.env.DB_PORT ,
  user: process.env.DB_USERNAME ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log(' Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error(' Database connection error:', err);
});

module.exports = pool; 