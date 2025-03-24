const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async (to, templateName, components) => {
    try {
        const recipient = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        await client.messages.create({
            from: 'whatsapp:+18455831952', // Tu número habilitado para WhatsApp en Twilio
            to: recipient,
            contentSid: 'HX2c0ff6d98c97052794b11658e9154cf8', // SID de la plantilla
            template: {
                name: templateName,
                language: {
                    code: 'es', // Idioma configurado en la plantilla
                },
                components, // Parámetros dinámicos
            },
        });
        console.log('Mensaje enviado exitosamente a WhatsApp:', recipient);
    } catch (error) {
        console.error('Error al enviar mensaje de WhatsApp:', error);
        throw new Error('Error al enviar mensaje de WhatsApp');
    }
};

module.exports = sendWhatsAppMessage;
