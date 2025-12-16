const a2 = require('argon2');
const express = require('express');

const db = require('../services/database');
const tk = require('../services/tokens');

/**
 * HTTP POST /login
 * Autentica o usuário com base nas credenciais fornecidas na requisição.
 * @param {import("express").Request} req - Objeto de requisição do Express.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {void} Envia uma resposta HTTP; não retorna valor.
 */
async function loginUser(req, res) {
    // Usamos o PostgreSQL como banco de dados relacional.
    const { username, password } = req.body;
    console.log('Login attempt for user:', username);

    try {
        const userQuery = `SELECT * FROM user WHERE username = ?`;
        const user = await db.get(userQuery, [username]);

        if (!user) {
            console.warn('User not found:', username);
            res.status(401).json({ message: 'Invalid username or password' });
            return;
        }

        // Usando Argon2 para verificar a senha
        if (!await a2.verify(user.passwd, password)) {
            console.warn('Invalid password for user:', username);
            res.status(401).json({ message: 'Invalid username or password' });
            return;
        }

        console.log('User logged in successfully:', username);
        const reqIP = (req.header('x-forwarded-for') || req.socket.remoteAddress || req.ip);

        /** @type {tk.DeviceData} */
        const deviceData = {
            IP: reqIP === '::1' ? '127.0.0.1' : reqIP,
            userAgent: req.headers['user-agent'] || 'unknown',
        }

        const token = tk.newToken(username, deviceData);

        res.cookie('session_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 1800 * 1000 // duração em milissegundos
        });
        res.sendStatus(200);
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * HTTP GET /user-info
 * Retorna informações do usuário autenticado.
 * @param {import('express').Request} req Objeto de requisição.
 * @param {import('express').Response} res Objeto de resposta.
 * @returns {void} Envia uma resposta HTTP; não retorna valor.
 */
async function getUserInfo(req, res) {
    const sessionToken = req.cookies.session_token;
    console.log('Fetching user info with token:', sessionToken);

    const username = tk.getUsernameFromToken(sessionToken);
    if (!username) {
        console.warn('Invalid or missing session token');
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const userQuery = `SELECT username, name FROM user WHERE username = ?`;
    const user = await db.get(userQuery, [username]);

    res.status(200).json({ 
        username: user.username,
        name: user.name
    });
}

const router = new express.Router();
router.post('/login', loginUser);
router.get('/userinfo', getUserInfo);

module.exports = router;