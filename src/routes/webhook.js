const express = require("express");
const router = express.Router();
const { Cliente, Cita } = require("../models");
const twilio = require('twilio'); 

// Cargar credenciales Twilio desde .env
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } = process.env;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

router.post("/", async (req, res) => {
    try {
        console.log("📩 Webhook recibido:", req.body);

        // Validar datos de Twilio
        if (!req.body || !req.body.From || !req.body.Body) {
            console.error("⚠ Error: No se recibió un número o mensaje válido en el webhook.");
            return res.status(400).json({ success: false, message: "Datos inválidos" });
        }

        // Extraer el número y mensaje recibido
        const telefono = req.body.From.replace("whatsapp:", "").trim();
        const mensaje = req.body.Body.trim().toLowerCase();

        console.log(`📞 Número recibido: ${telefono}, Mensaje recibido: ${mensaje}`);

        // Buscar al cliente en la base de datos
        const cliente = await Cliente.findOne({ where: { telefono } });
        if (!cliente) {
            console.error("❌ Cliente no encontrado.");
            return res.status(404).json({ success: false, message: "Cliente no encontrado" });
        }

        console.log(`✅ Cliente encontrado: ${cliente.nombre}`);

        // Buscar la última cita del cliente
        const ultimaCita = await Cita.findOne({
            where: { clienteId: cliente.id },
            order: [["createdAt", "DESC"]],
        });

        if (!ultimaCita) {
            console.error("❌ No se encontró una cita para este cliente.");
            return res.status(404).json({ success: false, message: "No se encontró una cita" });
        }

        console.log(`📅 Última cita encontrada: ${ultimaCita.id} Estado actual: ${ultimaCita.estado}`);

        // Determinar el nuevo estado de la cita
        let nuevoEstado;
        let mensajeRespuesta;

        if (mensaje.includes("confirmar") || mensaje.includes("confirmar asistencia")) {
            nuevoEstado = "confirmada";
            mensajeRespuesta = `Tu cita ha sido ${nuevoEstado}. ¡Gracias por tu confirmación!`;
        } else if (mensaje.includes("reagendar") || mensaje.includes("reprogramar cita")) {
            nuevoEstado = "reagendar";
            mensajeRespuesta = `Tu cita ha sido ${nuevoEstado}. Te contactaremos para elegir una nueva fecha. ¡Gracias!`;
        } else if (mensaje.includes("pendiente")) {
            nuevoEstado = "pendiente";
            mensajeRespuesta = `Tu cita sigue en estado ${nuevoEstado}. Si deseas confirmarla o reagendarla, por favor responde con "Confirmar" o "Reagendar".`;
        } else if (mensaje.includes("cancelar")) {
            nuevoEstado = "cancelada";
            mensajeRespuesta = `Tu cita ha sido ${nuevoEstado}. Si necesitas más información, contáctanos.`;
        } else {
            console.error("⚠ Mensaje no reconocido.");
            return res.status(400).json({ success: false, message: "Mensaje no reconocido." });
        }

        // Actualizar el estado de la cita
        await ultimaCita.update({ estado: nuevoEstado });

        console.log(`✅ Cita ${ultimaCita.id} actualizada a estado: ${nuevoEstado}`);

        // ✅ Enviar confirmación al usuario con el mensaje correspondiente
        await client.messages.create({
            from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${telefono}`,
            template: {
              name: "confirmacion_cita_spa_2",
              language: { code: "es" },
              components: [
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: cliente.nombre },
                    { type: "text", text: ultimaCita.fecha },
                    { type: "text", text: ultimaCita.horaInicio }
                  ]
                }
              ]
            }
          });
          
        
        console.log("📢 Respuesta enviada a WhatsApp");

        // 📌 Enviar respuesta JSON solo después de Twilio
        return res.json({ success: true, message: `Cita actualizada a ${nuevoEstado}` });

    } catch (error) {
        console.error("❌ Error en el webhook:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }

    
});

module.exports = router;
