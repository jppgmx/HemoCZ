/**
 * @file main.js
 * @description Funções utilitárias globais compartilhadas entre todas as páginas
 */

/**
 * Configurações de estilo para cada tipo de alerta
 * @type {Object.<string, {bg: string, border: string, text: string, icon: string}>}
 */
const ALERT_STYLES = {
    success: {
        bg: '#efe',
        border: '#27ae60',
        text: '#27ae60',
        icon: '✓'
    },
    error: {
        bg: '#fee',
        border: '#c41e3a',
        text: '#c41e3a',
        icon: '⚠️'
    },
    warning: {
        bg: '#fff3cd',
        border: '#ffc107',
        text: '#856404',
        icon: '⚡'
    },
    info: {
        bg: '#e7f3ff',
        border: '#0d6efd',
        text: '#0d6efd',
        icon: 'ℹ️'
    }
};

/**
 * Injeta as animações CSS necessárias para os alertas (apenas uma vez)
 */
(function injectAlertAnimations() {
    if (document.getElementById('alert-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'alert-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();

/**
 * Exibe um alerta customizado na tela com animação e timeout
 * @param {string} message Mensagem a ser exibida
 * @param {'success'|'error'|'warning'|'info'} type Tipo do alerta (padrão: 'success')
 * @param {number} duration Duração em milissegundos antes de fechar automaticamente (padrão: 5000)
 */
function showAlert(message, type = 'success', duration = 5000) {
    const style = ALERT_STYLES[type] || ALERT_STYLES.success;

    // Container principal do alerta
    const alertContainer = document.createElement('div');
    alertContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${style.bg};
        border: 2px solid ${style.border};
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Ubuntu', sans-serif;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 90%;
    `;

    // Ícone do alerta
    const icon = document.createElement('span');
    icon.textContent = style.icon;
    icon.style.cssText = `
        font-size: 1.5rem;
        flex-shrink: 0;
    `;

    // Texto da mensagem
    const text = document.createElement('p');
    text.textContent = message;
    text.style.cssText = `
        margin: 0;
        color: ${style.text};
        font-weight: 600;
        font-size: 1rem;
    `;

    // Botão de fechar (X)
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        color: ${style.text};
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

    // Remove automaticamente após a duração especificada
    setTimeout(() => {
        alertContainer.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => alertContainer.remove(), 300);
    }, duration);
}
