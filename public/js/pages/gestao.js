/**
 * @typedef {Object} Appointment
 * @property {string} id ID único do agendamento
 * @property {string} name Nome completo da pessoa
 * @property {string} blood_type Tipo sanguíneo da pessoa
 * @property {string} phone Telefone da pessoa
 * @property {string} email E-mail da pessoa
 * @property {Date} appointment_date Data e hora da coleta
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

/**
 * Valida se um caractere é um emoji
 * @param {string} char Caractere a ser validado
 * @returns {boolean} True se for um emoji válido
 */
function isValidEmoji(char) {
    // Regex para detectar emojis comuns
    const emojiRegex = /\p{Extended_Pictographic}/u;
    return emojiRegex.test(char);
}

/* Modal de assistencia */
const assistModal = document.getElementById('assistencia-modal');
const assistForm = document.getElementById('assistencia-form');
const assistCancelBtn = document.getElementById('assistencia-cancel');
const assistCloseBtn = document.getElementById('assistencia-modal-close');
const assistCreateBtn = document.getElementById('assist-create');
const assistTipoSelect = document.getElementById('assistencia-tipo');

/**
 * Mostra/oculta campos do formulário baseado no tipo selecionado
 */
function handleTipoChange() {
    const tipo = assistTipoSelect?.value;
    
    // Oculta todos os grupos de campos
    document.querySelectorAll('.tipo-fields').forEach(field => {
        field.style.display = 'none';
        // Limpa os valores dos campos
        field.querySelectorAll('input, textarea').forEach(input => {
            if (input.type === 'file') {
                input.value = '';
            } else {
                input.value = '';
            }
        });
    });

    // Mostra apenas os campos do tipo selecionado
    if (tipo === 'Campanha') {
        document.getElementById('campanha-fields').style.display = 'block';
    } else if (tipo === 'Evento') {
        document.getElementById('evento-fields').style.display = 'block';
    } else if (tipo === 'Anuncio') {
        document.getElementById('anuncio-fields').style.display = 'block';
    }
}

/**
 * Busca os dados de uma assistência pelo ID e tipo
 * @param {string} id - ID da assistência
 * @param {string} tipo - Tipo: 'Campanha', 'Evento' ou 'Anuncio'
 * @returns {Promise<Object|null>} Dados da assistência ou null se não encontrar
 */
async function fetchAssistenciaData(id, tipo) {
    try {
        let endpoint = '';
        if (tipo === 'Campanha') {
            endpoint = '/api/assistance/campaigns';
        } else if (tipo === 'Evento') {
            endpoint = '/api/assistance/events';
        } else if (tipo === 'Anuncio') {
            endpoint = '/api/assistance/announcements';
        }

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Erro ao buscar dados');
        
        const items = await response.json();
        return items.find(item => String(item.id) === String(id)) || null;
    } catch (error) {
        console.error('Erro ao buscar dados da assistência:', error);
        return null;
    }
}

/**
 * Preenche os campos do formulário com os dados existentes
 * @param {string} tipo - Tipo da assistência
 * @param {Object} data - Dados da assistência
 */
