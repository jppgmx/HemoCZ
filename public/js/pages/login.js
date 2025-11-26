/** @type {HTMLFormElement} */
const loginForm = document.forms.login;

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const loginCredentials = {
        username: loginForm.usuario.value,
        password: loginForm.senha.value,
    };

    try {
        const response = await fetch('/api/session/login', {
            method: 'POST',
            body: JSON.stringify(loginCredentials),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/gestao';
        } else {
            const errorData = await response.json();
            console.error('Login failed:', errorData);
            reportError(errorData.message || 'Unknown login error');
        }
    } catch (error) {
        console.error('Error during login:', error);
        reportError(error.message || 'Unknown login error');
    }
});

function reportError(message) {
    let alertContainer = document.createElement('div')
    alertContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #fee;
        border: 2px solid var(--color-primary-hover);
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
    `

    let icon = document.createElement('span')
    icon.innerHTML = '⚠️'
    icon.style.fontSize = '1.5rem'
    icon.style.flexShrink = '0'

    let text = document.createElement('p')
    text.textContent = message
    text.style.cssText = `
        margin: 0;
        color: var(--color-primary-hover);
        font-weight: 600;
        font-size: 1rem;
    `

    let closeBtn = document.createElement('button')
    closeBtn.innerHTML = '×'
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--color-primary-hover);
        cursor: pointer;
        padding: 0 4px;
        flex-shrink: 0;
    `
    closeBtn.onclick = () => alertContainer.remove()

    alertContainer.appendChild(icon)
    alertContainer.appendChild(text)
    alertContainer.appendChild(closeBtn)
    document.body.appendChild(alertContainer)

    setTimeout(() => {
        alertContainer.style.animation = 'slideOutRight 0.3s ease-in'
        setTimeout(() => alertContainer.remove(), 300)
    }, 5000)
}