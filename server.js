

const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, probarConexion } = require('./db');

const app = express();
const PORT = 3000;

// =============================================
// MIDDLEWARE
// =============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// PROBAR CONEXIÓN AL INICIAR
// =============================================
probarConexion().then(conectado => {
    if (!conectado) {
        console.warn(' No se pudo conectar a MySQL. El servidor iniciará pero las consultas fallarán.');
    }
});

// =============================================
// RUTAS API
// =============================================

// GET - Obtener todos los alumnos
app.get('/api/alumnos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vista_alumnos');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Obtener un alumno por ID
app.get('/api/alumnos/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vista_alumnos WHERE id_alumno = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Alumno no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Crear nuevo alumno
app.post('/api/alumnos', async (req, res) => {
    try {
        const { nombre, edad, semestre, numero_control, licenciatura } = req.body;

        // Validación
        if (!nombre || !edad || !semestre || !numero_control || !licenciatura) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }

        const [result] = await pool.query(
            'INSERT INTO alumnos (nombre_alumno, edad, semestre, numero_control, licenciatura_ingenieria) VALUES (?, ?, ?, ?, ?)',
            [nombre, edad, semestre, numero_control, licenciatura]
        );

        res.json({ 
            success: true, 
            message: 'Alumno guardado exitosamente',
            id: result.insertId 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'El número de control ya existe' });
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
});

// PUT - Actualizar alumno
app.put('/api/alumnos/:id', async (req, res) => {
    try {
        const { nombre, edad, semestre, numero_control, licenciatura } = req.body;
        
        const [result] = await pool.query(
            'UPDATE alumnos SET nombre_alumno=?, edad=?, semestre=?, numero_control=?, licenciatura_ingenieria=? WHERE id_alumno=?',
            [nombre, edad, semestre, numero_control, licenciatura, req.params.id]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Alumno actualizado exitosamente' });
        } else {
            res.status(404).json({ success: false, message: 'Alumno no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Eliminar alumno
app.delete('/api/alumnos/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM alumnos WHERE id_alumno = ?', [req.params.id]);
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Alumno eliminado exitosamente' });
        } else {
            res.status(404).json({ success: false, message: 'Alumno no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================================
// SERVIDOR
// =============================================
app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
    console.log(` Archivos estáticos en: ${path.join(__dirname, 'public')}`);
});