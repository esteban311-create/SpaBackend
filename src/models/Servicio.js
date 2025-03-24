const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cita = require('./Cita'); 

const Servicio = sequelize.define('Servicio', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    duracion: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    precio: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
});

module.exports = Servicio;
