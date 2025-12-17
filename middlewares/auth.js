/**
 * @module middlewares/auth
 * Middleware de autenticação para proteção de rotas.
 */

const tokens = require('../services/tokens');

/**
 * Middleware para garantir que o usuário esteja autenticado.
 * Verifica a presença e validade do token de sessão. Redireciona para /login se não autenticado.
 * @param {import('express').Request} req A requisição HTTP.
 * @param {import('express').Response} res A resposta HTTP.
 * @param {import('express').NextFunction} next Callback para a próxima função middleware.
 * @returns {void}
 */
function requireLogin(req, res, next) {
    const sessionToken = req.cookies ? req.cookies.session_token : null;

    if (!sessionToken) {
        return res.redirect('/login');
    }

    if(tokens.tokenStatus(sessionToken) !== 'valid') {
        return res.redirect('/login');
    }

    next();
}

module.exports = requireLogin;