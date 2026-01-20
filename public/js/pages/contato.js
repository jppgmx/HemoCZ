/**
 * @typedef {Object} Message
 * @property {string} id ID único da mensagem
 * @property {string} name Nome do remetente
 * @property {string} email E-mail do remetente
 * @property {string} subject Assunto da mensagem
 * @property {string} message Conteúdo da mensagem
 * @property {string} date Data de envio em formato ISO
 */

/** @type {HTMLFormElement} */
const contactForm = document.forms.contact;

/**
 * Valida se um endereço de e-mail possui formato válido
 * @param {string} email E-mail a ser validado
 * @returns {boolean} True se o e-mail for válido
 */
function isValidEmail(email) {
    // Regex RFC 5322 simplificada para validação de e-mail
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

/**
 * Valida todos os campos do formulário de contato
 * @param {Message} messageData Dados da mensagem a serem validados
 * @throws {Error} Se alguma validação falhar
 */
function validateContactForm(messageData) {
    // 1. Validar nome (apenas letras e espaços, 3-80 caracteres)
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,80}$/;
    if (!messageData.name.trim()) {
        throw new Error('O campo Nome é obrigatório.');
    }
    if (!nameRegex.test(messageData.name)) {
        throw new Error('Nome inválido. Use apenas letras e espaços (3 a 80 caracteres).');
    }

    // 2. Validar email (obrigatório + formato)
    if (!messageData.email.trim()) {
        throw new Error('O campo E-mail é obrigatório.');
    }
    if (!isValidEmail(messageData.email)) {
        throw new Error('Por favor, insira um endereço de e-mail válido.');
    }

    // 3. Validar assunto (obrigatório, mínimo 3 caracteres)
    if (!messageData.subject.trim()) {
        throw new Error('O campo Assunto é obrigatório.');
    }
    if (messageData.subject.trim().length < 3) {
        throw new Error('O assunto deve ter pelo menos 3 caracteres.');
    }

    // 4. Validar mensagem (obrigatório, mínimo 10 caracteres)
    if (!messageData.message.trim()) {
        throw new Error('O campo Mensagem é obrigatório.');
    }
    if (messageData.message.trim().length < 10) {
        throw new Error('A mensagem deve ter pelo menos 10 caracteres.');
    }
}

/**
 * Handler do evento de submit do formulário de contato
 * Salva a mensagem no localStorage para ser revisada pela gestão
 */
contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    /** @type {Message} */
    const messageData = {
        id: crypto.randomUUID(),
        name: contactForm.name.value,
        email: contactForm.email.value,
        subject: contactForm.subject.value,
        message: contactForm.message.value,
        date: new Date().toISOString()
    };

    // Validar todos os campos
    try {
        validateContactForm(messageData);
    } catch (error) {
        formAlert(error.message, 'error');
        return;
    }

    fetch('/api/messages/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
    }).then(async response => {
        if (!response.ok) {
            throw new Error('Erro ao enviar a mensagem. Tente novamente mais tarde.');
        }
        formAlert('Mensagem enviada com sucesso!', 'success');
    }).catch(error => {
        console.error('Error sending contact message:', error);
        formAlert(error.message, 'error');
    });

    contactForm.reset();
});

/**
 * Exibe um alerta customizado na tela
 * @param {string} messageText Texto da mensagem a ser exibida
 * @param {string} type Tipo do alerta ('success' ou 'error')
 */
function formAlert(messageText, type = 'success') {
    // Container principal do alerta
    let alertContainer = document.createElement('div');
    alertContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'error' ? '#fee' : '#efe'};
        border: 2px solid ${type === 'error' ? '#c41e3a' : '#27ae60'};
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Ubuntu';
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 90%;
    `;

    // Ícone do alerta
    let icon = document.createElement('span');
    icon.innerHTML = type === 'error' ? '⚠️' : '✓';
    icon.style.fontSize = '1.5rem';
    icon.style.flexShrink = '0';

    // Texto da mensagem
    let text = document.createElement('p');
    text.textContent = messageText;
    text.style.cssText = `
        margin: 0;
        color: ${type === 'error' ? '#c41e3a' : '#27ae60'};
        font-weight: 600;
        font-size: 1rem;
    `;

    // Botão de fechar (X)
    let closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        color: ${type === 'error' ? '#c41e3a' : '#27ae60'};
        cursor: pointer;
        padding: 0 4px;
        flex-shrink: 0;
    `;
    closeBtn.onclick = () => alertContainer.remove();

    // Monta o alerta
    alertContainer.appendChild(icon);
    alertContainer.appendChild(text);
    alertContainer.appendChild(closeBtn);
    document.body.appendChild(alertContainer);

    // Remove automaticamente após 5 segundos com animação de saída
    setTimeout(() => {
        alertContainer.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => alertContainer.remove(), 300);
    }, 5000);
}
