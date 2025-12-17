/**
 * @module services/tokens
 * Serviço de geração e validação de tokens JWT para autenticação.
 */

const jwt = require('jsonwebtoken')

const secretKey = process.env.TOKEN_SECRET || 'default_secret_key';

/** 
 * @typedef {Object} DeviceData Descreve os dados do dispositivo do usuário.
 * @property {string} IP O endereço IP do dispositivo.
 * @property {string} userAgent O user agent do dispositivo.
 */

/**
 * Cria um novo token JWT para um usuário e dispositivo específicos.
 * @param {string} userId O ID do usuário.
 * @param {DeviceData} device Os dados do dispositivo do usuário.
 * @param {number} [expiresInSeconds=1800] O tempo de expiração do token em segundos.
 * @returns {string} O token JWT gerado.
 */
function newToken(userId, device, expiresInSeconds = 1800) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    }

    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
        device: device
    }

    const token = jwt.sign(payload, secretKey, { header: header });

    return token
}

/**
 * Analisa o status de um token JWT.
 * @param {string} tokenStr O token JWT como string.
 * @returns {'valid'|'expired'|'invalid'} 'valid', 'expired' ou 'invalid' dependendo do status do token.
 */
function tokenStatus(tokenStr) {
    return jwt.verify(tokenStr, secretKey, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return 'expired';
            } else {
                return 'invalid';
            }
        } else {
            return 'valid';
        }
    });
}

/**
 * Obtém o nome de usuário a partir de um token JWT.
 * @param {string} tokenStr O token JWT a ser decodificado.
 * @returns {string} O nome de usuário extraído do token (campo 'sub').
 */
function getUsernameFromToken(tokenStr) {
    return jwt.decode(tokenStr).sub;
}

module.exports = {
    newToken,
    tokenStatus,
    getUsernameFromToken
};