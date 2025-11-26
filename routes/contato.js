const express = require('express');
const nm = require('nodemailer');

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function submitContactForm(req, res) {
    // TODO: Configurar e-mail noreply correto
    // Enquanto nisso, retornaremos 503.
    res.status(503).json({ error: 'Serviço de e-mail indisponível no momento.' });
    return;

    const { nome, email, assunto, mensagem } = req.body;

    /*
    // O transporte usa STARTTLS (secure: false + port 587 + TLS automático)
    const transporter = nm.createTransport({
        host: '',
        port: ,
        secure: false, // STARTTLS será usado automaticamente
        auth: {
            user: '',
            pass: '' // Substitua pela senha correta
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    const mailOptions = {
        from: '"Hemonúcleo de Cajazeiras" <>',
        to: email,
        subject: assunto,
        text: `Nome: ${nome}\nEmail: ${email}\nMensagem: ${mensagem}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'E-mail enviado com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao enviar e-mail.' });
    }*/
}

const router = express.Router();
router.post('/submit', submitContactForm);

module.exports = router;