function preencherCamposEdicao(tipo, data) {
    if (tipo === 'Campanha') {
        const emojiInput = document.getElementById('campanha-emoji');
        const nomeInput = document.getElementById('campanha-nome');
        const descricaoInput = document.getElementById('campanha-descricao');
        
        if (emojiInput) emojiInput.value = data.icon || '';
        if (nomeInput) nomeInput.value = data.title || '';
        if (descricaoInput) descricaoInput.value = data.description || '';
        
    } else if (tipo === 'Evento') {
        const tituloInput = document.getElementById('evento-titulo');
        const ruaInput = document.getElementById('evento-rua');
        const numeroInput = document.getElementById('evento-numero');
        const bairroInput = document.getElementById('evento-bairro');
        const cidadeInput = document.getElementById('evento-cidade');
        const estadoInput = document.getElementById('evento-estado');
        const datetimeInput = document.getElementById('evento-datetime');
        const descricaoInput = document.getElementById('evento-descricao');
        
        if (tituloInput) tituloInput.value = data.title || '';
        if (ruaInput) ruaInput.value = data.street || '';
        if (numeroInput) numeroInput.value = data.number || '';
        if (bairroInput) bairroInput.value = data.neighborhood || '';
        if (cidadeInput) cidadeInput.value = data.city || '';
        if (estadoInput) estadoInput.value = data.state || '';
        if (datetimeInput) {
            // Formata a data para o formato esperado pelo input datetime-local
            const dt = new Date(data.datetime);
            if (!isNaN(dt.getTime())) {
                const formatted = dt.toISOString().slice(0, 16);
                datetimeInput.value = formatted;
            }
        }
        if (descricaoInput) descricaoInput.value = data.description || '';
        
    } else if (tipo === 'Anuncio') {
        const tituloInput = document.getElementById('anuncio-titulo');
        const descricaoInput = document.getElementById('anuncio-descricao');
        
        if (tituloInput) tituloInput.value = data.title || '';
        if (descricaoInput) descricaoInput.value = data.text || '';
        // Nota: O campo de imagem não pode ser preenchido programaticamente por segurança do navegador
    }
}

async function openAssistModal(editData = null) {
    if (!assistModal) return;
    
    assistForm?.reset();
    handleTipoChange(); // Reseta os campos
    
    if (editData) {
        document.getElementById('assistencia-modal-title').innerText = 'Editar informação';
        document.getElementById('assistencia-id').value = editData.id;
        // Bloqueia edição do tipo
        if (assistTipoSelect) {
            assistTipoSelect.disabled = true;
            assistTipoSelect.value = editData.tipo;
            handleTipoChange();
        }
        
        // Busca e preenche os dados existentes
        const dadosExistentes = await fetchAssistenciaData(editData.id, editData.tipo);
        if (dadosExistentes) {
            preencherCamposEdicao(editData.tipo, dadosExistentes);
        }
    } else {
        document.getElementById('assistencia-modal-title').innerText = 'Nova informação';
        document.getElementById('assistencia-id').value = '';
        // Habilita edição do tipo
        if (assistTipoSelect) {
            assistTipoSelect.disabled = false;
        }
    }
    
    assistModal.style.display = 'flex';
}

function closeAssistModal() {
    if (!assistModal) return;
    assistModal.style.display = 'none';
    assistForm?.reset();
    handleTipoChange();
}

