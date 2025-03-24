const express = require("express");
const Pago = require("../models/Pago");
const Cita = require("../models/Cita");
const router = express.Router();

// 🟢 Registrar un pago
router.post("/", async (req, res) => {
    try {
        const { id_cita, monto, metodo_pago, estado_pago } = req.body;

        // Validar que la cita exista
        const cita = await Cita.findByPk(id_cita);
        if (!cita) {
            return res.status(404).json({ error: "Cita no encontrada" });
        }

        const nuevoPago = await Pago.create({
            id_cita,
            monto,
            metodo_pago,
            estado_pago: estado_pago || "pendiente",
        });

        res.status(201).json(nuevoPago);
    } catch (error) {
        console.error("Error al registrar el pago:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 🟢 Obtener todos los pagos
router.get("/", async (req, res) => {
    try {
        const pagos = await Pago.findAll({
            include: [{ model: Cita }],
        });
        res.json(pagos);
    } catch (error) {
        console.error("Error al obtener pagos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 🟢 Obtener pagos por cita
router.get("/:id_cita", async (req, res) => {
    try {
        const pagos = await Pago.findAll({
            where: { id_cita: req.params.id_cita },
        });
        res.json(pagos);
    } catch (error) {
        console.error("Error al obtener pagos de la cita:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router