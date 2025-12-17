/**
 * @module routes/management
 * Rotas protegidas para gerenciamento administrativo.
 */

const express = require('express');

const mailService = require('../services/mail');

/**
 * HTTP POST /api/management/send-reply
 * Envia uma resposta automática por e-mail para uma mensagem recebida.
 * @param {import('express').Request} req Objeto de requisição do Express contendo originalMessage e replyBody no body.
 * @param {import('express').Response} res Objeto de resposta do Express.
 * @returns {Promise<void>}
 */
async function sendReply(req, res) {
    const { originalMessage, replyBody } = req.body;

    try {
        await mailService.noreplyMail(originalMessage, replyBody);
        res.status(200).json({ message: 'Automated reply email sent successfully.' });
    } catch (error) {
        console.error('Error sending automated reply email:', error);
        res.status(500).json({ error: 'Failed to send automated reply email.' });
    }
}

const router = express.Router();
router.post('/send-reply', sendReply);

module.exports = router;