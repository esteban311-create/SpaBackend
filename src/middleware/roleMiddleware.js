// middleware/roleMiddleware.js
const roleMiddleware = (rolesPermitidos) => {
    return (req, res, next) => {
        // Verifica que el usuario esté autenticado
        if (!req.usuario || !req.usuario.rol) {
            return res.status(403).json({ error: 'Acceso denegado. No tienes los permisos necesarios.' });
        }

        // Verifica si el rol del usuario está en los roles permitidos
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'Acceso denegado. No tienes los permisos necesarios.' });
        }

        next(); // Si pasa la validación, continúa con la siguiente función middleware
    };
};

module.exports = roleMiddleware;
