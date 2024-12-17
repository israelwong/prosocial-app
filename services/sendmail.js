import nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import fs from 'fs';
import path from 'path';

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

export default async function sendMail({ to, subject, template, data }) {
    try {
        console.log('Iniciando el proceso de envío de correo...');
        
        // Leer la plantilla MJML
        const templatePath = path.join(process.cwd(), 'services/emailTemplates', `${template}.mjml`);
        const mjmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // Reemplazar los datos dinámicos en la plantilla
        let htmlTemplate = mjmlTemplate;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                htmlTemplate = htmlTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value);
            }
        }

        // Convertir MJML a HTML
        const { html } = mjml2html(htmlTemplate);

        // Enviar el correo
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error(`Error al enviar el correo ${error}`);
    }
}

export async function sendWelcomeEmail(to, data) {
    const subject = '¡Bienvenido a ProSocial!';
    const template = 'welcome';
    await sendMail({ to, subject, template, data });
}

export async function sendSuccessfulPayment(to, data) {
    const subject = 'Pago Exitoso';
    const template = 'successfulPayment';
    await sendMail({ to, subject, template, data });
}

export async function sendPedingPayment(to, data) {
    const subject = 'Pago pendiente';
    const template = 'sendPendingPayment';
    await sendMail({ to, subject, template, data });
}
