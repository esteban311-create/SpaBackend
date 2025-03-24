const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Respuesta = sequelize.define("Respuesta", {
    numero: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mensaje: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = Respuesta;
