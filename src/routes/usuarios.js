const express = require('express');
const Usuario = require('../models/usuario'); // Asegúrate de importar correctamente el modelo

const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.findAll(); // Consulta todos los usuarios en la base de datos
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});
const { body, validationResult } = require('express-validator');

router.post(
    '/',
    [
        body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
        body('email').isEmail().withMessage('Debe ser un correo válido'),
        body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        try {
            const { nombre, email, password } = req.body;
            const nuevoUsuario = await Usuario.create({ nombre, email, password });
            res.status(201).json(nuevoUsuario);
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({ error: 'Error al crear usuario' });
        }
    }
);


module.exports = router;
