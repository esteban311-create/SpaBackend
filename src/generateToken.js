const jwt = require('jsonwebtoken');

// Cambia esta clave por la que usas en tu aplicación (coincide con process.env.JWT_SECRET)
const secretKey = 'Alan'; 

const roles = ['admin', 'editor', 'viewer'];

roles.forEach((rol) => {
    const token = jwt.sign(
        { id: 1, email: `${rol}@example.com`, rol }, // Payload del token
        secretKey, // Clave secreta
        { expiresIn: '1h' } // Expiración del token
    );
    console.log(`Token para rol ${rol}: ${token}`);
});
