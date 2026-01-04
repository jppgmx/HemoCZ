/**
 * @module routes/messages
 * Rotas para o gerenciamento de mensagens de contato.
 */

const db = require('../services/database');
const authRequired = require('../middlewares/auth');
const express = require('express');

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

async function getMessages(req, res) {
    try {
        const messages = db.all('SELECT * FROM message');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter as mensagens.' });
    }
}

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