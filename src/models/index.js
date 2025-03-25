const Cliente = require('./Cliente');
const Servicio = require('./Servicio');
const Empleado = require('./Empleado');
const Cita = require('./Cita');
const HorarioBloqueado = require('./HorarioBloqueado');
const Usuario = require('./Usuario');

// Relación Cliente - Cita
Cita.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
Cliente.hasMany(Cita, { foreignKey: 'clienteId', as: 'citas' });

// Relación Servicio - Cita
Servicio.hasMany(Cita, { foreignKey: 'servicioId', as: 'citasDelServicio' });
Cita.belongsTo(Servicio, { foreignKey: 'servicioId', as: 'servicio' });

Empleado.hasMany(Cita, { foreignKey: 'empleadoId' });
Cita.belongsTo(Empleado, { foreignKey: 'empleadoId' });



module.exports = {
    Cliente,
    Servicio,
    Empleado,
    Cita,
    HorarioBloqueado,
    Usuario,

};
