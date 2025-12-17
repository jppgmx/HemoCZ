const contatoForm = document.forms.contato;

contatoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const msg = {
        id: crypto.randomUUID(),
        nome: contatoForm.nome.value,
        email: contatoForm.email.value,
        assunto: contatoForm.assunto.value,
        mensagem: contatoForm.mensagem.value,
        data: new Date().toISOString()
    };

    // Salvar mensagem em localStorage para gestão revisar
    if (localStorage.getItem('mensagens') === null) {
        localStorage.setItem('mensagens', JSON.stringify([msg]));
    } else {
        let mensagens = JSON.parse(localStorage.getItem('mensagens'));
        mensagens.push(msg);
        localStorage.setItem('mensagens', JSON.stringify(mensagens));
    }

    contatoForm.reset();
    formAlert('Mensagem enviada com sucesso! A equipe de gestão responderá em breve.');
});

// Função de alerta customizado
function formAlert(message, type = 'success') {
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

    let icon = document.createElement('span');
    icon.innerHTML = type === 'error' ? '⚠️' : '✓';
    icon.style.fontSize = '1.5rem';
    icon.style.flexShrink = '0';

    let text = document.createElement('p');
    text.textContent = message;
    text.style.cssText = `
        margin: 0;
        color: ${type === 'error' ? '#c41e3a' : '#27ae60'};
        font-weight: 600;
        font-size: 1rem;
    `;

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

    alertContainer.appendChild(icon);
    alertContainer.appendChild(text);
    alertContainer.appendChild(closeBtn);
    document.body.appendChild(alertContainer);

    setTimeout(() => {
        alertContainer.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => alertContainer.remove(), 300);
    }, 5000);
}
