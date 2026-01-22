/**
 * @typedef {Object} LoginCredentials
 * @property {string} username Nome de usuário
 * @property {string} password Senha do usuário
 */

/** @type {HTMLFormElement} */
const loginForm = document.forms.login;

/**
 * Manipula o envio do formulário de login
 */
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    /** @type {LoginCredentials} */
    const loginCredentials = {
        username: loginForm.username.value,
        password: loginForm.password.value,
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
            showAlert(errorData.message || 'Erro desconhecido no login', 'error');
        }
    } catch (error) {
        console.error('Error during login:', error);
        showAlert(error.message || 'Erro desconhecido no login', 'error');
    }
});