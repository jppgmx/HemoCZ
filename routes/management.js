const express = require('express');

const mailService = require('../services/mail');

async function sendReply(req, res) {
    const { originalMessage, replyBody } = req.body;

    try {
        await mailService.noreplyMail(originalMessage, replyBody);
        res.status(200).json({ message: 'E-mail de resposta automática enviado com sucesso.' });
    } catch (error) {
        console.error('Erro ao enviar e-mail de resposta automática:', error);
        res.status(500).json({ error: 'Falha ao enviar o e-mail de resposta automática.' });
    }
}

const router = express.Router();
router.post('/send-reply', sendReply);

module.exports = router;