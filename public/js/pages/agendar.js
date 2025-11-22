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
    let msg = document.createElement('p')
    msg.textContent = message
    msg.style.color = type === 'error' ? 'red' : 'green'
    msg.style.textAlign = 'center'
    agendamentoForm.insertAdjacentElement('afterend', msg)

    setTimeout(() => {
        msg.remove()
    }, 5000)
}

function validar(agendamento) {
    
}
