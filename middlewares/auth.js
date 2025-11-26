const tokens = require('../services/tokens');

/**
 * Middleware para garantir que o usuário esteja autenticado.
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
function requireLogin(req, res, next) {
    const sessionToken = req.cookies ? req.cookies.session_token : null;

    if (!sessionToken) {
        return res.redirect('/login');
    }

    if(tokens.tokenStatus(sessionToken) !== 'valid') {
        return res.redirect('/login');
    }

    next()
}

module.exports = requireLogin;