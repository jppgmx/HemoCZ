let greetingsElement = document.getElementById('greetings');

let uiResponse = fetch('/api/session/userinfo', {
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
function deletarAgendamento(id) {
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    agendamentos = agendamentos.filter(a => a.id !== id);
    
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    renderizarTabelaAgendamentos(); 
}

/**
 * Atualiza o status de um agendamento para o valor selecionado.
 * @param {string} id - O ID do agendamento a ser atualizado.
 * @param {string} novoStatus - O novo status ('Aguardando Coleta' ou 'Coletado').
 */
function atualizarStatus(id, novoStatus) {
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const index = agendamentos.findIndex(a => a.id === id);

    
    if (index > -1 && ['Aguardando', 'Coletado'].includes(novoStatus)) {
        agendamentos[index].status = novoStatus;
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        renderizarTabelaAgendamentos(); 
    }
}


function renderizarTabelaAgendamentos() {
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
        
// aqui são as opções
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
                atualizarStatus(agendamento.id, newStatus);
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
                deletarAgendamento(agendamento.id);
            }
        };
        actionsCell.appendChild(deleteButton);


        row.appendChild(actionsCell);
        
        tableBody.appendChild(row);
    }
    atualizarMetricas(agendamentos); 
}
/**
 * Atualiza os cards de métricas no topo do painel.
 * @param {Array<Object>} agendamentos - Lista de agendamentos.
 */
function atualizarMetricas(agendamentos) {
    const totalAppointments = agendamentos.length;
    
    const now = new Date();
    
 
    const currentMonthAppointments = agendamentos.filter(ag => {
        const date = new Date(ag.dataHora);
        const isCurrentMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        const isCollected = ag.status === "Coletado"; 

        return isCurrentMonth && isCollected;
    }).length;

    // Conta agendamentos pendentes 
    const pendingAppointments = agendamentos.filter(ag => ag.status === "Aguardando" || ag.status === undefined).length;

    document.getElementById('total-appointments').innerText = totalAppointments;
    document.getElementById('month-appointments').innerText = currentMonthAppointments;
    document.getElementById('pending-appointments').innerText = pendingAppointments;

    // Atualizar distribuição de tipos sanguíneos
    atualizarDistribuicaoTiposSanguineos(agendamentos);
}

/**
 * Calcula e renderiza a distribuição de tipos sanguíneos
 * @param {Array<Object>} agendamentos - Lista de agendamentos.
 */
