const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carga las variables de entorno desde .env

// 📌 Configuración de la conexión a la base de datos
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false, // Desactiva los logs SQL en la consola
    }
);

// 📌 Verifica la conexión con la base de datos
sequelize
    .authenticate()
    .then(() => console.log('✅ Conexión a la base de datos exitosa'))
    .catch(err => console.error('❌ Error al conectar a la base de datos:', err));

// 📌 IMPORTANTE: Exportar la instancia de Sequelize
module.exports = sequelize;
