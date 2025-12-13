const { debounce } = require("chart.js/helpers");

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

function renderAppointmentsTable() {
    document.querySelector('#appointments-table tbody').innerHTML = '';
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

    for (let agendamento of agendamentos) {
        let row = document.createElement('tr');
        for(let key of ['id', 'nome', 'tipoSanguineo', 'telefone', 'email', 'dataHora']) {
            let cell = document.createElement('td');
            cell.innerText = agendamento[key];
            row.appendChild(cell);
        }
        let actions = document.createElement('td');
        let deleteButton = document.createElement('button');
        deleteButton.innerText = 'Deletar';
        deleteButton.onclick = () => {
            agendamentos = agendamentos.filter(a => a.id !== agendamento.id);
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            renderAppointmentsTable();
        };
        actions.appendChild(deleteButton);
        row.appendChild(actions);
        document.querySelector('#appointments-table tbody').appendChild(row);
    }
}

let ti = setInterval(async () => {
    renderAppointmentsTable();
}, 5000);

renderAppointmentsTable();