function bindAssistenciaEvents() {
    assistCreateBtn?.addEventListener('click', () => openAssistModal());
    assistCancelBtn?.addEventListener('click', closeAssistModal);
    assistCloseBtn?.addEventListener('click', closeAssistModal);
    
    // Event listener para mudança de tipo
    assistTipoSelect?.addEventListener('change', handleTipoChange);

    if (assistModal) {
        assistModal.addEventListener('click', (e) => {
            if (e.target === assistModal) closeAssistModal();
        });
    }

    assistForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const tipo = assistTipoSelect?.value;
        const id = document.getElementById('assistencia-id')?.value;

        // Validações específicas por tipo
        if (tipo === 'Campanha') {
            const emoji = document.getElementById('campanha-emoji')?.value;
            const nome = document.getElementById('campanha-nome')?.value;
            const descricao = document.getElementById('campanha-descricao')?.value;
            
            if (!emoji || !nome || !descricao) {
                showAlert('Preencha todos os campos obrigatórios.', 'error');
                return;
            }
            
            const emojiChars = Array.from(emoji);
            if (emojiChars.length !== 1) {
                showAlert('O emoji deve conter exatamente 1 caractere.', 'error');
                return;
            }
            
            if (!isValidEmoji(emoji)) {
                showAlert('Por favor, insira um emoji válido.', 'error');
                return;
            }
            
            if (nome.trim().length < 3) {
                showAlert('O nome da campanha deve ter pelo menos 3 caracteres.', 'error');
                return;
            }
            
            if (descricao.trim().length < 10) {
                showAlert('As informações devem ter pelo menos 10 caracteres.', 'error');
                return;
            }

            if (id) {
                editarAssistencia(id, { tipo, emoji, nome, descricao });
            } else {
                criarAssistencia({ tipo, emoji, nome, descricao });
            }
            
        } else if (tipo === 'Evento') {
            const titulo = document.getElementById('evento-titulo')?.value;
            const rua = document.getElementById('evento-rua')?.value;
            const numero = document.getElementById('evento-numero')?.value;
            const bairro = document.getElementById('evento-bairro')?.value;
            const cidade = document.getElementById('evento-cidade')?.value;
            const estado = document.getElementById('evento-estado')?.value;
            const datetime = document.getElementById('evento-datetime')?.value;
            const descricao = document.getElementById('evento-descricao')?.value;
            
            if (!titulo || !rua || !bairro || !cidade || !estado || !datetime || !descricao) {
                showAlert('Preencha todos os campos obrigatórios.', 'error');
                return;
            }
            
            if (titulo.trim().length < 3) {
                showAlert('O título deve ter pelo menos 3 caracteres.', 'error');
                return;
            }
            
            if (rua.trim().length < 3) {
                showAlert('O nome da rua deve ter pelo menos 3 caracteres.', 'error');
                return;
            }
            
            // Número é opcional, mas se preenchido deve conter apenas dígitos
            if (numero && numero.trim().length > 0 && !/^\d+$/.test(numero.trim())) {
                showAlert('O número deve conter apenas dígitos.', 'error');
                return;
            }
            
            if (bairro.trim().length < 3) {
                showAlert('O bairro deve ter pelo menos 3 caracteres.', 'error');
                return;
            }

            if (cidade.trim().length < 3) {
                showAlert('A cidade deve ter pelo menos 3 caracteres.', 'error');
                return;
            }

            if (!estado) {
                showAlert('Selecione um estado.', 'error');
                return;
            }
            
            if (descricao.trim().length < 10) {
                showAlert('A descrição deve ter pelo menos 10 caracteres.', 'error');
                return;
            }

            if (id) {
                editarAssistencia(id, { tipo, titulo, rua, numero, bairro, cidade, estado, datetime, descricao });
            } else {
                criarAssistencia({ tipo, titulo, rua, numero, bairro, cidade, estado, datetime, descricao });
            }
            
        } else if (tipo === 'Anuncio') {
            const anuncioTitulo = document.getElementById('anuncio-titulo')?.value;
            const anuncioDescricao = document.getElementById('anuncio-descricao')?.value;
            const imagens = document.getElementById('anuncio-imagens')?.files;
            
            if (!anuncioTitulo || !anuncioDescricao) {
                showAlert('Preencha o título e a descrição do anúncio.', 'error');
                return;
            }

            if (anuncioTitulo.trim().length < 3) {
                showAlert('O título deve ter pelo menos 3 caracteres.', 'error');
                return;
            }

            if (anuncioDescricao.trim().length < 10) {
                showAlert('A descrição deve ter pelo menos 10 caracteres.', 'error');
                return;
            }

            if (!imagens || imagens.length !== 1) {
                showAlert('Selecione exatamente 1 imagem.', 'error');
                return;
            }
            
            const img = imagens[0];
            const isValidType = ['image/png', 'image/jpeg'].includes(img.type);
            const isValidSize = img.size <= 5 * 1024 * 1024;
            
            if (!isValidType || !isValidSize) {
                showAlert('A imagem deve ser PNG ou JPEG, até 5 MB.', 'error');
                return;
            }

            if (id) {
                editarAssistencia(id, { tipo, titulo: anuncioTitulo, descricao: anuncioDescricao, imagem: img });
            } else {
                criarAssistencia({ tipo, titulo: anuncioTitulo, descricao: anuncioDescricao, imagem: img });
            }
            
        } else {
            showAlert('Selecione um tipo válido.', 'error');
            return;
        }
        
        closeAssistModal();
    });
}

