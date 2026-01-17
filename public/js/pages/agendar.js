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
async function checkAvailability(dateString, timeString) {
    const response = await fetch(`/api/appointments/count?dateTime=${dateString}T${timeString}:00:00`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const result = await response.json();
    return result.count;
}

/**
 * Renderiza os horários disponíveis no select com base na data selecionada
 */
async function renderTimeSlots() {
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
        const scheduled = await checkAvailability(selectedDate, timeHour);
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
inputDate.addEventListener('change', async () => {
    await renderTimeSlots();
});
appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const selectedTime = selectTime.value.padStart(2, '0');
    const selectedDate = inputDate.value;
    
    // Validação inicial de horário selecionado
    if (!selectedTime) {
        formAlert("Por favor, selecione um horário válido.", 'error');
        return;
    }

    // Validação inicial de data selecionada
    if (!selectedDate) {
        formAlert("Por favor, selecione uma data.", 'error');
        return;
    }

    let dateTime = new Date(`${selectedDate}T${selectedTime}:00:00`);

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

    fetch('/api/appointments/create', {
        method: 'POST',
        body: JSON.stringify(appointment),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async response => {
        const status = await response.json();
        formAlert(status.message, response.ok ? 'success' : 'error');
    }).catch(error => {
        console.error('Erro na requisição:', error);
        formAlert('Erro ao salvar o agendamento no servidor.', 'error');
        return;
    });

    await renderTimeSlots(); // Atualiza a lista após o agendamento
    appointmentForm.reset();
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
 * Valida se um endereço de e-mail possui formato válido
 * @param {string} email E-mail a ser validado
 * @returns {boolean} True se o e-mail for válido
 */
function isValidEmail(email) {
    // Regex RFC 5322 simplificada para validação de e-mail
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

/**
 * Valida se um número de telefone possui formato válido
 * @param {string} phone Telefone a ser validado
 * @returns {boolean} True se o telefone for válido
 */
function isValidPhone(phone) {
    // Formato: (XX) 9XXXX-XXXX
    const phoneRegex = /^\(\d{2}\)\s9\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
}

/**
 * Valida se um nome possui formato válido
 * @param {string} name Nome a ser validado
 * @returns {boolean} True se o nome for válido
 */
function isValidName(name) {
    // Apenas letras e espaços, 3-80 caracteres
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,80}$/;
    return nameRegex.test(name);
}

/**
 * Valida se um agendamento pode ser criado
 * Verifica todos os campos obrigatórios, formatos e se já existe um agendamento pendente
 * @param {Appointment} appointment Objeto do agendamento a ser validado
 * @throws {Error} Se alguma validação falhar
 */
function validate(appointment) {
    // 1. Validar nome
    if (!appointment.name.trim()) {
        throw new Error('O campo Nome Completo é obrigatório.');
    }
    if (!isValidName(appointment.name)) {
        throw new Error('Nome inválido. Use apenas letras e espaços (3 a 80 caracteres).');
    }

    // 2. Validar email
    if (!appointment.email.trim()) {
        throw new Error('O campo E-mail é obrigatório.');
    }
    if (!isValidEmail(appointment.email)) {
        throw new Error('Por favor, insira um endereço de e-mail válido.');
    }

    // 3. Validar telefone
    if (!appointment.phone.trim()) {
        throw new Error('O campo Telefone é obrigatório.');
    }
    if (!isValidPhone(appointment.phone)) {
        throw new Error('Telefone inválido. Use o formato: (XX) 9XXXX-XXXX');
    }

    // 4. Validar tipo sanguíneo
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!appointment.bloodType || !validBloodTypes.includes(appointment.bloodType)) {
        throw new Error('Por favor, selecione um tipo sanguíneo válido.');
    }

    // 5. Validar data
    if (!appointment.dateTime || isNaN(appointment.dateTime.getTime())) {
        throw new Error('Por favor, selecione uma data válida.');
    }

    // 6. Validar horário selecionado
    const selectedHour = appointment.dateTime.getHours().toString().padStart(2, '0');
    if (!AVAILABLE_TIMES.includes(selectedHour)) {
        throw new Error('Por favor, selecione um horário válido.');
    }

    // 7. Verificar disponibilidade de vagas para o horário
    const dateString = appointment.dateTime.toISOString().substring(0, 10);
    const scheduledAtTime = checkAvailability(dateString, selectedHour);
    if (scheduledAtTime >= MAX_SLOTS_PER_HOUR) {
        throw new Error(`O horário ${selectedHour}:00h não possui mais vagas disponíveis. Por favor, selecione outro horário.`);
    }
}