const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cita = require('./Cita'); 

const Cliente = sequelize.define("Cliente", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false, // Obligatorio
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false, // Obligatorio
      unique: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false, // Obligatorio
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true, // Opcional
    },
    frecuencia_visitas: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Se actualizará con cada cita
    },
    servicios_favoritos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    },
    
    ultima_visita: {
      type: DataTypes.DATE,
      allowNull: true, // Opcional
    },
    fuente_adquisicion: {
      type: DataTypes.STRING,
      allowNull: true, // Opcional
    },
    preferencias: {
      type: DataTypes.TEXT,
      allowNull: true, // Opcional
    },
  });
  
  module.exports = Cliente;