const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./usuario'); // Relación con el modelo de empleados

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

Usuario.hasMany(HorarioBloqueado, { foreignKey: 'empleadoId', as: 'HorariosBloqueo' });
HorarioBloqueado.belongsTo(Usuario, { foreignKey: 'empleadoId', as: 'RelacionEmpleado' });

module.exports = HorarioBloqueado;
