const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { Agenda } = require('../models/Agenda');
const Respuesta = require('../models/Respuesta'); // Modelo para guardar respuestas
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const sendWhatsAppMessage = require('../utils/whatsappNotifier');

// Middleware para manejar validaciones de campos
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

// Obtener todas las agendas (todos los roles pueden acceder)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const agendas = await Agenda.findAll();
        res.json(agendas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las agendas.' });
    }
});

// Crear una nueva agenda (solo admin y editor)
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'editor']),
    [
        body('titulo').notEmpty().withMessage('El título es obligatorio.'),
        body('descripcion').notEmpty().withMessage('La descripción es obligatoria.'),
        body('fecha').isISO8601().withMessage('La fecha debe tener un formato válido (ISO8601).'),
        body('telefono').notEmpty().withMessage('El número de teléfono es obligatorio.'),
    ],
    validarCampos,
    async (req, res) => {
        const { titulo, descripcion, fecha, telefono } = req.body;

        try {
            const nuevaAgenda = await Agenda.create({ titulo, descripcion, fecha });

            // Enviar notificación por WhatsApp usando la plantilla
            const templateName = 'confirmacion_cita_spa';
            const components = [
                {
                    type: 'body',
                    parameters: [
                        { type: 'text', text: fecha },
                        { type: 'text', text: titulo },
                    ],
                },
            ];

            try {
                await sendWhatsAppMessage(telefono, templateName, components);
                console.log('Mensaje enviado correctamente');
            } catch (error) {
                console.error('Error al enviar WhatsApp:', error.message);
            }

            res.status(201).json(nuevaAgenda);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear la agenda.' });
        }
    }
);

// Ruta para manejar Webhook de Twilio
router.post('/webhook', async (req, res) => {
    try {
        const { From, Body } = req.body; // 'From' es el número del usuario, 'Body' es el mensaje recibido.
        console.log(`Mensaje recibido de ${From}: ${Body}`);

        // Validar que los datos existen
        if (!From || !Body) {
            console.error('Faltan datos: From o Body están vacíos.');
            return res.status(400).send('Datos inválidos');
        }

        // Guardar en la base de datos
        const nuevaRespuesta = await Respuesta.create({ numero: From, mensaje: Body });
        console.log('Guardado exitoso en la base de datos:', nuevaRespuesta);

        // Responder a Twilio
        res.set('Content-Type', 'text/xml');
        res.status(200).send(`
            <Response>
                <Message>Gracias por tu respuesta. Hemos recibido tu mensaje.</Message>
            </Response>
        `);
    } catch (error) {
        console.error('Error al procesar el Webhook:', error.message);
        res.status(500).send('Error al procesar el Webhook');
    }
});

// Actualizar una agenda (solo admin y editor)
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'editor']),
    [
        body('titulo').optional().notEmpty().withMessage('El título no puede estar vacío.'),
        body('descripcion').optional().notEmpty().withMessage('La descripción no puede estar vacía.'),
        body('fecha').optional().isISO8601().withMessage('La fecha debe tener un formato válido (ISO8601).'),
        body('telefono').optional().notEmpty().withMessage('El número de teléfono no puede estar vacío.'),
    ],
    validarCampos,
    async (req, res) => {
        const { id } = req.params;
        const { titulo, descripcion, fecha, telefono } = req.body;

        try {
            const agenda = await Agenda.findByPk(id);
            if (!agenda) {
                return res.status(404).json({ error: 'Agenda no encontrada.' });
            }

            agenda.titulo = titulo || agenda.titulo;
            agenda.descripcion = descripcion || agenda.descripcion;
            agenda.fecha = fecha || agenda.fecha;

            await agenda.save();

            // Enviar notificación por WhatsApp usando la plantilla
            if (telefono) {
                const templateName = 'confirmacion_cita_spa';
                const components = [
                    {
                        type: 'body',
                        parameters: [
                            { type: 'text', text: agenda.fecha },
                            { type: 'text', text: agenda.titulo },
                        ],
                    },
                ];

                try {
                    await sendWhatsAppMessage(telefono, templateName, components);
                    console.log('Mensaje enviado correctamente');
                } catch (error) {
                    console.error('Error al enviar WhatsApp:', error.message);
                }
            }

            res.json(agenda);
        } catch (error) {
            console.error('Error al actualizar la agenda:', error);
            res.status(500).json({ error: 'Error al actualizar la agenda.' });
        }
    }
);

// Eliminar una agenda (solo admin)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const { id } = req.params;

    try {
        const agenda = await Agenda.findByPk(id);
        if (!agenda) {
            return res.status(404).json({ error: 'Agenda no encontrada.' });
        }

        await agenda.destroy();
        res.json({ message: 'Agenda eliminada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la agenda.' });
    }
});

router.get('/reportes/citas-por-mes', async (req, res) => {
    try {
        const reportes = await Agenda.findAll({
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('fecha'), '%Y-%m'), 'mes'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalCitas'],
            ],
            group: ['mes'],
        });

        res.json(reportes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar el reporte' });
    }
});


module.exports = router;
