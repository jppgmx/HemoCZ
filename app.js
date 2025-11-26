const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('node:path')

const setRouters = require('./services/routing.js')
const requireLogin = require('./middlewares/auth.js')

const port = 3000
const app = express()

app.use(express.json())
app.use(cookieParser())
app.get('/gestao', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gestao.html'));
});
app.use('/', express.static(path.join(__dirname, 'public'), {
    extensions: [ 'html' ]
}))
setRouters(app)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})