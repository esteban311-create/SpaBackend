const express = require('express');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

app.use(authMiddleware);

app.get('/', (req, res) => {
    res.send('Middleware funcionando correctamente');
});

app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));
