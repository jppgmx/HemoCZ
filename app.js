/**
 * @module app
 * Aplicação principal do sistema HemoCZ - Sistema de gerenciamento de doações de sangue.
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('node:path');

const setRouters = require('./services/routing.js');
const requireLogin = require('./middlewares/auth.js');

const port = 3000;
const app = express();

// Configuração de middlewares globais
app.use(express.json()); // Permite requisições com corpo em JSON
app.use(cookieParser()); // Permite manipulação de cookies

// Rota protegida para a página de gestão
app.get('/gestao', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gestao.html'));
});

// Serve arquivos estáticos da pasta public
app.use('/', express.static(path.join(__dirname, 'public'), {
    extensions: [ 'html' ]
}));

// Registra as rotas da API
setRouters(app);

// Inicia o servidor
app.listen(port, () => {
    console.log(`HemoCZ server listening on port ${port}`);
});