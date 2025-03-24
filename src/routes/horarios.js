    const express = require('express');
    const router = express.Router();
    const HorarioBloqueado = require('../models/HorarioBloqueado');
    const authMiddleware = require('../middleware/authMiddleware');
    const { Op } = require('sequelize'); // Importar Op desde Sequelize

    // Crear un horario bloqueado
    router.post('/', authMiddleware, async (req, res) => {
        try {
            const { fecha, horaInicio, horaFin, motivo } = req.body;
            const empleadoId = req.usuario.id; // ID del empleado autenticado

            // Validar si ya existe un horario que se superpone
            const conflictos = await HorarioBloqueado.findOne({
                where: {
                    empleadoId,
                    fecha,
                    [Op.or]: [
                        {
                            horaInicio: { [Op.between]: [horaInicio, horaFin] },
                        },
                        {
                            horaFin: { [Op.between]: [horaInicio, horaFin] },
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

            if (conflictos) {
                return res.status(400).json({ error: 'El horario se superpone con otro bloqueado' });
            }

            // Crear el nuevo horario bloqueado
            const nuevoHorario = await HorarioBloqueado.create({
                fecha,
                horaInicio,
                horaFin,
                motivo,
                empleadoId,
            });

            res.status(201).json(nuevoHorario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al bloquear el horario' });
        }
    });

    // Listar horarios bloqueados del empleado autenticado
    router.get('/', authMiddleware, async (req, res) => {
        try {
            const empleadoId = req.usuario.id;

            const horarios = await HorarioBloqueado.findAll({
                where: { empleadoId },
            });

            res.json(horarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener horarios bloqueados' });
        }
    });

    // Eliminar un horario bloqueado
    router.delete('/:id', authMiddleware, async (req, res) => {
        try {
            const { id } = req.params;
            const horario = await HorarioBloqueado.findByPk(id);

            if (!horario) {
                return res.status(404).json({ error: 'Horario no encontrado' });
            }

            await horario.destroy();
            res.json({ message: 'Horario eliminado' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar el horario' });
        }
    });

    module.exports = router;
