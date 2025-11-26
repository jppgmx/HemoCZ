const contatoForm = document.forms.contato;

contatoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const msg = {
        nome: contatoForm.nome.value,
        email: contatoForm.email.value,
        assunto: contatoForm.assunto.value,
        mensagem: contatoForm.mensagem.value
    };

    const response = await fetch('/api/contato/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(msg)
    });

    if (response.ok) {
        alert('Mensagem enviada com sucesso!');
        contatoForm.reset();
    } else {
        alert('Erro ao enviar a mensagem. Tente novamente mais tarde.');
    }
});    