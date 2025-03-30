const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// Controlador para iniciar sesión
exports.login = async (req, res) => {
    const { correo, password } = req.body;
    const Usuario = require('../models/Usuario');
    try {
        const usuario = await Usuario.scope('withPassword').findOne({ where: { correo } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }   

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo } });
        
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        res.status(500).json({ error: 'Error al autenticar usuario' });
    }
};
