const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Conexión a la base de datos
const bcrypt = require('bcrypt'); // Librería para encriptar contraseñas

// Definición del modelo Usuario
const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true, // Valida que el campo sea un email
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rol: {
        type: DataTypes.ENUM('admin', 'editor', 'viewer'), // Define los roles permitidos
        defaultValue: 'viewer', // Rol predeterminado para los usuarios
    },
}, {
    defaultScope: {
        attributes: { exclude: ['password'] }, // Excluye el campo 'password' de las respuestas por defecto
    },
    scopes: {
        withPassword: { attributes: {} }, // Incluye el campo 'password' si se requiere explícitamente
    },
});

// Hook para encriptar la contraseña antes de crear un usuario
Usuario.beforeCreate(async (usuario) => {
    const salt = await bcrypt.genSalt(10); // Genera un salt
    usuario.password = await bcrypt.hash(usuario.password, salt); // Encripta la contraseña
});

// Hook para encriptar la contraseña antes de actualizar un usuario
Usuario.beforeUpdate(async (usuario) => {
    if (usuario.changed('password')) { // Solo encripta si la contraseña ha cambiado
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
    }
});

module.exports = Usuario
