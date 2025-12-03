let greetingsElement = document.getElementById('greetings');

let uiResponse = fetch('/api/session/user-info', {
    method: 'GET',
    credentials: 'include'
}).then(async response => {
    if (!response.ok) {
        throw new Error('Failed to fetch user info');
    }

    let data = await response.json();
    localStorage.setItem('user', data.username);
    greetingsElement.innerText = `Olá, ${data.name}!`
}).catch(error => {
    console.error('Error fetching user info:', error);
    greetingsElement.innerText = `Olá, usuário!`
});

/**
 * Deleta um agendamento específico do localStorage pelo seu ID único.
 * @param {string} id - O ID do agendamento a ser deletado.
 */
function deleteAppointment(id) {
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    agendamentos = agendamentos.filter(a => a.id !== id);
    
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    renderAppointmentsTable(); 
}

/**
 * Atualiza o status de um agendamento para o valor selecionado.
 * @param {string} id - O ID do agendamento a ser atualizado.
 * @param {string} newStatus - O novo status ('Aguardando Coleta' ou 'Coletado').
 */
function updateStatus(id, newStatus) {
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const index = agendamentos.findIndex(a => a.id === id);

    
    if (index > -1 && ['Aguardando', 'Coletado'].includes(newStatus)) {
        agendamentos[index].status = newStatus;
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        renderAppointmentsTable(); 
    }
}


function renderAppointmentsTable() {
    const tableBody = document.querySelector('#appointments-table tbody');
    tableBody.innerHTML = '';
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

    for (let agendamento of agendamentos) {
       
        const status = agendamento.status || "Aguardando";
        
        let row = document.createElement('tr');
        const keys = ['id', 'nome', 'tipoSanguineo', 'telefone', 'email', 'dataHora'];

        for(let key of keys) {
            let cell = document.createElement('td');
            if (key === 'dataHora') {
                const date = new Date(agendamento[key]);
                cell.innerText = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                cell.innerText = key === 'id' ? agendamento[key].substring(0, 8) + '...' : agendamento[key];
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
        
// Cria as opções do select
        const options = [
             { value: '', text: 'Status', disabled: true, selected: true }, 
             { value: 'Aguardando', text: 'Aguardando' }, 
             { value: 'Coletado', text: 'Coletado' }
        ];

        options.forEach(optionData => {
            let option = document.createElement('option');
            option.value = optionData.value;
            option.text = optionData.text;
            
            // Define o status selecionado com base no status atual do agendamento
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

            const confirmationMessage = `Confirma a alteração do status do agendamento de ${agendamento.nome} para "${newStatus}"?`;

            if (confirm(confirmationMessage)) {
                // Se o usuário confirmar, atualiza o status
                updateStatus(agendamento.id, newStatus);
            } else {
                // caso cancelar a opção volta ao status anterior
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
            if (confirm(`Tem certeza que deseja deletar o agendamento de ${agendamento.nome}?`)) {
                deleteAppointment(agendamento.id);
            }
        };
        actionsCell.appendChild(deleteButton);


        row.appendChild(actionsCell);
        
        tableBody.appendChild(row);
    }
    updateMetrics(agendamentos); 
}


/**
 * Atualiza os cards de métricas no topo do painel.
 * @param {Array<Object>} agendamentos - Lista de agendamentos.
 */
function updateMetrics(agendamentos) {
    const totalAppointments = agendamentos.length;
    
    const now = new Date();
    
 
    const currentMonthAppointments = agendamentos.filter(ag => {
        const date = new Date(ag.dataHora);
        const isCurrentMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        const isCollected = ag.status === "Coletado"; 

        return isCurrentMonth && isCollected;
    }).length;

    // Conta agendamentos pendentes (Aguardando)
    const pendingAppointments = agendamentos.filter(ag => ag.status === "Aguardando" || ag.status === undefined).length;

    document.getElementById('total-appointments').innerText = totalAppointments;
    document.getElementById('month-appointments').innerText = currentMonthAppointments;
    document.getElementById('pending-appointments').innerText = pendingAppointments;
}


let ti = setInterval(async () => {
    renderAppointmentsTable();
}, 5000);

renderAppointmentsTable();