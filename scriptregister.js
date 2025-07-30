document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const messageDiv = document.getElementById('message');
    const celularInput = document.getElementById('celular');
    const cpfInput = document.getElementById('cpf');
    const cnpjInput = document.getElementById('cnpj');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const toggleSenhaSpan = document.getElementById('toggleSenha'); // Agora é o span diretamente
    const toggleConfirmarSenhaSpan = document.getElementById('toggleConfirmarSenha'); // Agora é o span diretamente

    // --- Funções de Formatação de Campos ---
    const formatarCelular = (value) => {
        value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length > 10) { // Para DDD + 9 dígitos
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 6) { // Para DDD + 8 dígitos
            value = value.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d+)/, '($1) $2');
        }
        return value;
    };

    const formatarCPF = (value) => {
        value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length > 9) {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{3})(\d{3})(\d+).*/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/^(\d{3})(\d+).*/, '$1.$2');
        }
        return value;
    };

    const formatarCNPJ = (value) => {
        value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length > 12) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
        } else if (value.length > 8) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+).*/, '$1.$2.$3/$4');
        } else if (value.length > 5) {
            value = value.replace(/^(\d{2})(\d{3})(\d+).*/, '$1.$2.$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d+).*/, '$1.$2');
        }
        return value;
    };

    // --- Event Listeners para Formatação ---
    celularInput.addEventListener('input', (e) => {
        e.target.value = formatarCelular(e.target.value);
    });

    cpfInput.addEventListener('input', (e) => {
        e.target.value = formatarCPF(e.target.value);
    });

    cnpjInput.addEventListener('input', (e) => {
        e.target.value = formatarCNPJ(e.target.value);
    });

    // --- Funções de Validação ---

    // Padrão de senha forte (inspirado nas recomendações do Google)
    // Mínimo de 8 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.
    const validarSenhaForte = (senha) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|:;"'<>,.?/~`]).{8,}$/;
        return regex.test(senha);
    };

    // Validação de e-mail (regex mais robusta)
    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // Função para exibir mensagens
    const showMessage = (msg, type) => {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    };

    // --- Funcionalidade de Toggle de Senha ---
    // Agora o toggleElement é o próprio span. toggleElement.textContent não é mais usado.
    const setupPasswordToggle = (inputElement, toggleElement) => {
        toggleElement.addEventListener('click', () => {
            const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
            inputElement.setAttribute('type', type);

            // Adiciona ou remove a classe 'hidden' para alternar o background-image
            if (type === 'password') {
                toggleElement.classList.remove('hidden');
                toggleElement.classList.add('visible'); // Mostra o olho aberto (eyeregister.svg)
            } else {
                toggleElement.classList.remove('visible');
                toggleElement.classList.add('hidden'); // Mostra o cadeado (lockregister.svg)
            }
        });
    };

    // Inicializa os toggles com o ícone de olho visível (senha oculta)
    setupPasswordToggle(senhaInput, toggleSenhaSpan);
    setupPasswordToggle(confirmarSenhaInput, toggleConfirmarSenhaSpan);

    // --- Evento de Submissão do Formulário ---
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const nome = document.getElementById('nome').value.trim();
        const email = emailInput.value.trim();
        const celular = celularInput.value.replace(/\D/g, ''); // Remove formatação para enviar
        const cpf = cpfInput.value.replace(/\D/g, ''); // Remove formatação para enviar
        const cnpj = cnpjInput.value.replace(/\D/g, ''); // Remove formatação para enviar
        const senha = senhaInput.value.trim();
        const confirmarSenha = confirmarSenhaInput.value.trim();
        const formaPagamento = document.getElementById('formaPagamento').value;

        // Limpa mensagens anteriores
        messageDiv.textContent = '';
        messageDiv.className = 'message';
        messageDiv.style.display = 'none';

        // Validações
        if (!validarEmail(email)) {
            showMessage('Por favor, insira um endereço de e-mail válido (ex: seuemail@dominio.com).', 'error');
            return;
        }

        if (senha !== confirmarSenha) {
            showMessage('As senhas não coincidem.', 'error');
            return;
        }

        if (!validarSenhaForte(senha)) {
            showMessage('A senha deve ter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial (!@#$%^&*).', 'error');
            return;
        }

        if (formaPagamento === '') {
            showMessage('Por favor, selecione uma forma de pagamento preferencial.', 'error');
            return;
        }

        // --- Simulação de envio para o servidor ---
        // Aqui é onde você faria a chamada à API para validar CPF e, em seguida, enviar todos os dados.
        // Lembre-se: A validação de CPF/nome com base de dados é um processo de backend
        // e requer acesso a APIs específicas (e geralmente pagas).

        /*
        // Exemplo hipotético de como você faria uma chamada API para validar CPF
        // (requer um backend que faça a ponte com o Serpro, Receita Federal, ou empresas de dados)
        try {
            const responseCPF = await fetch('/api/validar-cpf', { // Endpoint no seu backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cpf, nome }) // Envia CPF sem formatação
            });
            const dataCPF = await responseCPF.json();

            if (!responseCPF.ok || !dataCPF.isValid) {
                showMessage(dataCPF.message || 'Erro ao validar CPF. Verifique se o CPF e o Nome Completo estão corretos.', 'error');
                return;
            }
        } catch (error) {
            console.error('Erro na validação do CPF:', error);
            showMessage('Ocorreu um erro ao verificar o CPF. Tente novamente mais tarde.', 'error');
            return;
        }
        */

        console.log('Dados do Lojista a serem enviados para o backend:');
        console.log('Nome:', nome);
        console.log('E-mail:', email);
        console.log('Celular (sem formatação):', celular);
        console.log('CPF (sem formatação):', cpf);
        console.log('CNPJ (sem formatação):', cnpj || 'Não informado');
        console.log('Forma de Pagamento:', formaPagamento);
        // NUNCA logue a senha em ambientes de produção!
        // console.log('Senha:', senha);

        // Se todas as validações (incluindo as futuras da API) passarem
        showMessage('Cadastro realizado com sucesso! Em breve entraremos em contato para finalizar a ativação da sua conta.', 'success');
        registrationForm.reset(); // Limpa o formulário após o envio
    });
});
// --- Fim do scriptregister.js ---