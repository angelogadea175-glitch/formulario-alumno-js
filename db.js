

const mysql = require('mysql2/promise');

// Configuración de la DB
const dbConfig = {
    host: 'localhost',
    user: 'root',           
    password: 'Frouston',           
    database: 'formulario_alumnos_js',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

//  pool de conexiones
const pool = mysql.createPool(dbConfig);

//  probar la conexión
async function probarConexion() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a MySQL');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return false;
    }
}

// Exportar 
module.exports = {
    pool,
    probarConexion
};