/**
 * @typedef {Object} Appointment
 * @property {string} id ID único do agendamento
 * @property {string} name Nome completo da pessoa
 * @property {string} bloodType Tipo sanguíneo da pessoa
 * @property {string} phone Telefone da pessoa
 * @property {string} email E-mail da pessoa
 * @property {Date} dateTime Data e hora da coleta
 * @property {string} status Status do agendamento (ex: 'Aguardando', 'Coletado')
 */

/**
 * @typedef {Object} Message
 * @property {string} id ID único da mensagem
 * @property {string} name Nome do remetente
 * @property {string} email E-mail do remetente
 * @property {string} subject Assunto da mensagem
 * @property {string} message Conteúdo da mensagem
 * @property {string} date Data de envio em formato ISO
 */

const greetingsElement = document.getElementById('greetings');

fetch('/api/session/userinfo', {
    method: 'GET',
    credentials: 'include'
}).then(async response => {
    if (!response.ok) {
        throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    localStorage.setItem('user', data.username);
    greetingsElement.innerText = `Olá, ${data.name}!`
}).catch(error => {
    console.error('Error fetching user info:', error);
    greetingsElement.innerText = `Olá, usuário!`
});

/* Modal de assistencia */
const assistModal = document.getElementById('assistencia-modal');
const assistForm = document.getElementById('assistencia-form');
const assistCancelBtn = document.getElementById('assistencia-cancel');
const assistCloseBtn = document.getElementById('assistencia-modal-close');
const assistCreateBtn = document.getElementById('assist-create');
const assistFileInput = document.getElementById('assistencia-imagem');

function openAssistModal() {
    if (!assistModal) return;
    document.getElementById('assistencia-modal-title').innerText = 'Nova informação';
    assistForm?.reset();
    assistModal.style.display = 'flex';
}

function closeAssistModal() {
    if (!assistModal) return;
    assistModal.style.display = 'none';
}

function bindAssistenciaEvents() {
    assistCreateBtn?.addEventListener('click', () => openAssistModal());
    assistCancelBtn?.addEventListener('click', closeAssistModal);
    assistCloseBtn?.addEventListener('click', closeAssistModal);

    if (assistModal) {
        assistModal.addEventListener('click', (e) => {
            if (e.target === assistModal) closeAssistModal();
        });
    }

    assistForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const file = assistFileInput?.files?.[0];
        if (file) {
            const isValidType = ['image/png', 'image/jpeg'].includes(file.type);
            const isValidSize = file.size <= 10 * 1024 * 1024;
            if (!isValidType) {
                alert('Envie apenas imagens PNG ou JPEG.');
                return;
            }
            if (!isValidSize) {
                alert('Tamanho máximo permitido: 10 MB.');
                return;
            }
        }
        //Logica a ser implementada de envio da assistencia
        closeAssistModal();
    });
}

bindAssistenciaEvents();

/**
 * Deleta um agendamento específico do localStorage
 * @param {string} id ID do agendamento a ser deletado
 */
function deleteAppointment(id) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments = appointments.filter(appointment => appointment.id !== id);
    
    localStorage.setItem('appointments', JSON.stringify(appointments));
    renderAppointmentsTable(); 
}

/**
 * Atualiza o status de um agendamento
 * @param {string} id ID do agendamento a ser atualizado
 * @param {string} newStatus Novo status ('Aguardando' ou 'Coletado')
 */
function updateStatus(id, newStatus) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const index = appointments.findIndex(appointment => appointment.id === id);
    
    if (index > -1 && ['Aguardando', 'Coletado'].includes(newStatus)) {
        appointments[index].status = newStatus;
        localStorage.setItem('appointments', JSON.stringify(appointments));
        renderAppointmentsTable(); 
    }
}


/**
 * Renderiza a tabela de agendamentos
 */
