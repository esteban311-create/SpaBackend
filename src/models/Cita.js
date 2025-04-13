const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cita = sequelize.define('Cita', {
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    horaInicio: {
        type: DataTypes.TIME, // Asegúrate de usar el tipo TIME para horas
        allowNull: false,
    },
    horaFin: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Clientes',
            key: 'id',
        },
    },
    servicioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Servicios',
            key: 'id',
        },
    },
    empleadoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada','reagendar'),
        defaultValue: 'pendiente',
    },
});

module.exports = Cita;
