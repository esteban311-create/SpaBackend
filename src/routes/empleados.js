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

module.exports = router