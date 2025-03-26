const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carga las variables de entorno

// Configura la conexión con Sequelize
const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false,
  });
  

// Verifica la conexión
sequelize.authenticate()
    .then(() => console.log('✅ Conexión a la base de datos exitosa'))
    .catch(err => console.error('❌ Error al conectar a la base de datos:', err));

// 🚨 IMPORTANTE: Exportar la instancia de `sequelize`
module.exports = sequelize;