function renderAppointmentsTable() {
    const tableBody = document.querySelector('#appointments-table tbody');
    tableBody.innerHTML = '';
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    for (let appointment of appointments) {
       
        const status = appointment.status || "Aguardando";
        
        let row = document.createElement('tr');
        const keys = ['id', 'name', 'bloodType', 'phone', 'email', 'dateTime'];

        for(let key of keys) {
            let cell = document.createElement('td');
            if (key === 'dateTime') {
                const date = new Date(appointment[key]);
                cell.innerText = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                cell.innerText = key === 'id' ? appointment[key].substring(0, 8) + '...' : appointment[key];
            }
            row.appendChild(cell);
        }


        let statusCell = document.createElement('td');
        statusCell.innerText = status;
        statusCell.className = status === "Coletado" ? 'status-coletado' : 'status-aguardando';
        row.appendChild(statusCell);

      
        let actionsCell = document.createElement('td');
        actionsCell.style.display = 'flex';
        actionsCell.style.gap = '8px';

      
        let statusSelect = document.createElement('select');
        statusSelect.className = 'status-select';
        
        const options = [
             { value: '', text: 'Status', disabled: true, selected: true }, 
             { value: 'Aguardando', text: 'Aguardando' }, 
             { value: 'Coletado', text: 'Coletado' }
        ];

        options.forEach(optionData => {
            let option = document.createElement('option');
            option.value = optionData.value;
            option.text = optionData.text;
            
            if (optionData.value === status) {
                 option.selected = true;
            }
            
            if(optionData.disabled) {
                option.disabled = true;
            }
            statusSelect.appendChild(option);
        });

       
        statusSelect.onchange = (e) => {
            const newStatus = e.target.value;
            
            if (!newStatus) return; 

            const confirmationMessage = `Confirma a alteração do status do agendamento de ${appointment.name} para "${newStatus}"?`;

            if (confirm(confirmationMessage)) {
                updateStatus(appointment.id, newStatus);
            } else {
                e.target.value = status; 
            }
        };
        actionsCell.appendChild(statusSelect);

        
        let deleteButton = document.createElement('button');
        deleteButton.innerText = 'Deletar';
        deleteButton.className = 'delete-btn';
        deleteButton.style.backgroundColor = '#c41e3a';
        deleteButton.style.color = 'white';
        deleteButton.style.padding = '5px 10px'; 
        deleteButton.style.borderRadius = '4px'; 
        deleteButton.onclick = () => {
            if (confirm(`Tem certeza que deseja deletar o agendamento de ${appointment.name}?`)) {
                deleteAppointment(appointment.id);
            }
        };
        actionsCell.appendChild(deleteButton);


        row.appendChild(actionsCell);
        
        tableBody.appendChild(row);
    }
    updateMetrics(appointments); 
}
/**
 * Atualiza as métricas no painel de controle
 * @param {Appointment[]} appointments
 */
function updateMetrics(appointments) {
    const totalAppointments = appointments.length;
    
    const now = new Date();
    
    const currentMonthAppointments = appointments.filter(appointment => {
        const date = new Date(appointment.dateTime);
        const isCurrentMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        const isCollected = appointment.status === "Coletado"; 

        return isCurrentMonth && isCollected;
    }).length;

    const pendingAppointments = appointments.filter(appointment => appointment.status === "Aguardando" || appointment.status === undefined).length;

    document.getElementById('total-appointments').innerText = totalAppointments;
    document.getElementById('month-appointments').innerText = currentMonthAppointments;
    document.getElementById('pending-appointments').innerText = pendingAppointments;

    updateBloodTypeDistribution(appointments);
}

/**
 * Calcula e renderiza a distribuição de tipos sanguíneos
 * @param {Appointment[]} appointments
 */
