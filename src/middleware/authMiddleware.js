// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extrae el token del header
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decodifica el token
        req.usuario = decoded; // Adjunta los datos decodificados al objeto `req`
        next(); // Continúa al siguiente middleware o ruta
    } catch (error) {
        console.error('Error al verificar el token:', error.message);
        res.status(400).json({ error: 'Token inválido.' });
    }
};

module.exports = authMiddleware;

