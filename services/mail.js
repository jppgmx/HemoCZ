const nm = require('nodemailer');
const fs = require('fs');
const path = require('path');
const hb = require('handlebars');

/**
 * Obtém uma lista de servidores de e-mail suportados para envio.
 * @returns {Object} Um objeto contendo as configurações dos servidores de e-mail suportados.
 */
function getMailSupportedServers() {
    return {
        gmailTls: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true
        }
    }
}

/**
 * Cria um transportador de e-mail usando as configurações do servidor especificado.
 * @param {string} serverName O nome do servidor de e-mail. 
 * @param {Object} auth As credenciais de autenticação (usuário e senha).
 * @returns {nm.Transporter} O transportador de e-mail configurado.
 */
function createMailTransporter(serverName, auth) {
    const servers = getMailSupportedServers();
    const serverConfig = servers[serverName];
    if (!serverConfig) {
        throw new Error(`Servidor de e-mail não suportado: ${serverName}`);
    }

    return nm.createTransport({
        ...serverConfig,
        auth
    });
}

const templatePath = path.join(__dirname, '..', 'templates', 'noreply-mail.html');
const templateContent = fs.readFileSync(templatePath, 'utf-8');
module.exports = {
    getMailSupportedServers,
    createMailTransporter,

    /**
     * Envia um e-mail de resposta automática sem a opção de resposta direta.
     * @param {Object} mensagem A mensagem original recebida. 
     * @param {string} replyBody A resposta a ser incluída no e-mail.
     */
    noreplyMail: async function(mensagem, replyBody) {
        const transporter = createMailTransporter('gmailTls', {
            user: process.env.NOREPLY_EMAIL_USER,
            pass: process.env.NOREPLY_EMAIL_PASS
        });
        
        const content = hb.compile(templateContent)

        const mailOptions = {
            from: `"Hemonúcleo de Cajazeiras" <${process.env.NOREPLY_EMAIL_USER}>`,
            to: mensagem.email,
            subject: `Re: ${mensagem.assunto}`,
            html: content({
                nome: mensagem.nome,
                email: mensagem.email,
                assunto: mensagem.assunto,
                mensagem: mensagem.mensagem,
                data: mensagem.data,
                respostaCorpo: replyBody
            })
        };

        await transporter.sendMail(mailOptions);
    }
}