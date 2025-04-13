const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agenda = sequelize.define('Agenda', {
    titulo: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    fecha: DataTypes.DATE,
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
});

module.exports = Agenda;
