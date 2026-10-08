// server.js - Servidor Express + API REST (PostgreSQL)
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, probarConexion } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

probarConexion().then(conectado => {
    if (!conectado) {
        console.warn('⚠️ No se pudo conectar a PostgreSQL. El servidor iniciará pero las consultas fallarán.');
    }
});

// GET - Obtener todos los alumnos
app.get('/api/alumnos', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id_alumno, nombre_alumno, edad, semestre, numero_control, licenciatura_ingenieria, TO_CHAR(fecha_registro, 'DD/MM/YYYY HH24:MI') AS fecha_registro FROM alumnos ORDER BY id_alumno DESC"
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Crear nuevo alumno
app.post('/api/alumnos', async (req, res) => {
    try {
        const { nombre, edad, semestre, numero_control, licenciatura } = req.body;

        if (!nombre || !edad || !semestre || !numero_control || !licenciatura) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }

        const result = await pool.query(
            'INSERT INTO alumnos (nombre_alumno, edad, semestre, numero_control, licenciatura_ingenieria) VALUES ($1, $2, $3, $4, $5) RETURNING id_alumno',
            [nombre, edad, semestre, numero_control, licenciatura]
        );

        res.json({ 
            success: true, 
            message: 'Alumno guardado exitosamente',
            id: result.rows[0].id_alumno 
        });
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ success: false, message: 'El número de control ya existe' });
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
});

// DELETE - Eliminar alumno
app.delete('/api/alumnos/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM alumnos WHERE id_alumno = $1', [req.params.id]);
        
        if (result.rowCount > 0) {
            res.json({ success: true, message: 'Alumno eliminado exitosamente' });
        } else {
            res.status(404).json({ success: false, message: 'Alumno no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Archivos estáticos en: ${path.join(__dirname, 'public')}`);
});