/**
 * Cria uma nova assistência (Campanha, Evento ou Anúncio)
 * @param {Object} data - Dados da assistência
 * @param {string} data.tipo - Tipo: 'Campanha', 'Evento' ou 'Anuncio'
 * 
 * Para Campanha:
 * @param {string} data.emoji - Emoji/ícone da campanha
 * @param {string} data.nome - Nome da campanha
 * @param {string} data.descricao - Descrição da campanha
 * 
 * Para Evento:
 * @param {string} data.titulo - Título do evento
 * @param {string} data.rua - Rua do evento
 * @param {string} data.numero - Número do endereço
 * @param {string} data.bairro - Bairro do evento
 * @param {string} data.datetime - Data e hora do evento
 * @param {string} data.descricao - Descrição do evento
 * 
 * Para Anuncio:
 * @param {File[]} data.imagens - Array com 3 imagens
 */
async function criarAssistencia(data) {
    try {
        if (data.tipo === 'Campanha') {
            // Busca o próximo ID disponível
            const campaignsRes = await fetch('/api/assistance/campaigns');
            const campaigns = await campaignsRes.json();
            const nextId = campaigns.length > 0 ? Math.max(...campaigns.map(c => c.id)) + 1 : 1;

            const response = await fetch('/api/assistance/campaigns', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: nextId,
                    title: data.nome,
                    description: data.descricao,
                    icon: data.emoji
                })
            });

            if (!response.ok) throw new Error('Erro ao criar campanha');
            showAlert('Campanha criada com sucesso!', 'success');

        } else if (data.tipo === 'Evento') {
            // Busca o próximo ID disponível
            const eventsRes = await fetch('/api/assistance/events');
            const events = await eventsRes.json();
            const nextId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;

            const response = await fetch('/api/assistance/events', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: nextId,
                    title: data.titulo,
                    description: data.descricao,
                    datetime: data.datetime,
                    street: data.rua,
                    number: data.numero,
                    neighborhood: data.bairro,
                    city: data.cidade,
                    state: data.estado
                })
            });

            if (!response.ok) throw new Error('Erro ao criar evento');
            showAlert('Evento criado com sucesso!', 'success');

        } else if (data.tipo === 'Anuncio') {
            // Cria um anúncio com título e descrição do formulário
            const announcementsRes = await fetch('/api/assistance/announcements');
            const announcements = await announcementsRes.json();
            const nextId = announcements.length > 0 ? Math.max(...announcements.map(a => a.id)) + 1 : 1;

            const fd = new FormData();
            fd.append('id', nextId);
            fd.append('title', data.titulo);
            fd.append('text', data.descricao);
            fd.append('mime', data.imagem.type);
            fd.append('image', data.imagem);
            const response = await fetch('/api/assistance/announcements', {
                method: 'POST',
                credentials: 'include',
                body: fd
            });

            if (!response.ok) throw new Error('Erro ao criar anúncio');
            showAlert('Anúncio criado com sucesso!', 'success');
        }

        await renderAssistenciaTable();
    } catch (error) {
        console.error('Erro ao criar assistência:', error);
        showAlert('Erro ao criar assistência. Verifique o console.', 'error');
    }
}

/**
 * Converte um arquivo para Base64
 * @param {File} file - Arquivo a ser convertido
 * @returns {Promise<string>} String Base64 do arquivo
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

/**
 * Edita uma assistência existente
 * @param {string} id - ID da assistência a ser editada
 * @param {Object} data - Dados atualizados (mesma estrutura de criarAssistencia)
 */
