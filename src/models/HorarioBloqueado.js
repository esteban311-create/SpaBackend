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
        empleadoId: { // ✅ Campo que estaba faltando
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Empleados',
                key: 'id'
            }
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
    }
);

module.exports = HorarioBloqueado;
