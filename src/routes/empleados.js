const express = require('express');
const { Empleado } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  const empleados = await Empleado.findAll();
  res.json(empleados);
});

router.post('/', async (req, res) => {
  const empleado = await Empleado.create(req.body);
  res.status(201).json(empleado);
});

router.put('/:id', async (req, res) => {
  const empleado = await Empleado.update(req.body, { where: { id: req.params.id } });
  res.json(empleado);
});

router.delete('/:id', async (req, res) => {
  await Empleado.destroy({ where: { id: req.params.id } });
  res.status(204).send();
});

// Obtener un empleado por ID
router.get('/:id', async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json(empleado);
  } catch (error) {
    console.error('Error al obtener empleado por ID:', error);
    res.status(500).json({ error: 'Error al obtener el empleado' });
  }
});

module.exports = router