async function editarAssistencia(id, data) {
    try {
        if (data.tipo === 'Campanha') {
            const response = await fetch(`/api/assistance/campaigns/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.nome,
                    description: data.descricao,
                    icon: data.emoji
                })
            });

            if (!response.ok) throw new Error('Erro ao atualizar campanha');
            showAlert('Campanha atualizada com sucesso!', 'success');

        } else if (data.tipo === 'Evento') {
            const response = await fetch(`/api/assistance/events/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.titulo,
                    description: data.descricao,
                    datetime: data.datetime,
                    street: data.rua,
                    number: data.numero,
                    neighborhood: data.bairro,
                    city: data.cidade,
                    state: data.estado
                })
            });

            if (!response.ok) throw new Error('Erro ao atualizar evento');
            showAlert('Evento atualizado com sucesso!', 'success');

        } else if (data.tipo === 'Anuncio') {
            // Atualiza o anúncio com os dados do formulário
            const fd = new FormData();
            fd.append('image', data.imagem);
            fd.append('id', id);
            fd.append('title', data.titulo);
            fd.append('text', data.descricao);
            fd.append('mime', data.imagem.type);
            const response = await fetch(`/api/assistance/announcements/${id}`, {
                method: 'PUT',
                credentials: 'include',
                body: fd
            });

            if (!response.ok) throw new Error('Erro ao atualizar anúncio');
            showAlert('Anúncio atualizado com sucesso!', 'success');
        }

        await renderAssistenciaTable();
    } catch (error) {
        console.error('Erro ao editar assistência:', error);
        showAlert('Erro ao editar assistência. Verifique o console.', 'error');
    }
}

/**
 * Remove uma assistência
 * @param {string} id - ID da assistência a ser removida
 * @param {string} tipo - Tipo da assistência ('Campanha', 'Evento' ou 'Anuncio')
 */
async function removerAssistencia(id, tipo) {
    if (!confirm('Tem certeza que deseja remover esta assistência?')) return;

    try {
        let endpoint = '';
        if (tipo === 'Campanha') {
            endpoint = `/api/assistance/campaigns/${id}`;
        } else if (tipo === 'Evento') {
            endpoint = `/api/assistance/events/${id}`;
        } else if (tipo === 'Anuncio') {
            endpoint = `/api/assistance/announcements/${id}`;
        }

        const response = await fetch(endpoint, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Erro ao remover assistência');
        showAlert('Assistência removida com sucesso!', 'success');
        await renderAssistenciaTable();
    } catch (error) {
        console.error('Erro ao remover assistência:', error);
        showAlert('Erro ao remover assistência. Verifique o console.', 'error');
    }
}

/**
 * Renderiza a tabela de assistências (campanhas, eventos e anúncios)
 */
async function renderAssistenciaTable() {
    const tableBody = document.querySelector('#assistencia-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    try {
        // Busca todos os dados em paralelo
        const [campaignsRes, eventsRes, announcementsRes] = await Promise.all([
            fetch('/api/assistance/campaigns'),
            fetch('/api/assistance/events'),
            fetch('/api/assistance/announcements')
        ]);

        const campaigns = await campaignsRes.json();
        const events = await eventsRes.json();
        const announcements = await announcementsRes.json();

        // Renderiza campanhas
        campaigns.forEach(campaign => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${campaign.icon} ${campaign.title}</td>
                <td>Campanha</td>
                <td>-</td>
                <td><span class="status-ativo">Ativo</span></td>
                <td>
                    <button class="btn-action btn-edit" data-id="${campaign.id}" data-tipo="Campanha">Editar</button>
                    <button class="btn-action btn-delete" data-id="${campaign.id}" data-tipo="Campanha">Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Renderiza eventos
        events.forEach(event => {
            const datetime = new Date(event.datetime);
            const dateStr = datetime.toLocaleDateString('pt-BR');
            const timeStr = datetime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const isActive = datetime >= new Date();

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.title}</td>
                <td>Evento</td>
                <td>${dateStr} ${timeStr}</td>
                <td><span class="${isActive ? 'status-ativo' : 'status-inativo'}">${isActive ? 'Ativo' : 'Encerrado'}</span></td>
                <td>
                    <button class="btn-action btn-edit" data-id="${event.id}" data-tipo="Evento">Editar</button>
                    <button class="btn-action btn-delete" data-id="${event.id}" data-tipo="Evento">Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Renderiza anúncios
        announcements.forEach(announcement => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${announcement.title}</td>
                <td>Anúncio</td>
                <td>-</td>
                <td><span class="status-ativo">Ativo</span></td>
                <td>
                    <button class="btn-action btn-edit" data-id="${announcement.id}" data-tipo="Anuncio">Editar</button>
                    <button class="btn-action btn-delete" data-id="${announcement.id}" data-tipo="Anuncio">Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Adiciona event listeners aos botões
        tableBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const tipo = e.currentTarget.dataset.tipo;
                removerAssistencia(id, tipo);
            });
        });

        tableBody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const tipo = e.currentTarget.dataset.tipo;
                openAssistModal({ id, tipo });
            });
        });

    } catch (error) {
        console.error('Erro ao carregar assistências:', error);
        tableBody.innerHTML = '<tr><td colspan="5">Erro ao carregar dados.</td></tr>';
    }
}

