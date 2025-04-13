const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const HorarioBloqueado = sequelize.define(
    'HorarioBloqueado',
    {
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        horaInicio: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        horaFin: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        motivo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        freezeTableName: true, // Usa el nombre del modelo como nombre exacto de la tabla
    }
);

module.exports = HorarioBloqueado;
