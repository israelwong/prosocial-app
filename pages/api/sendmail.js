import nodemailer from 'nodemailer';

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default async function sendMail({ to, subject, template, data }) {
    // Renderizar la plantilla con datos dinámicos
    const templates = {
        welcome: (data) => `
            <h1>¡Bienvenido, ${data.cliente.nombre}!</h1>
            <p>Gracias por confiar en nosotros. Aquí tienes tu contrato:</p>
            <p>${data.contrato}</p>
        `,
        paymentSuccess: (data) => `
            <h1>¡Gracias por tu pago, ${data.cliente.nombre}!</h1>
            <p>Hemos recibido tu pago de $${data.pago.monto}.</p>
            <p>Tu balance total es de $${data.balance}.</p>
        `,
    };

    const html = templates[template](data);

    // Enviar el correo
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
}