bindAssistenciaEvents();

// Inicializa a tabela de assistências e configura o botão de atualizar
renderAssistenciaTable();
document.getElementById('assist-refresh')?.addEventListener('click', renderAssistenciaTable);

/**
 * Valida e limita o campo de emoji a apenas 1 caractere
 * Permite colar emojis corretamente
 */
function setupEmojiInput() {
    const emojiInput = document.getElementById('campanha-emoji');
    if (!emojiInput) return;
    
    emojiInput.addEventListener('input', (e) => {
        // Pega o primeiro caractere/emoji
        const value = e.target.value;
        // Usa Array.from para separar emojis corretamente
        const chars = Array.from(value);
        if (chars.length > 1) {
            e.target.value = chars[0];
        }
    });
    
    emojiInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const chars = Array.from(pastedText);
        if (chars.length > 0) {
            e.target.value = chars[0];
        }
    });
}

setupEmojiInput();

/**
 * Deleta um agendamento específico do localStorage
 * @param {string} id ID do agendamento a ser deletado
 */
function deleteAppointment(id) {
    fetch(`/api/appointments/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    }).then(async response => {
        if (!response.ok) {
            throw new Error('Failed to delete appointment');
        }
        await renderAppointmentsTable();
    }).catch(error => {
        console.error('Error deleting appointment:', error);
        showAlert('Erro ao deletar o agendamento.', 'error');
    });
}

/**
 * Atualiza o status de um agendamento
 * @param {string} id ID do agendamento a ser atualizado
 * @param {string} newStatus Novo status ('Aguardando' ou 'Coletado')
 */
function updateStatus(id, newStatus) {
    fetch('/api/appointments/update-status', {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify({ id: id, status: newStatus }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async response => {
        if (!response.ok) {
            throw new Error('Failed to update appointment status');
        }
        renderAppointmentsTable();
    }).catch(error => {
        console.error('Error updating appointment status:', error);
        showAlert('Erro ao atualizar o status do agendamento.', 'error');
    });
}


/**
 * Renderiza a tabela de agendamentos
 */
async function renderAppointmentsTable() {
    const tableBody = document.querySelector('#appointments-table tbody');
    tableBody.innerHTML = '';
    
    const appointmentsResponse = await fetch('/api/appointments', {
        method: 'GET',
        credentials: 'include'
    });

    if (!appointmentsResponse.ok) {
        console.error('Erro ao obter agendamentos:', appointmentsResponse.statusText);
        return;
    }

    const appointments = await appointmentsResponse.json();

    for (let appointment of appointments) {
       
        const status = appointment.status || "Aguardando";
        
        let row = document.createElement('tr');
        const keys = ['id', 'name', 'blood_type', 'phone', 'email', 'appointment_date'];

        for(let key of keys) {
            let cell = document.createElement('td');
            if (key === 'appointment_date') {
                const date = new Date(appointment[key]);
                cell.innerText = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                cell.innerText = key === 'id' ? appointment[key].substring(0, 8) + '...' : appointment[key];
            }
            row.appendChild(cell);
        }


        let statusCell = document.createElement('td');
        statusCell.innerText = status;
        statusCell.className = status === "Coletado" ? 'status-coletado' : (status === "Cancelado" ? 'status-cancelado' : 'status-aguardando');
        row.appendChild(statusCell);

      
        let actionsCell = document.createElement('td');
        actionsCell.style.display = 'flex';
        actionsCell.style.gap = '8px';

      
        let statusSelect = document.createElement('select');
        statusSelect.className = 'status-select';
        
        const options = [
             { value: '', text: 'Status', disabled: true, selected: true }, 
             { value: 'Aguardando', text: 'Aguardando' }, 
             { value: 'Coletado', text: 'Coletado' },
             { value: 'Cancelado', text: 'Cancelado' }
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
        const date = new Date(appointment.appointment_date);
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
        const count = appointments.filter(appointment => appointment.blood_type === type).length;
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
async function renderMessagesTable() {
    const tableBody = document.querySelector('#messages-table tbody');
    tableBody.innerHTML = '';
    let messagesResponse = await fetch('/api/messages', {
        method: 'GET',
        credentials: 'include'
    });

    if(!messagesResponse.ok) {
        console.error('Erro ao obter mensagens:', messagesResponse.statusText);
        return;
    }

    let messages = await messagesResponse.json();

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
        showAlert('Nenhuma mensagem selecionada.', 'warning');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja deletar ${checkboxes.length} mensagem(ns)?`)) {
        return;
    }
    
    Array.from(checkboxes).forEach(async (cb) => {
        const messageId = cb.dataset.messageId;
        try {
            let resp = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!resp.ok) {
                throw new Error(`Failed to delete message with ID ${messageId}`);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            showAlert('Erro ao deletar algumas mensagens.', 'error');
        }
    });

    renderMessagesTable();
}

