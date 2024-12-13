/*
const nodemailer = require('nodemailer');

module.exports = async function (req, res) {
  if (req.method === 'POST') {
    const { to, subject, text, email } = req.body;

    // Crear el transporter con las credenciales de Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Configura los datos del correo
    const mailOptions = {
      from: email,
      to,
      subject,
      text,
      replyTo: email
    };

    try {
      // Enviar el correo
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Correo enviado con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al enviar el correo', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido ' });
  }
};
*/