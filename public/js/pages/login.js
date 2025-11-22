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
    const errorMessage = document.createElement('p');
    errorMessage.textContent = message;
    errorMessage.style.color = 'red';
    errorMessage.style.margin = '0';
    errorMessage.style.textAlign = 'center';
    
    const loginBtn = loginForm.querySelector('button[type="submit"]');
    loginBtn.insertAdjacentElement('afterend', errorMessage);

    setTimeout(() => {
        loginForm.removeChild(errorMessage);
    }, 5000);
}