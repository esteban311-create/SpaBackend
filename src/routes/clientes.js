const express = require("express");
const router = express.Router();
const Cliente = require("../models/Cliente");



const calcularDatosCliente = async (clienteId) => {
    const Cita = require("../models/Cita");
    const Servicio = require("../models/Servicio");
    const Cliente = require("../models/Cliente");

    try {
        // Obtener todas las citas del cliente
        const citas = await Cita.findAll({
            where: { clienteId },
            include: [{ model: Servicio, attributes: ["nombre"], as: "servicio" }]
        });

        // 1️⃣ Frecuencia de visitas
        const frecuencia_visitas = citas.length;

        // 2️⃣ Última visita (última fecha en las citas)
        const ultima_visita = citas.length > 0
            ? citas.map(c => c.fecha).sort().reverse()[0] // Fecha más reciente
            : null;

        // 3️⃣ Servicio favorito (el más repetido en las citas)
        const servicioContador = {};
        citas.forEach(cita => {
            const nombreServicio = cita.Servicio.nombre;
            servicioContador[nombreServicio] = (servicioContador[nombreServicio] || 0) + 1;
        });

        const servicios_favoritos = Object.entries(servicioContador)
            .sort((a, b) => b[1] - a[1]) // Ordenar de mayor a menor
            .slice(0, 3) // Tomar hasta los 3 más frecuentes
            .map(([nombre]) => nombre);

        // Actualizar el cliente con los datos calculados
        await Cliente.update(
            { frecuencia_visitas, ultima_visita, servicios_favoritos },
            { where: { id: clienteId } }
        );

        console.log(`📊 Cliente ${clienteId} actualizado:`, { frecuencia_visitas, ultima_visita, servicios_favoritos });
    } catch (error) {
        console.error("❌ Error al calcular datos del cliente:", error);
    }
};

// Crear un cliente
router.post("/", async (req, res) => {
    try {
        const { nombre, correo, telefono, fecha_nacimiento, fuente_adquisicion } = req.body;

        const nuevoCliente = await Cliente.create({
            nombre,
            correo,
            telefono,
            fecha_nacimiento: fecha_nacimiento ? fecha_nacimiento : null, // Verifica si se recibe
            fuente_adquisicion: fuente_adquisicion ? fuente_adquisicion : null // Verifica si se recibe
        });

           // 📌 Calcular datos automáticamente después de crear el cliente
           await calcularDatosCliente(nuevoCliente.id);

        res.status(201).json(nuevoCliente);
    } catch (error) {
        console.error("Error al crear cliente:", error);
        res.status(500).json({ error: "Error al crear el cliente" });
    }
});

// Listar todos los clientes
router.get("/", async (req, res) => {
    try {
        const clientes = await Cliente.findAll();
        res.status(200).json(clientes);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ error: "Error al obtener clientes" });
    }
});

// Actualizar un cliente
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, telefono } = req.body;
        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        await cliente.update({ nombre, correo, telefono });
        res.json(cliente);
           // 📌 Calcular datos automáticamente después de crear el cliente
           await calcularDatosCliente(nuevoCliente.id);
           
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        res.status(500).json({ error: "Error al actualizar cliente" });
    }
});

// Eliminar un cliente
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        await cliente.destroy();
        res.json({ message: "Cliente eliminado" });
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        res.status(500).json({ error: "Error al eliminar cliente" });
    }
});

// Obtener un cliente por su ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id); // Busca el cliente por ID

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.status(200).json(cliente); // Devuelve el cliente encontrado
    } catch (error) {
        console.error('Error al obtener cliente:', error.message);
        res.status(500).json({ error: 'Error al obtener el cliente' });
    }
});


module.exports = router;
