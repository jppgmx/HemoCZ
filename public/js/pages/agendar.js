/**
 * @typedef {Object} Appointment
 * @property {string} name Nome completo da pessoa
 * @property {string} bloodType Tipo sanguíneo da pessoa
 * @property {string} phone Telefone da pessoa
 * @property {string} email E-mail da pessoa
 * @property {Date} dateTime Data e hora da coleta
 * @property {string} [id] ID único do agendamento
 * @property {string} [status] Status do agendamento (ex: 'Aguardando', 'Coletado')
 */

/** @type {HTMLFormElement} */
const appointmentForm = document.forms.appointment
const inputDate = appointmentForm.date;
const selectTime = appointmentForm.time;


/**
 * Obtém a data atual no formato ISO (YYYY-MM-DD)
 * @returns {string} Data atual no formato ISO
 */
function getTimeOfDay() {
    const today = new Date();
    // Ajuste para o fuso horário local para evitar problemas de data
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - offset)).toISOString().substring(0, 10);
    return localISOTime;
}

// Define a data mínima como hoje
inputDate.min = getTimeOfDay(); 


const MAX_SLOTS_PER_HOUR = 4;
const AVAILABLE_TIMES = ['07', '08', '09', '10', '11', '12'];

/**
 * Verifica quantos agendamentos existem para uma data e horário específicos
 * @param {string} dateString Data no formato ISO (YYYY-MM-DD)
 * @param {string} timeString Hora no formato 24h (ex: '07', '08')
 * @returns {number} Número de agendamentos para aquele horário
 */
function checkAvailability(dateString, timeString) {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    let count = 0;

    for (const appointment of appointments) {
        try {
            const appointmentDate = new Date(appointment.dateTime);
            
            // Verifica se a data e a hora correspondem
            if (appointmentDate.toISOString().substring(0, 10) === dateString &&
                appointmentDate.getHours().toString().padStart(2, '0') === timeString) {
                count++;
            }
        } catch (e) {
            // Ignora os agendamentos inválidos
            console.error("Agendamento inválido:", appointment);
        }
    }
    return count;
}

/**
 * Renderiza os horários disponíveis no select com base na data selecionada
 */
function renderTimeSlots() {
    const selectedDate = inputDate.value;
    selectTime.innerHTML = '';
    
    // Aqui é onde validamos a data (Inspirado em um codigo que vi no github)
    const todayString = getTimeOfDay();

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

        selectTime.appendChild(defaultOption);
        return;
    }

    

    
    let headerOption = document.createElement('option');
    headerOption.value = '';
    headerOption.textContent = 'Selecione o Horário';
    selectTime.appendChild(headerOption);

    // aqui preenche as opcoes de horario
    for (let timeHour of AVAILABLE_TIMES) {
        const scheduled = checkAvailability(selectedDate, timeHour);
        const availableSlots = MAX_SLOTS_PER_HOUR - scheduled;
        const formattedTime = `${timeHour}:00h`;

        let option = document.createElement('option');
        option.value = timeHour; 
        option.textContent = `${formattedTime} (${availableSlots} vaga${availableSlots !== 1 ? 's' : ''})`;
        
        // se nao tiver vagas, desabilita a opcao
        if (availableSlots <= 0) {
            option.disabled = true;
            option.textContent += ' - Sem Vagas';
        }
        
        selectTime.appendChild(option);
    }
}
inputDate.addEventListener('change', renderTimeSlots);
renderTimeSlots();
appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault()

  
    const selectedTime = selectTime.value.padStart(2, '0');
    let dateTime = new Date(`${inputDate.value}T${selectedTime}:00:00`); 
    
    
    if (!selectedTime) {
        formAlert("Por favor, selecione um horário válido.", 'error');
        return;
    }

    /** @type {Appointment} */
    let appointment = {
        id: crypto.randomUUID(), 
        name: appointmentForm.name.value,
        bloodType: appointmentForm.bloodType.value,
        phone: appointmentForm.phone.value,
        email: appointmentForm.email.value,
        dateTime: dateTime,
        status: "Aguardando" 
    }

    try {
        validate(appointment)
    } catch (error) {
        formAlert(error.message, 'error')
        return
    }
    
    // Verifica disponibilidade antes de confirmar o agendamento
    const scheduledAtTime = checkAvailability(inputDate.value, selectedTime);
    if (scheduledAtTime >= MAX_SLOTS_PER_HOUR) {
        formAlert("Desculpe, este horário acabou de ser preenchido. Por favor, selecione outro.", 'error');
        renderTimeSlots(); 
        return;
    }


    if(localStorage.getItem('appointments') === null) {
        localStorage.setItem('appointments', JSON.stringify([appointment]))
    } else {
        let appointments = JSON.parse(localStorage.getItem('appointments'))
        appointments.push(appointment)
        localStorage.setItem('appointments', JSON.stringify(appointments))
    }

    appointmentForm.reset()
    formAlert('Agendamento realizado com sucesso!')
    renderTimeSlots(); // Atualiza a lista após o agendamento
    
})

/**
 * Exibe um alerta customizado na tela
 * @param {string} message Mensagem a ser exibida
 * @param {string} type Tipo do alerta ('success' ou 'error')
 */
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

/**
 * Valida se um agendamento pode ser criado
 * Verifica se o e-mail já possui um agendamento pendente
 * @param {Appointment} appointment Objeto do agendamento a ser validado
 * @throws {Error} Se o e-mail já possuir um agendamento pendente
 */
function validate(appointment) {
    const existingAppointments = JSON.parse(localStorage.getItem('appointments')) || []
    
    const newEmail = appointment.email.toLowerCase()

    const duplicateAppointment = existingAppointments.find(existing => {
        const existingEmail = existing.email ? existing.email.toLowerCase() : '';
        return existingEmail === newEmail && existing.status === 'Aguardando'
    })

    if (duplicateAppointment) {
        throw new Error(`O e-mail ${appointment.email} já possui um agendamento pendente. Por favor, aguarde a data da coleta ou entre em contato com a gestão.`)
    }
}