const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require('./models/index');

const sequelize = require('./config/database');

// Rutas
const horariosRoutes = require('./routes/horarios');
const webhookRoutes = require("./routes/webhook");
const agendaRoutes = require("./routes/agendas");
const serviceRoutes = require("./routes/services");
const userRoutes = require('./routes/usuarios');
const clientRoutes = require("./routes/clientes");
const citaRoutes = require('./routes/citas');
const authRoutes = require("./routes/auth");
const empleadosRouter = require('./routes/empleados');
const whatsappRoutes = require("./routes/whatsapp");
const dashboardRoutes = require("./routes/dashboard");
const pagosRoutes = require("./routes/pagos");

const app = express();

// ------------------ ✅ Configuración de CORS ------------------ //
const allowedOrigins = [
    'http://localhost:5173', // desarrollo
    'https://spa-frontend-tau.vercel.app' // producción
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS: ' + origin));
        }
    },
    credentials: true
}));
// ------------------------------------------------------------- //

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/agendas", agendaRoutes);
app.use("/api/servicios", serviceRoutes);
app.use('/api/usuarios', userRoutes);
app.use("/api/clientes", clientRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/horarios-bloqueados', horariosRoutes);
app.use('/api/empleados', empleadosRouter);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/pagos", pagosRoutes);

// Debug de rutas cargadas
console.log("Rutas registradas:", app._router.stack.map(r => r.route && r.route.path).filter(Boolean));

// Iniciar el servidor
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Base de datos sincronizada correctamente');
        app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
    })
    .catch(err => console.error('❌ Error al sincronizar la base de datos:', err));
