const sessionRouter = require('../routes/session.js')
const contatoRouter = require('../routes/contato.js')

/** @param {import('express').Express} app */
function registerRouting(app) {
    app.use('/api/session', sessionRouter)
    app.use('/api/contato', contatoRouter)
}

module.exports = registerRouting;