const a2 = require('argon2');
const express = require('express');

const db = require('../services/database');
const tk = require('../services/tokens');

const E_EXPIRED = 'E_EXPIRED';
const E_INVTK = 'E_INVTK';
const E_OK = 'E_OK';

const users = db('users')

if(!users.has('admin')) {
    users.setItem('admin', JSON.stringify({
        username: 'admin',
        passwd: '$argon2id$v=19$m=64,t=16,p=8$UHp6WlZmdU5YejM2amh0Sg$tSLhWO88WC5tdqakJH3yX8oOwBpuQSRpJLZeIyL8hbZ2UccUNpwsYlbJDvT8eFq3nKcmY+Dz4vXRs3AgrsY23Q'
    }));
}

/**
 * HTTP POST /validate-session
 * Valida a sessão do usuário com base na requisição e responde adequadamente.
 *
 * @param {import("express").Request} req - Objeto de requisição do Express.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {void} Envia uma resposta HTTP; não retorna valor.
 */
function validateSession(req, res) {
    // Tenta ler o token do cookie "session_token"; se não existir, usa o header Authorization.
    let sessionToken;
    if (req.cookies && req.cookies.session_token) {
        // cookie contém o token puro, normalizamos para o formato 'Bearer <token>'
        sessionToken = 'Bearer ' + req.cookies.session_token;
    } else {
        sessionToken = req.headers['authorization'];
    }
    console.log('Validating session with token:', sessionToken);

    if(!sessionToken) {
        res.status(400).json({ status: E_INVTK, message: 'No session token provided' });
        return;
    }

    if(!sessionToken.startsWith('Bearer ')) {
        res.status(400).json({ status: E_INVTK, message: 'Invalid token format' });
        return;
    }

    const tokenStr = sessionToken.slice(7); // Remove 'Bearer ' prefix
    if(!tokenStr) {
        res.status(400).json({ status: E_INVTK, message: 'Empty token' });
        return;
    }

    if(tk.tokenStatus(tokenStr) !== 'valid') {
        res.status(401).json({ status: E_EXPIRED, message: 'Session token is expired or not found.' });
        return;
    }

    res.status(200).json({ status: E_OK, message: 'Session is valid' });
}

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
        const result = JSON.parse(users.getItem(username));
        if (!result) {
            console.warn('User not found:', username);
            res.status(401).json({ message: 'Invalid username or password' });
            return;
        }

        const hashedPassword = result.passwd;

        // Usando Argon2 para verificar a senha
        if (!await a2.verify(hashedPassword, password)) {
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
        tk.saveToken(token);

        res.cookie('session_token', token.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: token.expiresInSeconds * 1000 // duração em milissegundos
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
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
function getUserInfo(req, res) {
    const sessionToken = req.cookies.session_token;
    console.log('Fetching user info with token:', sessionToken);

    const user = JSON.parse(users.getItem(tk.getUsernameFromToken(sessionToken)));
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    res.status(200).json({ 
        username: user.username,
        name: user.name
    });
}

const router = new express.Router();
router.post('/validate-session', validateSession);
router.post('/login', loginUser);
router.get('/user-info', getUserInfo);

module.exports = router;