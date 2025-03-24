const express = require('express');
const router = express.Router();
const Servicio = require('../models/Servicio');

const { body, validationResult } = require('express-validator');

router.post(
    '/',
    [
        body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
        body('duracion').isInt({ min: 1 }).withMessage('La duración debe ser un número entero positivo'),
        body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        try {
            const { nombre, duracion, precio } = req.body;
            const nuevoServicio = await Servicio.create({ nombre, duracion, precio });
            res.status(201).json(nuevoServicio);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el servicio' });
        }
    }
);


// Listar todos los servicios
router.get('/', async (req, res) => {
    try {
        const servicios = await Servicio.findAll();
        res.json(servicios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los servicios' });
    }
});

// Actualizar un servicio
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, duracion, precio } = req.body;
        const servicio = await Servicio.findByPk(id);

        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        await servicio.update({ nombre, duracion, precio });
        res.json(servicio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el servicio' });
    }
});

// Eliminar un servicio
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const servicio = await Servicio.findByPk(id);

        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        await servicio.destroy();
        res.json({ message: 'Servicio eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el servicio' });
    }
});

module.exports = router
