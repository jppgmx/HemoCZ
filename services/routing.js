const sessionRouter = require('../routes/session.js')
const mgRouter = require('../routes/management.js')

const auth = require('../middlewares/auth.js')

/**
 * Registra as rotas na aplicação Express.
 * @param {import('express').Express} app A aplicação Express onde as rotas serão registradas.
 */
function registerRouting(app) {
    app.use('/api/session', sessionRouter)
    app.use('/api/management', auth, mgRouter)
}

module.exports = registerRouting;