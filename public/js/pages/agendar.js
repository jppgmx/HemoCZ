/**
 * @typedef {Object} Agendamento
 * @property {string} nome O nome da pessoa
 * @property {string} tipoSanguineo O tipo sanguíneo da pessoa
 * @property {string} telefone Telefone da pessoa
 * @property {string} email E-mail da pessoa
 * @property {Date} dataHora Data/hora da coleta
 * @property {string} [id] ID única do agendamento
 */

/** @type {HTMLFormElement} */
const agendamentoForm = document.forms.agendamento

agendamentoForm.addEventListener('submit', (e) => {
    e.preventDefault()

    let dt = new Date(`${agendamentoForm.data.value}T${agendamentoForm.hora.value}:00`)
    /** @type {Agendamento} */
    let ag = {
        id: dt.getTime().toString(),
        nome: agendamentoForm.nomePessoa.value,
        tipoSanguineo: agendamentoForm.tipoSanguineo.value,
        telefone: agendamentoForm.telefone.value,
        email: agendamentoForm.email.value,
        dataHora: dt
    }

    ag.id = ag.dataHora.getTime().toString()
    validar(ag)

    if(localStorage.getItem('agendamentos') === null) {
        localStorage.setItem('agendamentos', JSON.stringify([ag]))
    } else {
        let agendamentos = JSON.parse(localStorage.getItem('agendamentos'))
        agendamentos.push(ag)
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos))
    }

    agendamentoForm.reset()
    formAlert('Agendamento realizado com sucesso!')
    
})

function formAlert(message, type='success') {
    let alertContainer = document.createElement('div')
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
    `

    let icon = document.createElement('span')
    icon.innerHTML = type === 'error' ? 
        '⚠️' : 
        '✓'
    icon.style.fontSize = '1.5rem'
    icon.style.flexShrink = '0'

    let text = document.createElement('p')
    text.textContent = message
    text.style.cssText = `
        margin: 0;
        color: ${type === 'error' ? '#c41e3a' : '#27ae60'};
        font-weight: 600;
        font-size: 1rem;
    `

    let closeBtn = document.createElement('button')
    closeBtn.innerHTML = '×'
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        color: ${type === 'error' ? '#c41e3a' : '#27ae60'};
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

function validar(agendamento) {
    
}
