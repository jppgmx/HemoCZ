const { log } = require('console')
const db = require('./database')
const crypto = require('crypto')

/** 
 * @typedef {Object} DeviceData
 * @property {string} IP
 * @property {string} userAgent
 */

/**
 * @typedef {Object} Token
 * @property {string} token
 * @property {string} userId
 * @property {DeviceData} device
 * @property {Date} loginDate
 * @property {number} expiresInSeconds
 */

const tokens = db('tokens')

/**
 * 
 * @param {string} userId 
 * @param {DeviceData} device 
 * @param {number} expiresInSeconds 
 * @returns {Token}
 */
function newToken(userId, device, expiresInSeconds = 3600) {
    const token = crypto.randomBytes(64).toString('hex')
    const loginDate = new Date()
    return { token, userId, device, loginDate, expiresInSeconds }
}

function saveToken(tokenObj) {
    tokens.setItem(tokenObj.token, tokenObj);
}

function getToken(tokenStr) {
    return tokens.getItem(tokenStr);
}

function updateTimeout(tokenStr, newExpiresInSeconds) {
    const token = getToken(tokenStr);
    if (token) {
        token.expiresInSeconds = newExpiresInSeconds;
        tokens.setItem(tokenStr, token);
    }
}

function deleteToken(tokenStr) {
    tokens.removeItem(tokenStr);
}

function tokenStatus(tokenStr) {
    /** @type {Token} */
    const tk = getToken(tokenStr)

    if(!tk) {
        return 'not_found';
    }

    const expirationDate = new Date(tk.loginDate)
    expirationDate.setSeconds(expirationDate.getSeconds() + tk.expiresInSeconds)

    if(Date.now() > expirationDate.getTime()) {
        deleteToken(tokenStr)
        return 'expired';
    }
    return 'valid';
}

function getUsernameFromToken(tokenStr) {
    const tk = getToken(tokenStr);
    return tk ? tk.userId : null;
}

setInterval(() => {
    const now = Date.now();
    for (let i = 0; i < tokens.length(); i++) {
        const key = tokens.key(i);
        if(tokenStatus(key) === 'expired') {
            tokens.removeItem(key);
            log(`Token ${key} expirado e removido.`);
        }
    }
}, 60000); // Verifica a cada minuto

module.exports = {
    newToken,
    saveToken,
    getToken,
    updateTimeout,
    deleteToken,
    tokenStatus,
    getUsernameFromToken
};