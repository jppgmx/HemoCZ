const express = require('express');
const nm = require('nodemailer');

async function submitContactForm(req, res) {
    const { nome, email, assunto, mensagem } = req.body;

    // O transporte usa STARTTLS (secure: false + port 587 + TLS automático)
    const transporter = nm.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS será usado automaticamente
        auth: {
            user: 'jppgmx24@gmail.com',
            pass: process.env.EMAIL_PASSWORD // Substitua pela senha correta
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    const mailOptions = {
        from: '"HemoCZ" <naoresponda.hemonucleo.cz.pb@hotmail.com>',
        to: email,
        subject: assunto,
        text: `Nome: ${nome}\nEmail: ${email}\nMensagem: ${mensagem}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'E-mail enviado com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao enviar e-mail.' });
    }
}

const router = express.Router();
router.post('/submit', submitContactForm);

module.exports = router;