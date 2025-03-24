const express = require("express");
const router = express.Router();
const sendWhatsAppMessage = require("../utils/whatsappNotifier");


router.post("/", async (req, res) => {
    try {
        const { telefono, mensaje } = req.body;

        if (!telefono || !mensaje) {
            return res.status(400).json({ error: "Faltan datos para enviar el mensaje" });
        }

        await sendWhatsAppMessage(telefono, "custom_template", [
            { type: "body", parameters: [{ type: "text", text: mensaje }] },
        ]);

        res.status(200).json({ success: true, message: "Mensaje enviado" });
    } catch (error) {
        console.error("Error al enviar mensaje de WhatsApp:", error);
        res.status(500).json({ error: "No se pudo enviar el mensaje" });
    }
});

module.exports = router
