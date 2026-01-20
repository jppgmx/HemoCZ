/**
 * @module services/routing
 * Registro centralizado de rotas da aplicação Express.
 */

const sessionRouter = require('../routes/session.js')
const mgRouter = require('../routes/management.js')
const appointmentRouter = require('../routes/appointments.js')
const messageRouter = require('../routes/messages.js')
const assistanceRouter = require('../routes/assistance.js')

const auth = require('../middlewares/auth.js')

/**
 * Registra as rotas na aplicação Express.
 * @param {import('express').Express} app A aplicação Express onde as rotas serão registradas.
 */
function registerRouting(app) {
    app.use('/api/session', sessionRouter)
    app.use('/api/management', auth, mgRouter)
    app.use('/api/appointments', appointmentRouter)
    app.use('/api/messages', messageRouter)
    app.use('/api/assistance', assistanceRouter)
}

module.exports = registerRouting;