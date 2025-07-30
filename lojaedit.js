document.addEventListener("DOMContentLoaded", () => {
    // === ELEMENTOS ===
    const inputNome = document.getElementById("nomeLoja");
    const inputDescricao = document.getElementById("descricaoLoja");
    const inputEndereco = document.getElementById("endereco");
    const inputContato = document.getElementById("contato");
    const botoesPagamento = document.querySelectorAll(".pay-option");

    const btnSalvar = document.querySelector(".btn-save-info");

    // Foto de Perfil
    const inputFotoPerfil = document.getElementById("fotoPerfilInput");
    const fotoAtual = document.getElementById("fotoPerfilAtual");
    const fotoNova = document.getElementById("fotoPerfilNova");
    const btnEditar = document.getElementById("btnEditarFoto");
    const btnRemover = document.getElementById("btnRemoverFoto");

    // Banners
    const bannerUploadArea = document.getElementById("bannerUploadArea");
    const inputBanner = document.getElementById("bannerInput");
    const bannerPreviewContainer = document.getElementById("bannerPreview");

    // === NOVOS ELEMENTOS PARA HORÁRIOS ===
    const diaSemanaSelect = document.getElementById('diaSemanaSelect');
    const fechadoDiaCheckbox = document.getElementById('fechadoDiaCheckbox');
    const horariosIntervalosContainer = document.getElementById('horariosIntervalosContainer');
    const addIntervaloBtn = document.getElementById('addIntervaloBtn');

    // --- CORREÇÃO: Declarar 'refs' como um objeto antes de usá-lo ---
    const refs = {
        userIconButton: document.getElementById('userIconButton'),
        bellIconButton: document.getElementById('bellIconButton'),
        bellIcon: document.getElementById('bellIcon'), // A imagem dentro do botão do sino

        userOptionsModal: document.getElementById('userOptionsModal'),
        configButton: document.getElementById('configButton'),
        supportButton: document.getElementById('supportButton'),

        userConfigModal: document.getElementById('userConfigModal'),
        userConfigForm: document.getElementById('userConfigForm'),
        userNameInput: document.getElementById('userName'),
        userEmailInput: document.getElementById('userEmail'),
        userPhoneInput: document.getElementById('userPhone'),
        notificationVolumeInput: document.getElementById('notificationVolume'),
        volumeValueSpan: document.getElementById('volumeValue'),

        supportModal: document.getElementById('supportModal'),
        notificationModal: document.getElementById('notificationModal'),
        // Adicionei estas referências, pois seu código as utiliza em outros locais
        saveMenuBtn: document.getElementById('saveMenuBtn'), // Você usa refs.saveMenuBtn, mas não está no HTML fornecido
        imageInput: document.getElementById('imageInput'), // Você usa refs.imageInput, mas não está no HTML fornecido
        editModal: document.getElementById('editModal'), // Você usa refs.editModal, mas não está no HTML fornecido
        adicionaisModal: document.getElementById('adicionaisModal') // Você usa refs.adicionaisModal, mas não está no HTML fornecido
    };

    // --- CORREÇÃO: Declarar 'lojistaConfig' e 'notificationAudio' ---
    let lojistaConfig; // Será inicializado em initializeLojistaConfigDefaults ou carregado do localStorage
    let notificationAudio = document.getElementById('notificationSound');
    let notificationInterval = null; // Para controlar o intervalo da notificação
    let editingIndex = null; // Variável para controlar o índice de edição (usada no fechamento de editModal)

    // --- Carregamento/Inicialização de lojistaConfig ---
    // Funçao auxiliar para definir os valores padrão de lojistaConfig
    function initializeLojistaConfigDefaults() {
        lojistaConfig = {
            userName: 'Novo Lojista',
            userEmail: 'email@lojista.com',
            userPhone: '(DD) 9XXXX-XXXX',
            notificationVolume: 0.7 // Volume padrão de 70%
        };
    }

    // Tenta carregar lojistaConfig do localStorage, se não existir, inicializa com valores padrão
    lojistaConfig = JSON.parse(localStorage.getItem("lojistaConfig")) || {};
    if (Object.keys(lojistaConfig).length === 0) { // Se o objeto estiver vazio, inicializa
        initializeLojistaConfigDefaults();
    }


    // ESTADO INICIAL (REFORÇADO: Garante que os horários funcionam mesmo se não houver no localStorage)
    let lojaConfig = JSON.parse(localStorage.getItem("lojaConfig")) || {
        nome: "",
        descricao: "",
        fotoPerfil: "",
        banners: [],
        sobre: {
            pagamentos: [],
            endereco: "",
            contact: ""
        },
        horariosFuncionamento: [] // Começa vazio, será populado ou carregado
    };

    // Garante que 'horariosFuncionamento' tem 7 dias, se não tiver (primeira vez ou dados corrompidos)
    if (!lojaConfig.horariosFuncionamento || lojaConfig.horariosFuncionamento.length !== 7) {
        lojaConfig.horariosFuncionamento = Array(7).fill(null).map(() => ({
            fechado: false,
            intervalos: []
        }));
    } else {
        // Assegura que cada dia tenha 'fechado' e 'intervalos' definidos
        lojaConfig.horariosFuncionamento.forEach((day, index) => {
            if (typeof day.fechado === 'undefined') day.fechado = false;
            if (!day.intervalos) day.intervalos = [];
        });
    }

    // Lógica de migração simples para o formato de horários (Mantida como estava, mas deve ser menos necessária agora)
    if (lojaConfig.sobre && lojaConfig.sobre.horarios && typeof lojaConfig.sobre.horarios === 'string') {
        console.warn("Detectado formato antigo de horários. Tentando migrar para o novo formato.");
        lojaConfig.horariosFuncionamento = Array(7).fill(null).map(() => ({
            fechado: false,
            intervalos: []
        }));
        // Remove a propriedade antiga para não causar mais problemas
        delete lojaConfig.sobre.horarios;
        salvarLojaConfig(); // Salva para limpar o dado antigo
    }

    // --- Funções de Ajuda ---
    function salvarLojaConfig() {
        localStorage.setItem("lojaConfig", JSON.stringify(lojaConfig));
        console.log("Configurações da Loja salvas:", lojaConfig);
    }

    // --- CORREÇÃO: Função para salvar o estado geral (incluindo lojistaConfig) ---
    function saveState() {
        localStorage.setItem("lojistaConfig", JSON.stringify(lojistaConfig));
        salvarLojaConfig(); // Chama a função para salvar a lojaConfig também
        console.log("Estado do Lojista salvo:", lojistaConfig);
    }

    // --- Preencher Formulário ao Carregar ---
    function preencherFormulario() {
        inputNome.value = lojaConfig.nome || "";
        inputDescricao.value = lojaConfig.descricao || "";
        inputEndereco.value = lojaConfig.sobre.endereco || "";
        inputContato.value = lojaConfig.sobre.contact || "";

        // Foto de Perfil
        fotoAtual.src = lojaConfig.fotoPerfil || "iconfoto.png";
        fotoNova.style.display = "none";

        // Banners
        renderizarBanners();

        // Pagamentos
        botoesPagamento.forEach(botao => {
            const metodo = botao.textContent.trim();
            if (lojaConfig.sobre.pagamentos.includes(metodo)) {
                botao.classList.add("selected");
            } else {
                botao.classList.remove("selected");
            }
        });

        // *** AQUI É CRUCIAL: Chama renderHorarios para o dia selecionado atualmente.
        // O valor inicial do select (diaSemanaSelect.value) deve ser 0 (Domingo) por padrão,
        // garantindo que o primeiro dia seja carregado corretamente.
        renderHorarios();
    }

    // --- Variável para a instância do SortableJS ---
    let sortableInstance = null;

    // --- Renderizar Banners ---
    function renderizarBanners() {
        bannerPreviewContainer.innerHTML = "";
        lojaConfig.banners.forEach((bannerBase64, index) => {
            const bannerItem = document.createElement("div");
            bannerItem.className = "banner-preview-item";
            bannerItem.dataset.id = `banner-${index}`;

            const img = document.createElement("img");
            img.src = bannerBase64;
            img.alt = `Banner ${index + 1}`;

            const removeBtn = document.createElement("button");
            removeBtn.className = "remove-banner-btn";
            removeBtn.textContent = "X";
            removeBtn.title = "Remover banner";
            removeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                lojaConfig.banners.splice(index, 1);
                renderizarBanners();
            });

            bannerItem.appendChild(img);
            bannerItem.appendChild(removeBtn);
            bannerPreviewContainer.appendChild(bannerItem);
        });

        inicializarSortableJS();
    }

    // --- Função para inicializar/re-inicializar SortableJS ---
    function inicializarSortableJS() {
        if (sortableInstance) {
            sortableInstance.destroy();
        }

        if (bannerPreviewContainer) {
            sortableInstance = new Sortable(bannerPreviewContainer, {
                animation: 150,
                handle: '.banner-preview-item',
                ghostClass: 'sortable-ghost',
                onEnd: function (evt) {
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;
                    const [movedItem] = lojaConfig.banners.splice(oldIndex, 1);
                    lojaConfig.banners.splice(newIndex, 0, movedItem);
                    console.log('Banners reordenados no array:', lojaConfig.banners.map((b, i) => `Banner ${i+1}`));
                },
            });
        }
    }

    // --- Inicializar Formulário ---
    preencherFormulario();

    // --- Lógica de Eventos ---

    // Botões de Pagamento
    botoesPagamento.forEach(botao => {
        botao.addEventListener("click", () => {
            const metodo = botao.textContent.trim();
            if (lojaConfig.sobre.pagamentos.includes(metodo)) {
                lojaConfig.sobre.pagamentos = lojaConfig.sobre.pagamentos.filter(p => p !== metodo);
                botao.classList.remove("selected");
            } else {
                lojaConfig.sobre.pagamentos.push(metodo);
                botao.classList.add("selected");
            }
        });
    });

    // Botão Salvar Informações (Centralizado)
    btnSalvar.addEventListener("click", () => {
        lojaConfig.nome = inputNome.value.trim();
        lojaConfig.descricao = inputDescricao.value.trim();
        lojaConfig.sobre.endereco = inputEndereco.value.trim();
        lojaConfig.sobre.contact = inputContato.value.trim();

        if (fotoNova.src && fotoNova.style.display !== "none") {
            lojaConfig.fotoPerfil = fotoNova.src;
        }

        salvarLojaConfig();

        fotoAtual.src = lojaConfig.fotoPerfil || "iconfoto.png";
        fotoNova.style.display = "none";
        fotoNova.src = "";
        inputFotoPerfil.value = "";

        alert("Informações salvas com sucesso! ✨ As mudanças serão visíveis no cardápio.");
    });

    // --- Foto de Perfil ---
    btnEditar.addEventListener("click", () => {
        inputFotoPerfil.click();
    });

    inputFotoPerfil.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            fotoNova.src = base64;
            fotoNova.style.display = "block";
        };
        reader.readAsDataURL(file);
    });

    btnRemover.addEventListener("click", () => {
        lojaConfig.fotoPerfil = "";
        fotoAtual.src = "iconfoto.png";
        fotoNova.src = "";
        fotoNova.style.display = "none";
        inputFotoPerfil.value = "";
    });

    // --- Banners ---
    bannerUploadArea.addEventListener("click", () => {
        inputBanner.click();
    });

    inputBanner.addEventListener("change", (e) => {
        const files = [...e.target.files];
        if (files.length === 0) return;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                lojaConfig.banners.push(reader.result);
                renderizarBanners();
            };
            reader.readAsDataURL(file);
        });

        inputBanner.value = "";
    });

    // ===============================================
    // === NOVA LÓGICA PARA HORÁRIOS DE FUNCIONAMENTO ===
    // ===============================================

    // --- Função para renderizar os intervalos de horário para o dia selecionado ---
    function renderHorarios() {
        const diaSelecionado = parseInt(diaSemanaSelect.value);
        const diaConfig = lojaConfig.horariosFuncionamento[diaSelecionado];

        // *** PASSO CRÍTICO: ATUALIZA O ESTADO DO CHECKBOX PRIMEIRO E SEMPRE! ***
        fechadoDiaCheckbox.checked = diaConfig.fechado;

        // Limpa o container de intervalos
        horariosIntervalosContainer.innerHTML = '';

        // Condicional para exibir/ocultar horários com base no estado "fechado"
        if (diaConfig.fechado) {
            horariosIntervalosContainer.style.display = 'none';
            addIntervaloBtn.style.display = 'none';
            // Quando o dia está fechado, garanta que os intervalos no objeto estejam vazios.
            // Isso evita que, ao desmarcar "fechado", horários antigos apareçam do nada.
            diaConfig.intervalos = [];
        } else {
            horariosIntervalosContainer.style.display = 'block';
            addIntervaloBtn.style.display = 'inline-block';

            // Se o dia não está fechado e não tem intervalos, adiciona um padrão para o usuário começar
            if (diaConfig.intervalos.length === 0) {
                addIntervalo(diaSelecionado); // Adiciona um intervalo padrão
                return; // Redesenha com o novo intervalo para que o input apareça
            } else {
                // Renderiza cada intervalo EXATAMENTE como está salvo no diaConfig
                diaConfig.intervalos.forEach((intervalo, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('horario-intervalo-item');

                    itemDiv.innerHTML = `
                        <input type="time" class="hora-abertura" value="${intervalo.abertura}">
                        <span>às</span>
                        <input type="time" class="hora-fechamento" value="${intervalo.fechamento}">
                        <button type="button" class="remove-intervalo-btn">Remover</button>
                    `;
                    horariosIntervalosContainer.appendChild(itemDiv);
                });
            }
        }

        // Adiciona listeners para os inputs de hora e botões de remover
        horariosIntervalosContainer.querySelectorAll('.hora-abertura, .hora-fechamento').forEach(input => {
            input.addEventListener('change', (event) => {
                const item = event.target.closest('.horario-intervalo-item');
                const index = Array.from(horariosIntervalosContainer.children).indexOf(item);
                if (event.target.classList.contains('hora-abertura')) {
                    lojaConfig.horariosFuncionamento[diaSelecionado].intervalos[index].abertura = event.target.value;
                } else {
                    lojaConfig.horariosFuncionamento[diaSelecionado].intervalos[index].fechamento = event.target.value;
                }
                // Não salva aqui, o btnSalvar fará isso.
            });
        });

        horariosIntervalosContainer.querySelectorAll('.remove-intervalo-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemToRemove = event.target.closest('.horario-intervalo-item');
                const indexToRemove = Array.from(horariosIntervalosContainer.children).indexOf(itemToRemove);
                removeIntervalo(diaSelecionado, indexToRemove);
            });
        });
    }

    // --- Função para adicionar um novo intervalo ---
    function addIntervalo(dia) {
        lojaConfig.horariosFuncionamento[dia].intervalos.push({ abertura: '09:00', fechamento: '18:00' });
        renderHorarios(); // Redesenha a interface
    }

    // --- Função para remover um intervalo ---
    function removeIntervalo(dia, index) {
        lojaConfig.horariosFuncionamento[dia].intervalos.splice(index, 1);
        renderHorarios(); // Redesenha a interface
    }

    // --- Event Listeners para a UI de Horários ---
    diaSemanaSelect.addEventListener('change', renderHorarios); // Ao mudar o dia, renderiza os horários

    fechadoDiaCheckbox.addEventListener('change', () => {
        const diaSelecionado = parseInt(diaSemanaSelect.value);
        lojaConfig.horariosFuncionamento[diaSelecionado].fechado = fechadoDiaCheckbox.checked;

        // Lógica para ajustar os intervalos com base no estado "fechado"
        if (fechadoDiaCheckbox.checked) {
            // Se marcado como fechado, limpa os intervalos imediatamente
            lojaConfig.horariosFuncionamento[diaSelecionado].intervalos = [];
        } else {
            // Se desmarcado (dia aberto) E não houver intervalos, adiciona um padrão
            if (lojaConfig.horariosFuncionamento[diaSelecionado].intervalos.length === 0) {
                lojaConfig.horariosFuncionamento[diaSelecionado].intervalos.push({ abertura: '09:00', fechamento: '18:00' });
            }
        }
        renderHorarios(); // Redesenha a interface para refletir a mudança
    });

    addIntervaloBtn.addEventListener('click', () => {
        addIntervalo(parseInt(diaSemanaSelect.value));
    });

    // --- NOVAS FUNÇÕES PARA USER E NOTIFICAÇÕES ---

    // Função para abrir um modal
    function openModal(modalElement) {
        modalElement.classList.remove('hidden');
    }

    // Função para fechar um modal
    function closeModal(modalElement) {
        modalElement.classList.add('hidden');
    }

    // Preenche e abre o modal de configurações do usuário
    function openUserConfigModal() {
        // Assegura que lojistaConfig.notificationVolume seja um número antes de arredondar
        const volumeValue = typeof lojistaConfig.notificationVolume === 'number' ? lojistaConfig.notificationVolume : 0.5;

        refs.userNameInput.value = lojistaConfig.userName || ''; // Padrão vazio se undefined
        refs.userEmailInput.value = lojistaConfig.userEmail || ''; // Padrão vazio se undefined
        refs.userPhoneInput.value = lojistaConfig.userPhone || ''; // Padrão vazio se undefined
        refs.notificationVolumeInput.value = volumeValue;
        refs.volumeValueSpan.textContent = `${Math.round(volumeValue * 100)}%`;
        
        // Garante que o áudio esteja com o volume correto, se a referência existe
        if (notificationAudio) {
            notificationAudio.volume = volumeValue; 
        }

        openModal(refs.userConfigModal);
        closeModal(refs.userOptionsModal); // Fecha o modal de opções
    }

    // Salva as configurações do usuário
    function saveUserConfig(event) {
        event.preventDefault(); // Impede o envio do formulário padrão

        lojistaConfig.userName = refs.userNameInput.value.trim();
        lojistaConfig.userPhone = refs.userPhoneInput.value.trim();
        lojistaConfig.notificationVolume = parseFloat(refs.notificationVolumeInput.value);

        // Atualiza o volume do áudio, se a referência existe
        if (notificationAudio) {
            notificationAudio.volume = lojistaConfig.notificationVolume; 
        }

        saveState(); // Salva as configurações (incluindo as do lojista)
        alert("Configurações salvas!");
        closeModal(refs.userConfigModal);
    }

    // Funções de Notificação
    function startNotification() {
        if (!notificationAudio) {
            console.error("Erro: Elemento de áudio de notificação não encontrado.");
            return;
        }
        // Toca o som (precisa da permissão do usuário para autoplay)
        notificationAudio.play().catch(e => console.error("Erro ao tocar som:", e));

        // Troca a imagem do sino e adiciona animação
        refs.bellIcon.src = 'bellanimate.svg'; // Certifique-se que este arquivo existe
        refs.bellIcon.classList.add('bell-animated');

        // Repete o som a cada X segundos (ajuste conforme necessário)
        notificationInterval = setInterval(() => {
            notificationAudio.play().catch(e => console.error("Erro ao tocar som repetido:", e));
        }, 15000); // Toca a cada 15 segundos
    }

    function stopNotification() {
        if (notificationInterval) {
            clearInterval(notificationInterval);
            notificationInterval = null;
        }
        if (notificationAudio) {
            notificationAudio.pause();
            notificationAudio.currentTime = 0; // Reinicia o áudio
        }
        refs.bellIcon.src = 'bell.svg';
        refs.bellIcon.classList.remove('bell-animated');
    }

    // --- Event Listeners Globais ---
    // (Consolidei os Event Listeners que estavam duplicados e espalhados)

    // Centraliza o salvamento no botão "Salvar Cardápio"
    // CORREÇÃO: Verifica se refs.saveMenuBtn existe antes de adicionar o listener
    if (refs.saveMenuBtn) {
        refs.saveMenuBtn.addEventListener('click', saveState);
    } else {
        console.warn("Elemento #saveMenuBtn não encontrado. O botão 'Salvar Cardápio' não funcionará.");
    }

    // Fechar modais ao clicar no botão de fechar (X)
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            const modalToClose = document.getElementById(modalId);
            if (modalToClose) {
                closeModal(modalToClose);
                // Lógica adicional de fechamento se necessário
                // CORREÇÃO: Verifica se refs.editModal existe antes de comparar
                if (refs.editModal && modalToClose === refs.editModal) {
                    editingIndex = null;
                }
            }
        });
    });

    // Fechar modais ao clicar fora (overlay)
    window.addEventListener('click', function(event) {
        if (event.target === refs.userOptionsModal) {
            closeModal(refs.userOptionsModal);
        }
        if (event.target === refs.userConfigModal) {
            closeModal(refs.userConfigModal);
        }
        if (event.target === refs.supportModal) {
            closeModal(refs.supportModal);
        }
        // Os modais existentes (editar item, adicionais)
        // CORREÇÃO: Verifica se as referências existem antes de comparar
        if (refs.editModal && event.target === refs.editModal) {
            closeModal(refs.editModal);
        }
        if (refs.adicionaisModal && event.target === refs.adicionaisModal) {
            closeModal(refs.adicionaisModal);
        }
        if (event.target === refs.notificationModal) { // Adicionado para fechar o modal de notificação
            closeModal(refs.notificationModal);
        }
    });

    // Preview da imagem ao selecionar o arquivo no formulário de adicionar (item principal)
    // CORREÇÃO: Verifica se refs.imageInput existe antes de adicionar o listener
    if (refs.imageInput) {
        refs.imageInput.addEventListener('change', () => {
            const file = refs.imageInput.files[0];
            const preview = document.getElementById('imagePreview'); // Verifique se #imagePreview existe no HTML
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    if (preview) {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            } else if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
        });
    } else {
        console.warn("Elemento #imageInput não encontrado. A funcionalidade de preview de imagem pode não funcionar.");
    }

    // --- Event Listeners Específicos para User/Notificações ---

    // Abrir modal de opções do usuário
    refs.userIconButton.addEventListener('click', () => {
        openModal(refs.userOptionsModal);
    });

    // Botões dentro do modal de opções do usuário
    refs.configButton.addEventListener('click', openUserConfigModal);
    refs.supportButton.addEventListener('click', () => {
        openModal(refs.supportModal);
        closeModal(refs.userOptionsModal); // Fecha o modal de opções
    });

    // Salvar configurações do usuário
    refs.userConfigForm.addEventListener('submit', saveUserConfig);

    // Atualizar valor do volume no input range
    refs.notificationVolumeInput.addEventListener('input', () => {
        lojistaConfig.notificationVolume = parseFloat(refs.notificationVolumeInput.value);
        refs.volumeValueSpan.textContent = `${Math.round(lojistaConfig.notificationVolume * 100)}%`;
        if (notificationAudio) {
            notificationAudio.volume = lojistaConfig.notificationVolume;
        }
    });

    // ABRIR MODAL DE NOTIFICAÇÕES E SIMULAR NOTIFICAÇÃO
    refs.bellIconButton.addEventListener('click', () => {
        openModal(refs.notificationModal); // Abre o modal de notificações
        // A lógica abaixo é para simular o som e a animação, não é o que abre o modal.
        // Em um cenário real, isso seria acionado por um novo pedido.
        if (notificationInterval) {
            stopNotification();
        } else {
            startNotification();
        }
    });

    // === Listener para pedidos ===
    // ATENÇÃO: Esta é uma simulação. Em um sistema real, você usaria WebSockets
    // ou polling AJAX para verificar novos pedidos no PHP/DB.
    // Por enquanto, vamos simular que "algo" do servidor dispara a notificação.
    // Exemplo: window.dispatchEvent(new CustomEvent('novoPedido', { detail: { /* dados do pedido */ } }));

    // Este listener ouvirá um evento global de "novoPedido"
    window.addEventListener('novoPedido', (e) => {
        console.log("Novo pedido recebido! Detalhes:", e.detail);
        // Garante que o som toque em todas as abas, menos na 'painelpedido.html'
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'painelpedido.html') {
            startNotification();
        }
        // Opcional: abre o modal de notificação automaticamente ao receber um novo pedido
        // openModal(refs.notificationModal);
    });

    // --- Chamadas de Inicialização Final ---
    // Essas chamadas foram movidas para o final do DOMContentLoaded
    // para garantir que todas as variáveis e funções estejam definidas.

    // CORREÇÃO: Adicionei funções placeholder para as chamadas que não estão definidas neste arquivo
    function renderMenuItems() { console.log("Função renderMenuItems() chamada (placeholder)."); }
    function renderCategoryTabs() { console.log("Função renderCategoryTabs() chamada (placeholder)."); }
    function updateCategorySelects() { console.log("Função updateCategorySelects() chamada (placeholder)."); }
    
    renderMenuItems();
    renderCategoryTabs();
    updateCategorySelects();
    // Se você quiser iniciar a notificação automaticamente ao carregar a página
    // startNotification(); // Descomente se quiser iniciar automaticamente
});