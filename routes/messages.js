/**
 * @module routes/messages
 * Rotas para o gerenciamento de mensagens de contato.
 */

const db = require('../services/database');
const authRequired = require('../middlewares/auth');
const express = require('express');

/**
 * HTTP POST /api/messages/send
 * Envia uma nova mensagem de contato.
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id, name, email, subject, message e date no body.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function sendMessage(req, res) {
    const { id, name, email, subject, message, date } = req.body;

    try {
        db.run(
            `INSERT INTO message (id, name, email, subject, message, date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, name, email, subject, message, date]
        );
        res.status(201).json({ message: 'Mensagem enviada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao enviar a mensagem.' });
    }
}

/**
 * HTTP GET /api/messages/
 * Obtém todas as mensagens de contato recebidas (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP com a lista de mensagens; não retorna valor.
 */
async function getMessages(req, res) {
    try {
        const messages = db.all('SELECT * FROM message');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter as mensagens.' });
    }
}

/**
 * HTTP DELETE /api/messages/:id
 * Remove uma mensagem pelo ID (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id nos parâmetros da URL.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function deleteMessage(req, res) {
    const { id } = req.params;
    try {
        db.run('DELETE FROM message WHERE id = ?', [id]);
        res.status(200).json({ message: 'Mensagem deletada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar a mensagem.' });
    }
}

const router = express.Router();
router.post('/send', sendMessage);
router.delete('/:id', authRequired, deleteMessage);
router.get('/', authRequired, getMessages);

module.exports = router;