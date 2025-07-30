
    document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message'); // Mensagem do formulário de login

    const identificadorInput = document.getElementById('identificador');
    const senhaInput = document.getElementById('senha');
    const toggleSenhaSpan = document.getElementById('toggleSenha');

    // Elementos do Modal
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm'); // Formulário da primeira etapa do modal
    const recoveryIdentifierInput = document.getElementById('recoveryIdentifier');
    const sendEmailButton = document.getElementById('sendEmailButton');
    const sendWhatsappButton = document.getElementById('sendWhatsappButton');
    const modalMessageDiv = document.getElementById('modalMessage'); // Mensagem do modal

    // Elementos da segunda etapa do WhatsApp
    const whatsappCodeForm = document.getElementById('whatsappCodeForm');
    const whatsappCodeInput = document.getElementById('whatsappCode');
    const whatsappMessageDiv = document.getElementById('whatsappMessage'); // Mensagem da etapa WhatsApp

    // Caminhos dos SVGs (certifique-se de que estão na mesma pasta ou ajuste o caminho)
    const SVG_EYE_OPEN_PATH = 'eyeregister.svg';
    const SVG_EYE_CLOSED_PATH = 'lockregister.svg';

    // --- Funções de Formatação de Campos (mantidas do anterior) ---
    // (Cole suas funções formatarCelular, formatarCPF, formatarCNPJ aqui se o identificador precisar de formatação)

    // --- Funções de Validação (mantidas do anterior) ---
    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // Função para exibir mensagens no formulário principal de login
    const showLoginMessage = (msg, type) => {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    };

    // Função para exibir mensagens dentro do modal
    const showModalMessage = (msg, type) => {
        modalMessageDiv.textContent = msg;
        modalMessageDiv.className = `message ${type}`;
        modalMessageDiv.style.display = 'block';
    };

    // Função para exibir mensagens na etapa de código WhatsApp
    const showWhatsappMessage = (msg, type) => {
        whatsappMessageDiv.textContent = msg;
        whatsappMessageDiv.className = `message ${type}`;
        whatsappMessageDiv.style.display = 'block';
    };


    // --- Funcionalidade de Toggle de Senha (mantida do anterior) ---
    const setupPasswordToggle = (inputElement, toggleElement) => {
        toggleElement.addEventListener('click', () => {
            const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
            inputElement.setAttribute('type', type);

            if (type === 'password') {
                toggleElement.classList.remove('hidden');
                toggleElement.classList.add('visible');
            } else {
                toggleElement.classList.remove('visible');
                toggleElement.classList.add('hidden');
            }
        });
    };

    setupPasswordToggle(senhaInput, toggleSenhaSpan);

    // --- Lógica do Modal de Recuperação de Senha ---

    // Abre o modal
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.style.display = 'flex'; // Torna o overlay visível
        // Reinicia o modal para a primeira etapa
        forgotPasswordForm.style.display = 'block';
        whatsappCodeForm.style.display = 'none';
        modalMessageDiv.style.display = 'none';
        whatsappMessageDiv.style.display = 'none';
        recoveryIdentifierInput.value = ''; // Limpa o campo
        whatsappCodeInput.value = ''; // Limpa o campo do código
    });

    // Fecha o modal
    closeModalButton.addEventListener('click', () => {
        forgotPasswordModal.style.display = 'none';
    });

    // Fecha o modal ao clicar fora do conteúdo
    forgotPasswordModal.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
    });

    // Lógica para enviar o e-mail/WhatsApp (Primeira Etapa do Modal)
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = recoveryIdentifierInput.value.trim();

        showModalMessage('Processando...', 'info'); // Mensagem de processamento

        // Simulação de envio para o backend
        // Em um projeto real, você faria um fetch() para o seu backend aqui.
        // O backend decide se é e-mail, celular, cpf ou cnpj e processa.

        // Exemplo para o botão "Enviar por E-mail"
        if (e.submitter.id === 'sendEmailButton') {
            if (!validarEmail(identifier)) {
                showModalMessage('Por favor, insira um e-mail válido.', 'error');
                return;
            }
            console.log(`Solicitação de recuperação por E-mail para: ${identifier}`);
            // Chamada API para backend para enviar e-mail com link de redefinição
            // Ex: const response = await fetch('/api/recover-password-email', { method: 'POST', body: JSON.stringify({ identifier }) });
            // ... processar a resposta ...
            showModalMessage('Um link de redefinição de senha foi enviado para o seu e-mail. Por favor, verifique sua caixa de entrada (e spam).', 'success');
            // Fechar modal após sucesso para e-mail
            setTimeout(() => {
                forgotPasswordModal.style.display = 'none';
                modalMessageDiv.style.display = 'none';
            }, 3000);

        }
        // Exemplo para o botão "Enviar por WhatsApp"
        else if (e.submitter.id === 'sendWhatsappButton') {
             // Você pode adicionar uma validação mais específica para celular/CPF/CNPJ aqui
            if (identifier.length < 8) { // Exemplo de validação mínima
                showModalMessage('Por favor, insira um identificador válido (e-mail, celular, CPF ou CNPJ).', 'error');
                return;
            }
            console.log(`Solicitação de recuperação por WhatsApp para: ${identifier}`);
            // Chamada API para backend para enviar código por WhatsApp
            // Ex: const response = await fetch('/api/recover-password-whatsapp', { method: 'POST', body: JSON.stringify({ identifier }) });
            // ... processar a resposta ...
            showModalMessage('Um código de verificação foi enviado para o seu WhatsApp.', 'success');
            // Mostrar a segunda etapa do modal para inserir o código
            forgotPasswordForm.style.display = 'none';
            whatsappCodeForm.style.display = 'block';
        }
        else {
            showModalMessage('Por favor, selecione um método de recuperação.', 'error');
        }
    });

    // Lógica para verificar o código do WhatsApp (Segunda Etapa do Modal)
    whatsappCodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = whatsappCodeInput.value.trim();
        const identifier = recoveryIdentifierInput.value.trim(); // Usa o identificador já digitado

        showWhatsappMessage('Verificando código...', 'info');

        if (code.length !== 6 || !/^\d+$/.test(code)) { // Validação simples para 6 dígitos numéricos
            showWhatsappMessage('Por favor, insira um código de 6 dígitos válido.', 'error');
            return;
        }

        console.log(`Verificando código ${code} para identificador: ${identifier}`);
        // Chamada API para backend para verificar o código
        // Ex: const response = await fetch('/api/verify-whatsapp-code', { method: 'POST', body: JSON.stringify({ identifier, code }) });
        // ... processar a resposta ...

        // SIMULAÇÃO DE VERIFICAÇÃO DE CÓDIGO
        // Se o código fosse 123456 para teste
        if (code === '123456') {
            showWhatsappMessage('Código verificado com sucesso! Redirecionando para a redefinição de senha...', 'success');
            // Em um cenário real, o backend retornaria um token que seria usado aqui
            // para redirecionar para a página de redefinição de senha
            setTimeout(() => {
                forgotPasswordModal.style.display = 'none';
                // Redireciona para uma página de redefinição de senha com um token, por exemplo:
                // window.location.href = `reset-password.html?token=SEU_TOKEN_GERADO_PELO_BACKEND`;
                alert('Simulação: Código correto. Agora você seria redirecionado para a página de redefinição de senha.');
                whatsappCodeInput.value = ''; // Limpa o campo
            }, 2000);
        } else {
            showWhatsappMessage('Código incorreto ou expirado. Tente novamente.', 'error');
        }
    });

    // --- Evento de Submissão do Formulário de Login Principal ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const identificador = identificadorInput.value.trim();
        const senha = senhaInput.value.trim();

        showLoginMessage('', ''); // Limpa mensagens anteriores
        messageDiv.style.display = 'none';

        if (identificador === '') {
            showLoginMessage('Por favor, insira seu e-mail, celular, CPF ou CNPJ.', 'error');
            return;
        }

        if (senha === '') {
            showLoginMessage('Por favor, insira sua senha.', 'error');
            return;
        }

        console.log('Tentativa de Login:');
        console.log('Identificador:', identificador);
        console.log('Senha (NUNCA LOGAR ISSO EM PRODUÇÃO!):', senha);

        showLoginMessage('Processando login...', 'info');

        // Simulação de sucesso após 1.5 segundos
        setTimeout(() => {
            showLoginMessage('Login realizado com sucesso! Redirecionando...', 'success');
            window.location.href = 'file:///C:/Users/guina/OneDrive/Desktop/sitetesteok/painelcontrole.html';
            loginForm.reset();
        }, 1500);

        // Para simular um erro, descomente a linha abaixo e comente a simulação de sucesso
        // setTimeout(() => {
        //     showLoginMessage('Credenciais inválidas. Verifique seu identificador e senha.', 'error');
        // }, 1500);
    });
    
    }); // Fim do DOMContentLoaded