/**
 * Envia respostas para as mensagens selecionadas
 */
async function sendMessageReplies() {
    const checkboxes = document.querySelectorAll('.message-checkbox:checked');
    if (checkboxes.length === 0) {
        showAlert('Nenhuma mensagem selecionada.', 'warning');
        return;
    }
    
    const idsToRespond = Array.from(checkboxes).map(cb => cb.dataset.messageId);
    let messagesResponse = await fetch('/api/messages', {
        method: 'GET',
        credentials: 'include'
    });
    if(!messagesResponse.ok) {
        console.error('Erro ao obter mensagens:', messagesResponse.statusText);
        return;
    }
    let allMessages = await messagesResponse.json();
    const toAnswer = allMessages.filter(msg => idsToRespond.includes(msg.id));
    
    let i = 0;
    let onSend = (hasSend) => {
        if (hasSend) {
            fetch(`/api/messages/${toAnswer[i].id}`, {
                method: 'DELETE',
                credentials: 'include'
            }).then(async response => {
                await renderMessagesTable();
            }).catch(error => {
                console.error('Error deleting message after reply:', error);
            });
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
            showAlert(`Falha ao enviar resposta para ${message.email}.`, 'error');
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

(async () => {
    await renderAppointmentsTable();
    await renderMessagesTable();
    setInterval(async () => {
        await renderAppointmentsTable();
        await renderMessagesTable();
    }, 5000);
})();

document.getElementById('delete-messages-btn').addEventListener('click', deleteSelectedMessages);
document.getElementById('send-messages-btn').addEventListener('click', async (e) => {
    await sendMessageReplies();
});
document.getElementById('select-all-messages').addEventListener('change', (e) => {
    toggleSelectAllMessages(e.target.checked);
});