/**
 * @typedef {Object} Agendamento
 * @property {string} nome O nome da pessoa
 * @property {string} tipoSanguineo O tipo sanguíneo da pessoa
 * @property {string} telefone Telefone da pessoa
 * @property {string} email E-mail da pessoa
 * @property {Date} dataHora Data/hora da coleta
 * @property {string} [id] ID única do agendamento
 * @property {string} [status] O status do agendamento 
 */

/** @type {HTMLFormElement} */
const agendamentoForm = document.forms.agendamento
const inputData = agendamentoForm.data;
const selectHora = agendamentoForm.hora;


//(Inspirado em um codigo que vi no github)
function pegardatadehoje() {
    const today = new Date();
    // Ajuste para o fuso horário local para evitar problemas de data
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - offset)).toISOString().substring(0, 10);
    return localISOTime;
}

// Define a data mínima como hoje
inputData.min = pegardatadehoje(); 


const MAX_VAGAS_POR_HORA = 4;
const HORARIOS_DISPONIVEIS = ['07', '08', '09', '10', '11', '12'];

/**
 * 
 * @param {string} dataString - 
 * @param {string} horaString -
 * @returns {number} 
 */
function getAvailability(dataString, horaString) {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    let count = 0;

    for (const ag of agendamentos) {
        try {
            const agDate = new Date(ag.dataHora);
            
            // Verifica se a data e a hora
            if (agDate.toISOString().substring(0, 10) === dataString &&
                agDate.getHours().toString().padStart(2, '0') === horaString) {
                count++;
            }
        } catch (e) {
            // Ignora os agendamentos inválidos
            console.error("Agendamento inválido:", ag);
        }
    }
    return count;
}

//função que seta os horarios disponíveis no select
function renderTimeSlots() {
    const selectedDate = inputData.value;
    selectHora.innerHTML = '';
    
    // Aqui é onde validamos a data (Inspirado em um codigo que vi no github)
    const todayString = pegardatadehoje();

    if (!selectedDate || selectedDate < todayString) { // Verifica se a data é anterior a hoje
        let defaultOption = document.createElement('option');
        defaultOption.value = '';

        if (!selectedDate) {
            defaultOption.textContent = 'Selecione a Data primeiro';
        } else {
            // Aqui impede selecionar datas passadas
            defaultOption.textContent = 'Data Inválida: Não é possível agendar para datas passadas';
            defaultOption.disabled = true;
        }

        selectHora.appendChild(defaultOption);
        return;
    }

    

    
    let headerOption = document.createElement('option');
    headerOption.value = '';
    headerOption.textContent = 'Selecione o Horário';
    selectHora.appendChild(headerOption);

    // aqui preenche as opcoes de horario
    for (let h of HORARIOS_DISPONIVEIS) {
        const agendados = getAvailability(selectedDate, h);
        const vagasDisponiveis = MAX_VAGAS_POR_HORA - agendados;
        const horaFormatada = `${h}:00h`;

        let option = document.createElement('option');
        option.value = h; 
        option.textContent = `${horaFormatada} (${vagasDisponiveis} vaga${vagasDisponiveis !== 1 ? 's' : ''})`;
        
        // se nao tiver vagas, desabilita a opcao
        if (vagasDisponiveis <= 0) {
            option.disabled = true;
            option.textContent += ' - Sem Vagas';
        }
        
        selectHora.appendChild(option);
    }
}


inputData.addEventListener('change', renderTimeSlots);


renderTimeSlots();



agendamentoForm.addEventListener('submit', (e) => {
    e.preventDefault()

  
    const horaSelecionada = selectHora.value.padStart(2, '0');
    let dt = new Date(`${inputData.value}T${horaSelecionada}:00:00`); 
    
    
    if (!horaSelecionada) {
        formAlert("Por favor, selecione um horário válido.", 'error');
        return;
    }

    /** @type {Agendamento} */
    let ag = {
        id: crypto.randomUUID(), 
        nome: agendamentoForm.nomePessoa.value,
        tipoSanguineo: agendamentoForm.tipoSanguineo.value,
        telefone: agendamentoForm.telefone.value,
        email: agendamentoForm.email.value,
        dataHora: dt,
        status: "Aguardando" 
    }

    try {
        validar(ag)
    } catch (error) {
        formAlert(error.message, 'error')
        return
    }
    
    // Verifica disponibilidade antes de confirmar o agendamento
    const agendadosNoHorario = getAvailability(inputData.value, horaSelecionada);
    if (agendadosNoHorario >= MAX_VAGAS_POR_HORA) {
        formAlert("Desculpe, este horário acabou de ser preenchido. Por favor, selecione outro.", 'error');
        renderTimeSlots(); 
        return;
    }


    if(localStorage.getItem('agendamentos') === null) {
        localStorage.setItem('agendamentos', JSON.stringify([ag]))
    } else {
        let agendamentos = JSON.parse(localStorage.getItem('agendamentos'))
        agendamentos.push(ag)
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos))
    }

    agendamentoForm.reset()
    formAlert('Agendamento realizado com sucesso!')
    renderTimeSlots(); // Atualiza a lista após o agendamento
    
})

//função de alerta customizado
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
    const agendamentosExistentes = JSON.parse(localStorage.getItem('agendamentos')) || []
    
    const novoEmail = agendamento.email.toLowerCase()

    const agendamentoDuplicado = agendamentosExistentes.find(ag => {
        const agEmail = ag.email ? ag.email.toLowerCase() : '';
        return agEmail === novoEmail && ag.status === 'Aguardando'
    })

    if (agendamentoDuplicado) {
        throw new Error(`O e-mail ${agendamento.email} já possui um agendamento pendente. Por favor, aguarde a data da coleta ou entre em contato com a gestão.`)
    }
}