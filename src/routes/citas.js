const express = require('express');
const router = express.Router();
const Cita = require('../models/Cita');
const Cliente = require('../models/Cliente');
const Servicio = require('../models/Servicio');
const HorarioBloqueado = require('../models/HorarioBloqueado'); // Asegúrate de tener el modelo definido
const { Op } = require('sequelize'); // Para operadores de Sequelize

// Crear una cita
router.post('/', async (req, res) => {
    try {
        const { fecha, horaInicio, horaFin, clienteId, servicioId, empleadoId } = req.body;

        // Validar que cliente y servicio existan
        const cliente = await Cliente.findByPk(clienteId);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

        const servicio = await Servicio.findByPk(servicioId);
        if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });

        // Validar conflictos con horarios bloqueados
        const conflictos = await HorarioBloqueado.findAll({
            where: {
                empleadoId,
                fecha,
                [Op.or]: [
                    {
                        horaInicio: {
                            [Op.lt]: horaFin,
                            [Op.gt]: horaInicio,
                        },
                    },
                    {
                        horaFin: {
                            [Op.gt]: horaInicio,
                            [Op.lt]: horaFin,
                        },
                    },
                ],
            },
        });

        if (conflictos.length > 0) {
            return res.status(400).json({ error: 'El horario solicitado está bloqueado' });
        }

        // Validar conflictos con citas existentes
        // Validar conflictos solo si el mismo empleado tiene una cita en ese horario
const citasConflicto = await Cita.findAll({
    where: {
        empleadoId, // ← 🔴 Solo verifica para el mismo empleado
        fecha,
        [Op.or]: [
            {
                horaInicio: {
                    [Op.lt]: horaFin,
                    [Op.gt]: horaInicio,
                },
            },
            {
                horaFin: {
                    [Op.gt]: horaInicio,
                    [Op.lt]: horaFin,
                },
            },
            {
                [Op.and]: [
                    { horaInicio: { [Op.lte]: horaInicio } },
                    { horaFin: { [Op.gte]: horaFin } },
                ],
            },
        ],
    },
});

if (citasConflicto.length > 0) {
    return res.status(400).json({ error: 'El empleado ya tiene una cita en este horario' });
}


        if (citasConflicto.length > 0) {
            return res.status(400).json({ error: 'Ya existe una cita en este horario' });
        }

        // Crear la cita
        const nuevaCita = await Cita.create({ fecha, horaInicio, horaFin, clienteId, servicioId, empleadoId });
        res.status(201).json(nuevaCita);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la cita' });
    }
});

// Listar todas las citas
router.get('/', async (req, res) => {
    try {
        const citas = await Cita.findAll({
            include: [
                { model: Cliente, attributes: ['nombre', 'telefono'], as: 'cliente' }, // Alias 'cliente'
                { model: Servicio, attributes: ['nombre', 'duracion'], as: 'servicio' }, // Alias 'servicio'
            ],
        });
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener citas:', error.message);
        res.status(500).json({ error: 'Error al obtener las citas' });
    }
});

// Actualizar una cita
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, horaInicio, horaFin, clienteId, servicioId, estado } = req.body;

        const cita = await Cita.findByPk(id);
        if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

        await cita.update({ fecha, horaInicio, horaFin, clienteId, servicioId, estado });
        res.json(cita);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la cita' });
    }
});

// Eliminar una cita
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cita = await Cita.findByPk(id);
        if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

        await cita.destroy();
        res.json({ message: 'Cita eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la cita' });
    }
});

module.exports = router;