function updateBloodTypeDistribution(appointments) {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const total = appointments.length;

    if (total === 0) {
        document.getElementById('blood-type-grid').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum agendamento registrado</p>';
        return;
    }

    const grid = document.getElementById('blood-type-grid');
    grid.innerHTML = '';

    
    const distribution = bloodTypes.map(type => {
        const count = appointments.filter(appointment => appointment.bloodType === type).length;
        const percentage = ((count / total) * 100).toFixed(1);
        return { type, count, percentage };
    }).filter(item => item.count > 0);

    if (distribution.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum agendamento registrado</p>';
        return;
    }

    distribution.forEach(item => {
        const card = document.createElement('div');
        card.className = 'blood-type-card';
        card.innerHTML = `
            <div class="blood-type-header">
                <span class="blood-type-badge">${item.type}</span>
            </div>
            <div class="blood-type-stats">
                <p class="blood-type-count">${item.count} doador${item.count !== 1 ? 'es' : ''}</p>
                <p class="blood-type-percentage">${item.percentage}%</p>
            </div>
            <div class="blood-type-bar">
                <div class="blood-type-fill" style="width: ${item.percentage}%"></div>
            </div>
        `;
        grid.appendChild(card);
    });
}


/**
 * Renderiza a tabela de mensagens recebidas
 */
function renderMessagesTable() {
    const tableBody = document.querySelector('#messages-table tbody');
    tableBody.innerHTML = '';
    let messages = JSON.parse(localStorage.getItem('messages')) || [];

    for (let message of messages) {
        let row = document.createElement('tr');
        
        let checkboxCell = document.createElement('td');
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'message-checkbox';
        checkbox.dataset.messageId = message.id;
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        
        let nameCell = document.createElement('td');
        nameCell.innerText = message.name;
        row.appendChild(nameCell);
        
        let emailCell = document.createElement('td');
        emailCell.innerText = message.email;
        row.appendChild(emailCell);
        
        let subjectCell = document.createElement('td');
        subjectCell.innerText = message.subject;
        row.appendChild(subjectCell);
        
        let msgCell = document.createElement('td');
        msgCell.style.cursor = 'pointer';
        msgCell.style.color = '#8B0000';
        msgCell.style.textDecoration = 'underline';
        msgCell.innerText = message.message.substring(0, 50) + (message.message.length > 50 ? '...' : '');
        msgCell.onclick = () => openMessageModal(message);
        row.appendChild(msgCell);
        
        let dateCell = document.createElement('td');
        const date = new Date(message.date);
        dateCell.innerText = date.toLocaleDateString();
        row.appendChild(dateCell);
        
        tableBody.appendChild(row);
    }
}

/**
 * Deleta as mensagens selecionadas
 */
