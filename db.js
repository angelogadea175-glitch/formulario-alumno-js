// db.js - Conexión a PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function probarConexion() {
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa a PostgreSQL');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return false;
    }
}

module.exports = { pool, probarConexion };