function atualizarDistribuicaoTiposSanguineos(agendamentos) {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const total = agendamentos.length;

    if (total === 0) {
        document.getElementById('blood-type-grid').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum agendamento registrado</p>';
        return;
    }

    const grid = document.getElementById('blood-type-grid');
    grid.innerHTML = '';

    
    const distribution = bloodTypes.map(type => {
        const count = agendamentos.filter(ag => ag.tipoSanguineo === type).length;
        const percentage = ((count / total) * 100).toFixed(1);
        return { type, count, percentage };
    }).filter(item => item.count > 0);

    // Se nenhum tipo tiver agendamentos, mostrar mensagem
    if (distribution.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum agendamento registrado</p>';
        return;
    }

    // Renderizar cards de tipos sanguíneos
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
function renderizarTabelaMensagens() {
    const tableBody = document.querySelector('#messages-table tbody');
    tableBody.innerHTML = '';
    let mensagens = JSON.parse(localStorage.getItem('mensagens')) || [];

    for (let mensagem of mensagens) {
        let row = document.createElement('tr');
        
        // Checkbox para seleção
        let checkboxCell = document.createElement('td');
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'message-checkbox';
        checkbox.dataset.messageId = mensagem.id;
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        
        // Nome
        let nomeCell = document.createElement('td');
        nomeCell.innerText = mensagem.nome;
        row.appendChild(nomeCell);
        
        // Email
        let emailCell = document.createElement('td');
        emailCell.innerText = mensagem.email;
        row.appendChild(emailCell);
        
        // Assunto
        let assuntoCell = document.createElement('td');
        assuntoCell.innerText = mensagem.assunto;
        row.appendChild(assuntoCell);
        
        // Mensagem (truncada com botão para abrir)
        let msgCell = document.createElement('td');
        msgCell.style.cursor = 'pointer';
        msgCell.style.color = '#8B0000';
        msgCell.style.textDecoration = 'underline';
        msgCell.innerText = mensagem.mensagem.substring(0, 50) + (mensagem.mensagem.length > 50 ? '...' : '');
        msgCell.onclick = () => abrirModalMensagem(mensagem);
        row.appendChild(msgCell);
        
        // Data
        let dataCell = document.createElement('td');
        const date = new Date(mensagem.data);
        dataCell.innerText = date.toLocaleDateString();
        row.appendChild(dataCell);
        
        tableBody.appendChild(row);
    }
}

/**
 * Deleta as mensagens selecionadas
 */
function deletarMensagensEscolhidas() {
    const checkboxes = document.querySelectorAll('.message-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Nenhuma mensagem selecionada.');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja deletar ${checkboxes.length} mensagem(ns)?`)) {
        return;
    }
    
    let mensagens = JSON.parse(localStorage.getItem('mensagens')) || [];
    const idsToDelete = Array.from(checkboxes).map(cb => cb.dataset.messageId);
    
    mensagens = mensagens.filter(m => !idsToDelete.includes(m.id));
    localStorage.setItem('mensagens', JSON.stringify(mensagens));
    
    renderizarTabelaMensagens();
}

/**
 * Aqui verificamos se a mensagem esta selecionada
 */
function enviarRespostasMensagens() {
    const checkboxes = document.querySelectorAll('.message-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('Nenhuma mensagem selecionada.');
        return;
    }
    
    const idsToRespond = Array.from(checkboxes).map(cb => cb.dataset.messageId);
    let mensagens = JSON.parse(localStorage.getItem('mensagens')) || [];
    const toAnswer = mensagens.filter(m => idsToRespond.includes(m.id))
    
    let i = 0;
    let onSend = (hasSend) => {
        if (hasSend) {
            let mensagens = JSON.parse(localStorage.getItem('mensagens')) || [];
            mensagens = mensagens.filter(m => m.id !== toAnswer[i].id);
            localStorage.setItem('mensagens', JSON.stringify(mensagens));
            
            renderizarTabelaMensagens();
        }

        if(i < toAnswer.length - 1) {
            i++;
            abrirModalResposta(toAnswer[i], i + 1, idsToRespond.length, onSend);
        }
    };
    abrirModalResposta(toAnswer[i], i + 1, idsToRespond.length, onSend);
}

/**
 * Abre o modal para responder a uma mensagem específica
 * @param {Object} mensagem - A mensagem a ser respondida.
 * @param {number} ordem - A ordem da mensagem na lista (para contador).
 * @param {function} onSend - Callback chamado após o envio da resposta.
 */
function abrirModalResposta(mensagem, ordem, total, onSend) {
    // Cria o modal dinamicamente se não existir
    let modal = document.getElementById('reply-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'reply-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="reply-modal-title">Respondendo Mensagem</h2>
                    <button class="modal-close" onclick="fecharModalResposta()">&times;</button>
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
                    <button type="button" class="btn" onclick="fecharModalResposta()" style="background-color: #999;">Cancelar</button>
                    <button type="submit" form="reply-form" class="btn" style="background-color: var(--color-primary);">Enviar Resposta</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listener para fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModalResposta();
            }
        });
    }

    modal.onSend = onSend;
    modal.dataset.hasSend = 'false';
    document.getElementById('reply-modal-title').innerText = `Enviando ${ordem} de ${total}`;

    // Preenche informações do remetente
    document.getElementById('reply-from-name').innerText = mensagem.nome;
    document.getElementById('reply-from-email').innerText = mensagem.email;
    document.getElementById('reply-subject-display').innerText = mensagem.assunto;
    document.getElementById('reply-original-message').innerText = mensagem.mensagem;

    // Limpa o corpo da resposta anterior
    const replyBodyInput = document.getElementById('reply-body');
    replyBodyInput.value = '';

    modal.style.display = 'flex';
    modal.querySelector('button[type="submit"]').disabled = false;

    // Handler para o envio do formulário
    document.getElementById('reply-form').onsubmit = async (e) => {
        e.preventDefault();
        modal.querySelector('button[type="submit"]').disabled = true;
        const corpo = replyBodyInput.value;
        
        // Simulação de envio
        console.log(`Resposta enviada para ${mensagem.email}: ${corpo}`);
        let resp = await fetch('/api/management/send-reply', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                originalMessage: mensagem,
                replyBody: corpo
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!resp.ok) {
            alert(`Falha ao enviar resposta para ${mensagem.email}.`);
        } else {
            modal.dataset.hasSend = 'true';
        }

        fecharModalResposta();
    };
}

function fecharModalResposta() {
    const modal = document.getElementById('reply-modal');
    if (modal) {
        const onSend = modal.onSend;
        const hasSend = modal.dataset.hasSend === 'true';
        modal.style.display = 'none';
        onSend(hasSend);
    }
}

function alternarSelecionarTodosMensagens(isChecked) {
    const checkboxes = document.querySelectorAll('.message-checkbox');
    checkboxes.forEach(cb => cb.checked = isChecked);
}

/**
 * Abre o modal com a mensagem completa
 */
function abrirModalMensagem(mensagem) {
    document.getElementById('modal-nome').innerText = mensagem.nome;
    document.getElementById('modal-email').innerText = mensagem.email;
    document.getElementById('modal-assunto').innerText = mensagem.assunto;
    document.getElementById('modal-mensagem').innerText = mensagem.mensagem;
    document.getElementById('modal-data').innerText = new Date(mensagem.data).toLocaleDateString('pt-BR');
    document.getElementById('message-modal').style.display = 'flex';
}


function fecharModalMensagem() {
    document.getElementById('message-modal').style.display = 'none';
}


document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('message-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModalMensagem();
            }
        });
    }
});

let ti = setInterval(async () => {
    renderizarTabelaAgendamentos();
    renderizarTabelaMensagens();
}, 5000);

renderizarTabelaAgendamentos();
renderizarTabelaMensagens();

 // Adiciona event listeners aos botões
document.getElementById('delete-messages-btn').addEventListener('click', deletarMensagensEscolhidas);
document.getElementById('send-messages-btn').addEventListener('click', enviarRespostasMensagens);
document.getElementById('select-all-messages').addEventListener('change', (e) => {
    alternarSelecionarTodosMensagens(e.target.checked);
});