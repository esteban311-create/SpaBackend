const express = require('express');
const router = express.Router();
const { Cita, Cliente, Servicio, Empleado } = require('../models');
const { Op, fn, col } = require('sequelize');

// Reporte de citas diarias, semanales y mensuales
router.get('/reportes/:periodo', async (req, res) => {
    const { periodo } = req.params;
    const { mes } = req.query; // Capturar el mes de la query string
    let fechaInicio, fechaFin;

    const now = new Date();
    const currentYear = now.getFullYear();
    const selectedMonth = parseInt(mes, 10); // Asegúrate de convertir el mes a número
    
    console.log(`Consultando citas para el mes: ${mes}`);
   
    try {
        switch (periodo) {
            case 'diario':
                fechaInicio = new Date();
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin = new Date(fechaInicio);
                fechaFin.setHours(23, 59, 59, 999);
                break;

            case 'semanal':
                fechaInicio = new Date();
                fechaInicio.setDate(fechaInicio.getDate() - 7);
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin = new Date();
                fechaFin.setHours(23, 59, 59, 999);
                break;

            case 'mensual':
                const mesAjustado = selectedMonth - 1; 
                fechaInicio = new Date(Date.UTC(currentYear, mesAjustado, 1, 0, 0, 0));
                fechaFin = new Date(Date.UTC(currentYear, mesAjustado + 1, 0, 23, 59, 59, 999)); 
                console.log(`Consultando citas desde ${fechaInicio.toISOString()} hasta ${fechaFin.toISOString()}`);
                break;

            default:
                return res.status(400).json({ error: 'Periodo no válido' });
        }

        console.log(`Consultando citas desde ${fechaInicio} hasta ${fechaFin}`);

        const citas = await Cita.findAll({
            where: {
                fecha: {
                    [Op.gte]: fechaInicio,
                    [Op.lt]: fechaFin,
                },
            },
            include: [
                { model: Cliente, attributes: ['nombre', 'telefono', 'createdAt'], as: 'cliente' },
                { model: Servicio, attributes: ['nombre', 'precio'], as: 'servicio' },
                { model: Empleado, attributes: ['nombre'] },
            ],
        });

        citas.forEach(cita => console.log(`Cita: ${cita.fecha}`));

        // 1. Calcular KPIs Generales
        const totalCitas = citas.length;
        const citasCanceladas = citas.filter(cita => cita.estado === 'cancelada').length;
        const tasaCancelacion = totalCitas > 0 ? (citasCanceladas / totalCitas) * 100 : 0;

        const ingresosGenerados = citas.reduce((acc, cita) => acc + (cita.servicio?.precio || 0), 0);

        // 2. Clientes Nuevos vs. Recurrentes
        const clientesUnicos = new Set();
        let nuevosClientes = 0;
        let recurrentesClientes = 0;

        citas.forEach((cita) => {
            const clienteId = cita.clienteId;
            if (!clientesUnicos.has(clienteId)) {
                clientesUnicos.add(clienteId);
                const esNuevo = new Date(cita.cliente.createdAt) >= fechaInicio;
                if (esNuevo) nuevosClientes++;
                else recurrentesClientes++;
            }
        });

        // 3. Servicios Más Populares
        const servicios = {};
        citas.forEach((cita) => {
            const nombreServicio = cita.servicio.nombre;
            servicios[nombreServicio] = (servicios[nombreServicio] || 0) + 1;
        });

        const serviciosPopulares = Object.entries(servicios)
            .map(([nombre, total]) => ({ nombre, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);

        // 4. Horario Pico de Citas
        const horarios = { mañana: 0, tarde: 0, noche: 0 };
        citas.forEach((cita) => {
            const hora = new Date(cita.fecha).getUTCHours();
            if (hora >= 6 && hora < 12) horarios.mañana++;
            else if (hora >= 12 && hora < 18) horarios.tarde++;
            else horarios.noche++;
        });

        const horarioPico = Object.entries(horarios)
            .map(([franja, total]) => ({ franja, total }))
            .sort((a, b) => b.total - a.total)[0]?.franja || 'Sin datos';

        res.json({
            citas,
            kpis: {
                totalCitas,
                tasaCancelacion: tasaCancelacion.toFixed(2),
                ingresosGenerados,
                nuevosClientes,
                recurrentesClientes,
                serviciosPopulares,
                horarioPico,
            }
        });

    } catch (error) {
        console.error('Error al generar el reporte:', error);
        res.status(500).json({ error: 'Error al generar el reporte' });
    }
});

module.exports = router;
