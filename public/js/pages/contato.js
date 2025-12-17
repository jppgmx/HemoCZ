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

    // Salvar mensagem em localStorage para gestão revisar
    if (localStorage.getItem('messages') === null) {
        localStorage.setItem('messages', JSON.stringify([messageData]));
    } else {
        let messages = JSON.parse(localStorage.getItem('messages'));
        messages.push(messageData);
        localStorage.setItem('messages', JSON.stringify(messages));
    }

    contactForm.reset();
    formAlert('Mensagem enviada com sucesso! A equipe de gestão responderá em breve.');
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