function deleteSelectedMessages() {
    const checkboxes = document.querySelectorAll('.message-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Nenhuma mensagem selecionada.');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja deletar ${checkboxes.length} mensagem(ns)?`)) {
        return;
    }
    
    let messages = JSON.parse(localStorage.getItem('messages')) || [];
    const idsToDelete = Array.from(checkboxes).map(cb => cb.dataset.messageId);
    
    messages = messages.filter(m => !idsToDelete.includes(m.id));
    localStorage.setItem('messages', JSON.stringify(messages));
    
    renderMessagesTable();
}

/**
 * Envia respostas para as mensagens selecionadas
 */
function sendMessageReplies() {
    const checkboxes = document.querySelectorAll('.message-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Nenhuma mensagem selecionada.');
        return;
    }
    
    const idsToRespond = Array.from(checkboxes).map(cb => cb.dataset.messageId);
    let messages = JSON.parse(localStorage.getItem('messages')) || [];
    const toAnswer = messages.filter(m => idsToRespond.includes(m.id))
    
    let i = 0;
    let onSend = (hasSend) => {
        if (hasSend) {
            let messages = JSON.parse(localStorage.getItem('messages')) || [];
            messages = messages.filter(m => m.id !== toAnswer[i].id);
            localStorage.setItem('messages', JSON.stringify(messages));
            
            renderMessagesTable();
        }

        if(i < toAnswer.length - 1) {
            i++;
            openReplyModal(toAnswer[i], i + 1, idsToRespond.length, onSend);
        }
    };
    openReplyModal(toAnswer[i], i + 1, idsToRespond.length, onSend);
}

/**
 * Abre o modal para responder uma mensagem
 * @param {Message} message
 * @param {number} order Ordem da mensagem na lista
 * @param {number} total Total de mensagens a responder
 * @param {function} onSend Callback após envio
 */
function openReplyModal(message, order, total, onSend) {
    let modal = document.getElementById('reply-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'reply-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="reply-modal-title">Respondendo Mensagem</h2>
                    <button class="modal-close" onclick="closeReplyModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-info-row">
                        <strong>De:</strong> <span id="reply-from-name"></span>
                    </div>
                    <div class="modal-info-row">
                        <strong>Email:</strong> <span id="reply-from-email"></span>
                    </div>
                    <div class="modal-info-row">
                        <strong>Assunto:</strong> <span id="reply-subject-display"></span>
                    </div>
                    <div class="modal-message-content">
                        <p id="reply-original-message"></p>
                    </div>
                    <form id="reply-form">
                        <div class="form-group" style="margin-top: 20px;">
                            <label for="reply-body" style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--color-text);">Sua Resposta:</label>
                            <textarea id="reply-body" rows="5" required style="width: 100%; padding: 12px; border: 1px solid var(--color-border); border-radius: 6px; font-family: 'Ubuntu', sans-serif; font-size: 0.95rem; resize: vertical;"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn" onclick="closeReplyModal()" style="background-color: #999;">Cancelar</button>
                    <button type="submit" form="reply-form" class="btn" style="background-color: var(--color-primary);">Enviar Resposta</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeReplyModal();
            }
        });
    }

    modal.onSend = onSend;
    modal.dataset.hasSend = 'false';
    document.getElementById('reply-modal-title').innerText = `Enviando ${order} de ${total}`;

    document.getElementById('reply-from-name').innerText = message.name;
    document.getElementById('reply-from-email').innerText = message.email;
    document.getElementById('reply-subject-display').innerText = message.subject;
    document.getElementById('reply-original-message').innerText = message.message;

    const replyBodyInput = document.getElementById('reply-body');
    replyBodyInput.value = '';

    modal.style.display = 'flex';
    modal.querySelector('button[type="submit"]').disabled = false;

    document.getElementById('reply-form').onsubmit = async (e) => {
        e.preventDefault();
        modal.querySelector('button[type="submit"]').disabled = true;
        const body = replyBodyInput.value;
        
        console.log(`Resposta enviada para ${message.email}: ${body}`);
        let resp = await fetch('/api/management/send-reply', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                originalMessage: message,
                replyBody: body
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!resp.ok) {
            alert(`Falha ao enviar resposta para ${message.email}.`);
        } else {
            modal.dataset.hasSend = 'true';
        }

        closeReplyModal();
    };
}

function closeReplyModal() {
    const modal = document.getElementById('reply-modal');
    if (modal) {
        const onSend = modal.onSend;
        const hasSend = modal.dataset.hasSend === 'true';
        modal.style.display = 'none';
        onSend(hasSend);
    }
}

function toggleSelectAllMessages(isChecked) {
    const checkboxes = document.querySelectorAll('.message-checkbox');
    checkboxes.forEach(cb => cb.checked = isChecked);
}

/**
 * Abre o modal com a mensagem completa
 */
function openMessageModal(message) {
    document.getElementById('modal-name').innerText = message.name;
    document.getElementById('modal-email').innerText = message.email;
    document.getElementById('modal-subject').innerText = message.subject;
    document.getElementById('modal-message').innerText = message.message;
    document.getElementById('modal-date').innerText = new Date(message.date).toLocaleDateString('pt-BR');
    document.getElementById('message-modal').style.display = 'flex';
}

function closeMessageModal() {
    document.getElementById('message-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('message-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeMessageModal();
            }
        });
    }
});

setInterval(async () => {
    renderAppointmentsTable();
    renderMessagesTable();
}, 5000);

renderAppointmentsTable();
renderMessagesTable();

document.getElementById('delete-messages-btn').addEventListener('click', deleteSelectedMessages);
document.getElementById('send-messages-btn').addEventListener('click', sendMessageReplies);
document.getElementById('select-all-messages').addEventListener('change', (e) => {
    toggleSelectAllMessages(e.target.checked);
});