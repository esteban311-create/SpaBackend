const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cita = require("./Cita");

const Pago = sequelize.define("Pago", {
    id_pago: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_cita: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cita,
            key: "id",
        },
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    fecha_pago: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    metodo_pago: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estado_pago: {
        type: DataTypes.STRING,
        defaultValue: "pendiente",
    },
});

Cita.hasMany(Pago, { foreignKey: "id_cita" });
Pago.belongsTo(Cita, { foreignKey: "id_cita" });

module.exports = Pago;
