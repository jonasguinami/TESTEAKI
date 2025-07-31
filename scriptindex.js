// ==========================================================
// DECLARAÇÕES GLOBAIS (necessárias para acesso fora do DOMContentLoaded, como Escape Key)
// ==========================================================
let abrirModal, fecharModal; // Funções de controle do modal principal
let modalEditarAdicionais = null; // Referência ao modal de edição de adicionais (será criado dinamicamente)
let finalizarPedidoModal = null; // Referência ao modal de finalizar pedido
let currentCarrinhoItemIndex = -1; // Índice do item do carrinho sendo editado
let currentMenuItemInModal = null; // <-- ESSA LINHA É CRUCIAL E DEVE SER GLOBAL

document.addEventListener("DOMContentLoaded", () => {
    // === ELEMENTOS DO HTML ===
    const fotoPerfilElement = document.getElementById("fotoPerfil");
    const bannerCarouselContainer = document.getElementById("bannerCarousel");
    const nomeLojaTitulo = document.getElementById("nomeLojaTitulo");

    // === NOVOS ELEMENTOS DOS BOTÕES DE AÇÃO ===
    const themeToggleButton = document.getElementById("themeToggleButton");
    const searchToggleButton = document.getElementById("searchToggleButton");
    const shareButton = document.getElementById("shareButton");
    const searchBarContainer = document.getElementById("searchBarContainer");
    const searchInput = document.getElementById("searchInput");
    const closeSearchButton = document.getElementById("closeSearchButton");

    // === NOVOS ELEMENTOS DO CARRINHO LATERAL ===
    const carrinhoSidebar = document.getElementById("carrinhoSidebar");
    const botaoCarrinho = document.getElementById("botaoCarrinho");
    const voltarCarrinhoBtn = document.getElementById("voltarCarrinhoBtn");
    const carrinhoItemsContainer = carrinhoSidebar.querySelector(".carrinho-items-container");
    const carrinhoTotalValor = document.getElementById("carrinhoTotalValor");
    const carrinhoVazioMsg = document.getElementById("carrinhoVazioMsg");
    const finalizarPedidoBtn = document.getElementById("finalizarPedidoBtn"); // Botão no rodapé do carrinho
    const continuarComprandoBtn = document.getElementById("continuarComprandoBtn");

    // NOVO: Botão Limpar Carrinho
    const limparCarrinhoBtn = document.getElementById("limparCarrinhoBtn");

    // === NOVOS ELEMENTOS DO MODAL SOBRE ===
    const horariosFuncionamentoDisplay = document.getElementById("horariosFuncionamentoDisplay");
    const sobrePagamentosDisplay = document.getElementById("sobrePagamentosDisplay");
    const sobreBtn = document.getElementById("sobreBtn");
    const sobreModal = document.getElementById("sobreModal");
    const fecharSobre = document.querySelector(".fechar-sobre");
    const sobreNome = document.getElementById("sobreNome");
    const sobreDescricao = document.getElementById("sobreDescricao");
    const sobreEndereco = document.getElementById("sobreEndereco");
    const sobreContato = document.getElementById("sobreContato");

    // === MODAL PRINCIPAL (Modal de Item) ===
    const modal = document.getElementById("modal");
    const modalNome = document.getElementById("modal-nome");
    const modalPreco = document.getElementById("modal-preco");
    const modalIngredientes = document.getElementById("modal-ingredientes");
    const modalImg = document.getElementById("modal-img");
    const btnAdicionarModal = document.getElementById("modalAdicionarBtn");
    const btnFecharModal = modal.querySelector(".fechar");

    // === NOVOS ELEMENTOS DO MODAL FINALIZAR PEDIDO (OBTIDOS DO HTML) ===
    finalizarPedidoModal = document.getElementById("finalizarPedidoModal"); // <--- AQUI!

    // --- VERIFICAÇÃO CRÍTICA ---
    if (!finalizarPedidoModal) {
        console.error("ERRO CRÍTICO: Elemento HTML com ID 'finalizarPedidoModal' não encontrado no DOM. O modal de finalizar pedido não funcionará.");
        // Se o modal não for encontrado, não tentamos buscar seus elementos internos
        // e o restante da lógica relacionada a ele não será anexada.
        return; // Sai da função DOMContentLoaded se o modal principal não for encontrado
    }
    // --- FIM DA VERIFICAÇÃO CRÍTICA ---

    // Elementos internos do modal de finalizar pedido (só busca se o modal principal foi encontrado)
    const fecharFinalizarPedidoBtn = document.getElementById("fecharFinalizarPedido");
    const clienteNomeInput = document.getElementById("clienteNome");
    const clienteCelularInput = document.getElementById("clienteCelular");
    const retirarBtn = finalizarPedidoModal.querySelector('[data-type="retirar"]'); // Usar querySelector para o primeiro botão encontrado
    const entregaBtn = finalizarPedidoModal.querySelector('[data-type="entrega"]'); // Usar querySelector para o segundo botão encontrado
    const enderecoGroup = document.getElementById("enderecoGroup");
    const clienteEnderecoInput = document.getElementById("clienteEndereco"); // Referência ao input de endereço
    const paymentOptionsFinalizarContainer = document.getElementById("paymentOptionsFinalizar");
    const cupomInput = document.getElementById("cupomInput");
    const finalizarPedidoTotalSpan = document.getElementById("finalizarPedidoTotal");
    const revisarPedidoBtn = document.getElementById("revisarPedidoBtn");
    const finalizarPedidoConfirmBtn = document.getElementById("finalizarPedidoWhatsappBtn"); // Botão Finalizar Pedido no modal

    const paymentMethodSelectWrapper = document.getElementById("paymentMethodSelect");
    const customSelectTrigger = paymentMethodSelectWrapper.querySelector('.custom-select-trigger');
    const customOptionsList = paymentMethodSelectWrapper.querySelector('.custom-options-list');
    const selectedOptionText = paymentMethodSelectWrapper.querySelector('.selected-option-text');
    const selectedOptionIcon = paymentMethodSelectWrapper.querySelector('.selected-option-icon');

    // === STATUS DA LOJA (BOTÃO NA TELA PRINCIPAL) ===
    const statusLojaBtn = document.getElementById("statusBtn");

    // === ELEMENTOS DO CARDÁPIO ===
    const cardapioContainer = document.getElementById("cardapioContainer");
    const categoriaCarrossel = document.getElementById("categoriaCarrossel");

    // === CARREGAR CONFIGURAÇÃO DA LOJA DO LOCALSTORAGE ===
    const lojaConfig = JSON.parse(localStorage.getItem("lojaConfig")) || {
        nome: "Minha Loja",
        descricao: "Bem-vindo à nossa loja!",
        fotoPerfil: "iconfoto.png",
        banners: [],
        sobre: {
            pagamentos: [],
            endereco: "Não informado",
            contact: "Não informado"
        },
        horariosFuncionamento: Array(7).fill(null).map(() => ({
            fechado: false,
            intervalos: [{ abertura: '09:00', fechamento: '18:00' }]
        }))
    };

    // === CARREGAR ESTADO DO MODO NOTURNO ===
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    // === CARREGAR MENU DO LOCALSTORAGE ===
    const menu = JSON.parse(localStorage.getItem("menu")) || [];
    const ordemCategorias = JSON.parse(localStorage.getItem("ordemCategorias")) || [];

    // === ESTADO DO CARRINHO ===
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    let currentMenuItemInModal = null; // Item do cardápio exibido no modal de detalhes

    // === Variáveis para o modal de edição de adicionais ===
    let currentCarrinhoItemIndex = -1; // Índice do item do carrinho que está sendo editado

    // --- FUNÇÕES DE AJUDA ---

    // Função para abrir um modal
     function openModal(modalElement) {
        if (!modalElement) {
            console.error("openModal: Elemento modal é null.", modalElement);
            return;
        }
        // modalElement.classList.remove('hidden'); // REMOVA ESTA LINHA
        modalElement.classList.add('show'); // Adicionar 'show' para transições CSS (opacity e visibility)
    }

    // Função para fechar um modal
    function closeModal(modalElement) {
        if (!modalElement) {
            console.error("closeModal: Elemento modal é null.", modalElement);
            return;
        }
        modalElement.classList.remove('show');
        // Usar um pequeno timeout para permitir que a transição CSS termine antes de esconder totalmente
        // O tempo deve ser igual ou maior que a duração da sua transição de fechamento no CSS (.modal transition)
        setTimeout(() => {
            // modalElement.classList.add('hidden'); // REMOVA ESTA LINHA
        }, 300); // Mantenha este timeout para sincronizar com sua transição de 0.4s. Pode aumentar para 400ms.
    }

    function fallbackCopyTextToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            alert('Link da loja copiado para a área de transferência!');
        } catch (err) {
            console.error('Falha ao copiar:', err);
            alert('Não foi possível copiar o link. Por favor, copie manualmente: ' + text);
        }
        document.body.removeChild(textarea);
    }

    function salvarCarrinho() {
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
    }

    function calcularTotalCarrinho() {
        let total = 0;
        carrinho.forEach(itemCarrinho => {
            let precoBase = parseFloat(itemCarrinho.price);
            let precoAdicionais = 0;
            if (itemCarrinho.adicionaisSelecionados && itemCarrinho.adicionaisSelecionados.length > 0) {
                itemCarrinho.adicionaisSelecionados.forEach(adicional => {
                    const adPrice = parseFloat(adicional.price || adicional.preco); // Fallback
                    precoAdicionais += adPrice * adicional.quantity;
                });
            }
            total += (precoBase + precoAdicionais) * itemCarrinho.quantity;
        });
        carrinhoTotalValor.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    function renderizarCarrinho() {
        carrinhoItemsContainer.innerHTML = '';
        if (carrinho.length === 0) {
            carrinhoVazioMsg.style.display = 'block';
            if (finalizarPedidoBtn) finalizarPedidoBtn.disabled = true;
            if (limparCarrinhoBtn) limparCarrinhoBtn.disabled = true;
        } else {
            carrinhoVazioMsg.style.display = 'none';
            if (finalizarPedidoBtn) finalizarPedidoBtn.disabled = false;
            if (limparCarrinhoBtn) limparCarrinhoBtn.disabled = false;

            carrinho.forEach((itemCarrinho, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('carrinho-item');
                itemDiv.dataset.index = index;

                const hasAdicionaisDisponiveis = itemCarrinho.adicionaisDisponiveis && itemCarrinho.adicionaisDisponiveis.length > 0;
                
                let adicionaisHtml = '';
                if (itemCarrinho.adicionaisSelecionados && itemCarrinho.adicionaisSelecionados.length > 0) {
                    adicionaisHtml = `<ul class="adicionais-lista">`;
                    itemCarrinho.adicionaisSelecionados.forEach(adicional => {
                        const adName = adicional.name || adicional.nome; // Fallback
                        const adPrice = parseFloat(adicional.price || adicional.preco); // Fallback
                        adicionaisHtml += `<li>${adName} (${adicional.quantity}x) - R$ ${adPrice.toFixed(2).replace('.', ',')}</li>`;
                    });
                    adicionaisHtml += `</ul>`;
                } else {
                    adicionaisHtml = `<p class="no-adicionais-selected-text">Nenhum adicional selecionado.</p>`;
                }

                itemDiv.innerHTML = `
                    <div class="item-info">
                        <h4 class="item-titulo">${itemCarrinho.title}</h4>
                        <p class="item-preco">R$ ${parseFloat(itemCarrinho.price).toFixed(2).replace('.', ',')}</p>
                        <div class="item-adicionais-info ${adicionaisHtml.includes('<ul') ? '' : 'collapsed'}">
                            ${adicionaisHtml}
                        </div>
                    </div>
                    <div class="item-acoes">
                        <div class="item-quantidade-controle">
                            <button class="qty-btn less-qty" data-index="${index}"><img src="less.svg" alt="Diminuir"></button>
                            <span class="item-quantidade">${itemCarrinho.quantity}</span>
                            <button class="qty-btn add-qty" data-index="${index}"><img src="add.svg" alt="Aumentar"></button>
                        </div>
                        ${hasAdicionaisDisponiveis ? `
                            <button class="btn-editar-adicionais" data-index="${index}">Editar Adicionais</button>
                            <button class="btn-toggle-adicionais" data-index="${index}">
                                <img src="down.svg" alt="Mostrar/Esconder adicionais" class="${adicionaisHtml.includes('<ul') ? 'rotated' : ''}">
                            </button>
                        ` : ''}
                    </div>
                `;
                carrinhoItemsContainer.appendChild(itemDiv);
            });

            carrinhoItemsContainer.querySelectorAll('.qty-btn.add-qty').forEach(btn => {
                btn.addEventListener('click', (e) => aumentarQuantidade(parseInt(e.currentTarget.dataset.index)));
            });
            carrinhoItemsContainer.querySelectorAll('.qty-btn.less-qty').forEach(btn => {
                btn.addEventListener('click', (e) => diminuirQuantidade(parseInt(e.currentTarget.dataset.index)));
            });
            carrinhoItemsContainer.querySelectorAll('.btn-toggle-adicionais').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemDiv = e.currentTarget.closest('.carrinho-item');
                    const adicionaisInfo = itemDiv.querySelector('.item-adicionais-info');
                    adicionaisInfo.classList.toggle('collapsed');
                    e.currentTarget.querySelector('img').classList.toggle('rotated');
                });
            });

            carrinhoItemsContainer.querySelectorAll('.btn-editar-adicionais').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    if (carrinho[index].adicionaisDisponiveis && carrinho[index].adicionaisDisponiveis.length > 0) {
                        abrirModalEditarAdicionais(carrinho[index], index);
                    } else {
                        alert("Este item não possui adicionais configuráveis.");
                    }
                });
            });
        }
        calcularTotalCarrinho();
    }

    window.adicionarAoCarrinho = function(itemDoMenuOriginal, quantidade = 1) {
        const itemExistenteIndex = carrinho.findIndex(item =>
            item.id === itemDoMenuOriginal.id &&
            (!item.adicionaisSelecionados || item.adicionaisSelecionados.length === 0)
        );

        if (itemExistenteIndex > -1) {
            carrinho[itemExistenteIndex].quantity += quantidade;
        } else {
            const itemParaCarrinho = {
                id: itemDoMenuOriginal.id || Date.now(),
                title: itemDoMenuOriginal.title,
                price: itemDoMenuOriginal.price,
                image: itemDoMenuOriginal.image,
                description: itemDoMenuOriginal.description,
                adicionaisDisponiveis: (itemDoMenuOriginal.adicionais || []).map(ad => ({
                    id: ad.id || Date.now() + Math.random(),
                    name: ad.name || ad.nome,
                    price: ad.price || ad.preco
                })),
                adicionaisSelecionados: [],
                quantity: quantidade
            };
            carrinho.push(itemParaCarrinho);
        }
        salvarCarrinho();
        renderizarCarrinho();
        carrinhoSidebar.classList.add('open');
    };

    function aumentarQuantidade(index) {
        carrinho[index].quantity++;
        salvarCarrinho();
        renderizarCarrinho();
    }

    function diminuirQuantidade(index) {
        carrinho[index].quantity--;
        if (carrinho[index].quantity <= 0) {
            carrinho.splice(index, 1);
        }
        salvarCarrinho();
        renderizarCarrinho();
    }

    // Função para abrir modal de edição de adicionais
    function abrirModalEditarAdicionais(carrinhoItem, index) {
        currentCarrinhoItemIndex = index;

        if (!modalEditarAdicionais) { // Cria o modal apenas uma vez se não existir
            modalEditarAdicionais = document.createElement('div');
            modalEditarAdicionais.id = 'modalEditarAdicionais';
            modalEditarAdicionais.classList.add('modal', 'hidden');
            modalEditarAdicionais.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" data-modal="modalEditarAdicionais" aria-label="Fechar modal">
                        <img src="xicon.svg" alt="Fechar" class="close-icon"/>
                    </button>
                    <h2>Editar Adicionais de: <span id="editarAdicionaisTituloItem"></span></h2>
                    <div id="editarAdicionaisList" class="adicionais-opcoes-list">
                        <!-- Adicionais serão carregados aqui -->
                    </div>
                    <div class="modal-buttons">
                        <button id="salvarAdicionaisBtn" class="adicionar-btn">Salvar Adicionais</button>
                        <button id="cancelarAdicionaisBtn" class="cancelar-btn">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalEditarAdicionais);

            // Anexa listeners apenas na criação
            modalEditarAdicionais.querySelector('.modal-close').addEventListener('click', () => {
                closeModal(modalEditarAdicionais);
            });
            modalEditarAdicionais.querySelector('#cancelarAdicionaisBtn').addEventListener('click', () => {
                closeModal(modalEditarAdicionais);
            });
             modalEditarAdicionais.addEventListener('click', (e) => { // Listener para fechar clicando no overlay
                if (e.target === modalEditarAdicionais) {
                    closeModal(modalEditarAdicionais);
                }
            });
        }

        modalEditarAdicionais.querySelector('#editarAdicionaisTituloItem').textContent = carrinhoItem.title;
        const editarAdicionaisList = modalEditarAdicionais.querySelector('#editarAdicionaisList');
        editarAdicionaisList.innerHTML = '';

        let tempAdicionaisSelecionados = JSON.parse(JSON.stringify(carrinhoItem.adicionaisSelecionados || []));

        if (carrinhoItem.adicionaisDisponiveis && carrinhoItem.adicionaisDisponiveis.length > 0) {
            modalEditarAdicionais.querySelector('#salvarAdicionaisBtn').style.display = 'block';
            modalEditarAdicionais.querySelector('#cancelarAdicionaisBtn').style.display = 'block';

            carrinhoItem.adicionaisDisponiveis.forEach(adicional => {
                const adicionalSelecionado = tempAdicionaisSelecionados.find(a => a.id === adicional.id);
                const quantity = adicionalSelecionado ? adicionalSelecionado.quantity : 0;

                const adName = adicional.name;
                const adPrice = parseFloat(adicional.price);

                const adicionalDiv = document.createElement('div');
                adicionalDiv.classList.add('adicional-opcao');
                adicionalDiv.innerHTML = `
                    <span>${adName} (R$ ${adPrice.toFixed(2).replace('.', ',')})</span>
                    <div class="adicional-quantity-control">
                        <button class="adicional-qty-btn less-adicional" data-adicional-id="${adicional.id}"><img src="less.svg" alt="Diminuir"></button>
                        <span class="adicional-quantity">${quantity}</span>
                        <button class="adicional-qty-btn add-adicional" data-adicional-id="${adicional.id}"><img src="add.svg" alt="Aumentar"></button>
                    </div>
                `;
                editarAdicionaisList.appendChild(adicionalDiv);
            });

            editarAdicionaisList.querySelectorAll('.add-adicional').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const adicionalId = e.currentTarget.dataset.adicionalId;
                    const spanQty = e.currentTarget.parentElement.querySelector('.adicional-quantity');
                    let currentQty = parseInt(spanQty.textContent);
                    currentQty++;
                    spanQty.textContent = currentQty;

                    const adicionalTemp = tempAdicionaisSelecionados.find(a => a.id == adicionalId);
                    if (adicionalTemp) {
                        adicionalTemp.quantity = currentQty;
                    } else {
                        const originalAdicional = carrinhoItem.adicionaisDisponiveis.find(a => a.id == adicionalId);
                        if (originalAdicional) {
                            tempAdicionaisSelecionados.push({
                                id: originalAdicional.id,
                                name: originalAdicional.name,
                                price: originalAdicional.price,
                                quantity: currentQty
                            });
                        }
                    }
                });
            });
            editarAdicionaisList.querySelectorAll('.less-adicional').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const adicionalId = e.currentTarget.dataset.adicionalId;
                    const spanQty = e.currentTarget.parentElement.querySelector('.adicional-quantity');
                    let currentQty = parseInt(spanQty.textContent);
                    if (currentQty > 0) {
                        currentQty--;
                        spanQty.textContent = currentQty;

                        const adicionalTempIndex = tempAdicionaisSelecionados.findIndex(a => a.id == adicionalId);
                        if (adicionalTempIndex > -1) {
                            tempAdicionaisSelecionados[adicionalTempIndex].quantity = currentQty;
                            if (currentQty === 0) {
                                tempAdicionaisSelecionados.splice(adicionalTempIndex, 1);
                            }
                        }
                    }
                });
            });

            const salvarAdicionaisBtn = modalEditarAdicionais.querySelector('#salvarAdicionaisBtn');
            salvarAdicionaisBtn.onclick = () => {
                carrinho[currentCarrinhoItemIndex].adicionaisSelecionados = tempAdicionaisSelecionados.filter(a => a.quantity > 0);
                salvarCarrinho();
                renderizarCarrinho();
                closeModal(modalEditarAdicionais);
                alert("Adicionais salvos!");
            };
        } else {
            editarAdicionaisList.innerHTML = '<p class="modal-info-text">Este item não possui adicionais configuráveis.</p>';
            modalEditarAdicionais.querySelector('#salvarAdicionaisBtn').style.display = 'none';
            modalEditarAdicionais.querySelector('#cancelarAdicionaisBtn').style.display = 'none';
        }

        openModal(modalEditarAdicionais);
    }

    function renderHorariosNoModal() {
        horariosFuncionamentoDisplay.innerHTML = '';
        const diasDaSemanaNomes = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

        lojaConfig.horariosFuncionamento.forEach((diaConfig, index) => {
            const diaNome = diasDaSemanaNomes[index];
            const diaItem = document.createElement('div');
            diaItem.classList.add('horario-dia-item');

            const nomeSpan = document.createElement('span');
            nomeSpan.classList.add('dia-nome');
            nomeSpan.textContent = diaNome;
            diaItem.appendChild(nomeSpan);

            const intervalosSpan = document.createElement('span');
            intervalosSpan.classList.add('intervalos-texto');

            if (diaConfig.fechado) {
                intervalosSpan.textContent = "Fechado";
                diaItem.classList.add('fechado');
            } else if (diaConfig.intervalos && diaConfig.intervalos.length > 0) {
                const intervalosTexto = diaConfig.intervalos.map(intervalo =>
                    `${intervalo.abertura} às ${intervalo.fechamento}`
                ).join(' / ');
                intervalosSpan.textContent = intervalosTexto;
            } else {
                intervalosSpan.textContent = "Não informado";
            }
            diaItem.appendChild(intervalosSpan);
            horariosFuncionamentoDisplay.appendChild(diaItem);
        });
    }

    function renderPagamentosNoModal() {
        sobrePagamentosDisplay.innerHTML = '';
        if (lojaConfig.sobre.pagamentos && lojaConfig.sobre.pagamentos.length > 0) {
            lojaConfig.sobre.pagamentos.forEach(metodo => {
                const tag = document.createElement('span');
                tag.classList.add('pagamento-tag');
                
                let iconSrc = '';
                let altText = '';
                const metodoLower = metodo.toLowerCase();

                if (metodoLower.includes('pix')) {
                    iconSrc = 'pix.svg';
                    altText = 'Ícone Pix';
                } else if (metodoLower.includes('dinheiro')) {
                    iconSrc = 'dinheiro.svg';
                    altText = 'Ícone Dinheiro';
                } else if (metodoLower.includes('bitcoin')) {
                    iconSrc = 'bitcoin.svg';
                    altText = 'Ícone Bitcoin';
                } else {
                    iconSrc = 'card.svg';
                    altText = `Ícone ${metodo}`;
                }

                if (iconSrc) {
                    const iconImg = document.createElement('img');
                    iconImg.src = iconSrc;
                    iconImg.alt = altText;
                    iconImg.classList.add('pagamento-tag-icon');
                    tag.appendChild(iconImg);
                }

                const textNode = document.createTextNode(metodo);
                tag.appendChild(textNode);
                
                sobrePagamentosDisplay.appendChild(tag);
            });
        } else {
            const span = document.createElement('span');
            span.textContent = "Não informado";
            sobrePagamentosDisplay.appendChild(span);
        }
    }

    function atualizarStatusLoja() {
        if (!statusLojaBtn) {
            console.warn("Elemento com ID 'statusBtn' não encontrado. Verifique o ID do botão no seu HTML.");
            return;
        }

        const agora = new Date();
        const diaDaSemana = agora.getDay();
        const horaAtualEmMinutos = agora.getHours() * 60 + agora.getMinutes();

        const configDia = lojaConfig.horariosFuncionamento[diaDaSemana];

        let lojaAberta = false;

        if (configDia && !configDia.fechado) {
            if (configDia.intervalos && configDia.intervalos.length > 0) {
                for (const intervalo of configDia.intervalos) {
                    const [horaAberturaStr, minutoAberturaStr] = intervalo.abertura.split(':');
                    const horaAberturaEmMinutos = parseInt(horaAberturaStr) * 60 + parseInt(minutoAberturaStr);

                    const [horaFechamentoStr, minutoFechamentoStr] = intervalo.fechamento.split(':');
                    const horaFechamentoEmMinutos = parseInt(horaFechamentoStr) * 60 + parseInt(minutoFechamentoStr);

                    if (horaAberturaEmMinutos > horaFechamentoEmMinutos) {
                        if (horaAtualEmMinutos >= horaAberturaEmMinutos || horaAtualEmMinutos < horaFechamentoEmMinutos) {
                            lojaAberta = true;
                            break;
                        }
                    } else {
                        if (horaAtualEmMinutos >= horaAberturaEmMinutos && horaAtualEmMinutos < horaFechamentoEmMinutos) {
                            lojaAberta = true;
                            break;
                        }
                    }
                }
            }
        }

        if (lojaAberta) {
            statusLojaBtn.textContent = "Aberto";
            statusLojaBtn.classList.remove("fechado");
            statusLojaBtn.classList.add("aberto");
            document.body.classList.remove("loja-fechada");
            document.body.classList.add("loja-aberta");
        } else {
            statusLojaBtn.textContent = "Fechado";
            statusLojaBtn.classList.remove("aberto");
            statusLojaBtn.classList.add("fechado");
            document.body.classList.add("loja-fechada");
            document.body.classList.remove("loja-aberta");
        }
    }

    // === ATUALIZA INFORMAÇÕES BÁSICAS DA LOJA ===
    if (nomeLojaTitulo) {
        if (lojaConfig.nome) {
            nomeLojaTitulo.textContent = lojaConfig.nome;
        }
    }
    if (fotoPerfilElement) {
        fotoPerfilElement.src = lojaConfig.fotoPerfil || "iconfoto.png";
    }

    // --- RENDERIZAR CARROSSEL DE BANNERS ---
    let currentBannerIndex = 0;
    let bannerInterval;

    function renderBannersCarousel() {
        bannerCarouselContainer.innerHTML = '';
        const banners = lojaConfig.banners;

        if (banners.length === 0) {
            const defaultBanner = document.createElement("img");
            defaultBanner.src = "capafoto.jpg";
            defaultBanner.alt = "Capa da loja";
            defaultBanner.className = "banner-carousel-item";
            bannerCarouselContainer.appendChild(defaultBanner);
            return;
        }

        const innerCarousel = document.createElement("div");
        innerCarousel.className = "banner-carousel-inner";
        bannerCarouselContainer.appendChild(innerCarousel);

        const indicatorsContainer = document.createElement("div");
        indicatorsContainer.className = "carousel-indicators";
        bannerCarouselContainer.appendChild(indicatorsContainer);

        banners.forEach((bannerSrc, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "banner-carousel-item";
            const img = document.createElement("img");
            img.src = bannerSrc;
            img.alt = `Banner ${index + 1}`;
            itemDiv.appendChild(img);
            innerCarousel.appendChild(itemDiv);

            const indicator = document.createElement("div");
            indicator.className = "indicator";
            indicator.addEventListener("click", () => showBanner(index));
            indicatorsContainer.appendChild(indicator);
        });

        function showBanner(index) {
            if (index >= banners.length) index = 0;
            if (index < 0) index = banners.length - 1;

            currentBannerIndex = index;

            const firstCarouselItem = innerCarousel.querySelector('.banner-carousel-item');
            const itemWidth = firstCarouselItem ? firstCarouselItem.offsetWidth : bannerCarouselContainer.offsetWidth;

            const offset = Math.round(-currentBannerIndex * itemWidth);
            innerCarousel.style.transform = `translateX(${offset}px)`;

            document.querySelectorAll(".carousel-indicators .indicator").forEach((ind, i) => {
                ind.classList.toggle("active", i === currentBannerIndex);
            });
        }

        function nextBanner() {
            showBanner(currentBannerIndex + 1);
        }

        showBanner(0);
        bannerCarouselContainer.addEventListener("click", nextBanner);

        function startAutoPlay() {
            if (bannerInterval) clearInterval(bannerInterval);
            bannerInterval = setInterval(nextBanner, 5000);
        }

        startAutoPlay();
        bannerCarouselContainer.addEventListener("mouseover", () => clearInterval(bannerInterval));
        bannerCarouselContainer.addEventListener("mouseleave", startAutoPlay);
    }


    // --- FUNÇÕES DOS NOVOS BOTÕES DE AÇÃO ---

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
        });
    }

    if (searchToggleButton) {
        searchToggleButton.addEventListener('click', () => {
            searchBarContainer.classList.add('active');
            searchInput.focus();
            if (themeToggleButton) themeToggleButton.style.display = 'none';
            if (shareButton) shareButton.style.display = 'none';
        });
    }

    if (closeSearchButton) {
        closeSearchButton.addEventListener('click', () => {
            searchBarContainer.classList.remove('active');
            searchInput.value = '';
            if (themeToggleButton) themeToggleButton.style.display = 'flex';
            if (shareButton) shareButton.style.display = 'flex';
        });
    }

    document.addEventListener('click', (e) => {
        if (searchBarContainer && searchToggleButton && searchBarContainer.classList.contains('active')) {
            if (!searchBarContainer.contains(e.target) && !searchToggleButton.contains(e.target)) {
                searchBarContainer.classList.remove('active');
                searchInput.value = '';
                if (themeToggleButton) themeToggleButton.style.display = 'flex';
                if (shareButton) shareButton.style.display = 'flex';
            }
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const allItems = document.querySelectorAll('.item');

            allItems.forEach(item => {
                const itemName = item.querySelector('h3').textContent.toLowerCase();
                const itemDescriptionElement = item.querySelector('p:not(.item-price)');
                const itemDescription = itemDescriptionElement ? itemDescriptionElement.textContent.toLowerCase() : '';

                if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });

            document.querySelectorAll('.category-section').forEach(section => {
                const visibleItems = section.querySelectorAll('.item[style*="display: block"]');
                if (visibleItems.length === 0 && searchTerm !== '') {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });
        });
    }

    if (shareButton) {
        shareButton.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: lojaConfig.nome || "Minha Loja Online",
                        text: lojaConfig.descricao || "Confira os produtos incríveis da nossa loja!",
                        url: window.location.href
                    });
                    console.log('Loja compartilhada com sucesso!');
                } catch (error) {
                    console.error('Erro ao compartilhar a loja:', error);
                    fallbackCopyTextToClipboard(window.location.href);
                }
            } else {
                fallbackCopyTextToClipboard(window.location.href);
            }
        });
    }

    // === MODAL PRINCIPAL (Detalhes do Item) ===
    abrirModal = (itemCompleto) => {
        currentMenuItemInModal = itemCompleto;

        modalNome.innerText = itemCompleto.title;
        modalPreco.innerText = `R$ ${parseFloat(itemCompleto.price).toFixed(2).replace(".", ",")}`;
        modalIngredientes.innerText = itemCompleto.description || "Sem descrição.";
        modalImg.src = itemCompleto.image || "default-item.png";
        modalImg.alt = itemCompleto.title;

        btnAdicionarModal.onclick = null;
        btnAdicionarModal.onclick = () => {
            window.adicionarAoCarrinho(currentMenuItemInModal, 1);
            alert("Item adicionado: " + currentMenuItemInModal.title);
            fecharModal();
        };

        openModal(modal);
    };

    fecharModal = () => {
        closeModal(modal);
    };

    if (btnFecharModal) {
        btnFecharModal.addEventListener("click", fecharModal);
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (!modal.querySelector(".modal-content").contains(e.target)) {
                fecharModal();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (modal.classList.contains("show")) {
                fecharModal();
            }
            if (sobreModal.classList.contains("show")) {
                closeModal(sobreModal);
            }
            if (modalEditarAdicionais && modalEditarAdicionais.classList.contains('show')) {
                closeModal(modalEditarAdicionais);
            }
            if (finalizarPedidoModal && finalizarPedidoModal.classList.contains('show')) {
                closeModal(finalizarPedidoModal);
            }
        }
    });

    // === MODAL SOBRE ===
    if (sobreBtn) {
        sobreBtn.addEventListener("click", () => {
            sobreNome.textContent = lojaConfig.nome || "Minha Loja";
            sobreDescricao.textContent = lojaConfig.descricao || "Bem-vindo à nossa loja!";

            renderHorariosNoModal();
            renderPagamentosNoModal();

            sobreEndereco.textContent = `Endereço: ${lojaConfig.sobre.endereco || "Não informado"}`;
            sobreContato.textContent = `Contato: ${lojaConfig.sobre.contact || "Não informado"}`;

            openModal(sobreModal);
        });
    }

    if (fecharSobre) {
        fecharSobre.addEventListener("click", () => {
            closeModal(sobreModal);
        });
    }

    if (sobreModal) {
        sobreModal.addEventListener("click", (e) => {
            if (e.target === sobreModal || (e.target.classList.contains('modal-close') && e.target.closest('#sobreModal'))) {
                closeModal(sobreModal);
            }
        });
    }

    // === RENDERIZA CARDÁPIO & CATEGORIAS ===
    const categorias = {};
    menu.forEach(item => {
        if (item.hidden) return;
        if (!categorias[item.category]) categorias[item.category] = [];
        categorias[item.category].push(item);
    });

    const categoriasOrdenadas = ordemCategorias.filter(cat => categorias[cat]);
    Object.keys(categorias).forEach(cat => {
        if (!categoriasOrdenadas.includes(cat)) {
            categoriasOrdenadas.push(cat);
        }
    });

    if (cardapioContainer) {
        categoriasOrdenadas.forEach(categoria => {
            const itens = categorias[categoria];
            if (!itens || itens.length === 0) return;

            const section = document.createElement("div");
            section.className = "category-section";

            const titulo = document.createElement("div");
            titulo.className = "category-title";
            titulo.textContent = categoria;

            const grid = document.createElement("div");
            grid.className = "item-grid";

            itens.forEach(item => {
                const card = document.createElement("div");
                card.className = "item";
                card.id = `item-${item.id || Math.random().toString(36).substr(2, 9)}`;

                const img = document.createElement("img");
                img.src = item.image || "default-item.png";
                img.alt = item.title;
                img.onclick = () => abrirModal(item);

                const nome = document.createElement("h3");
                nome.textContent = item.title;

                const preco = document.createElement("p");
                preco.classList.add("item-price");
                preco.textContent = `R$ ${parseFloat(item.price).toFixed(2).replace(".", ",")}`;

                const botao = document.createElement("button");
                botao.textContent = "Adicionar";
                botao.classList.add("adicionar-btn");
                botao.onclick = () => abrirModal(item);

                card.appendChild(img);
                card.appendChild(nome);
                card.appendChild(preco);
                card.appendChild(botao);
                grid.appendChild(card);
            });

            section.appendChild(titulo);
            section.appendChild(grid);
            cardapioContainer.appendChild(section);
        });
    }

    // === CARROSSEL DE CATEGORIAS (Navegação) ===
    if (categoriaCarrossel) {
        categoriaCarrossel.innerHTML = "";

        categoriasOrdenadas.forEach((categoria) => {
            const wrapper = document.createElement("div");
            wrapper.className = "categoria-circulo";
            wrapper.title = categoria; 
            
            wrapper.addEventListener("click", () => {
                document.querySelectorAll(".categoria-circulo").forEach(el => {
                    el.classList.remove("selecionado");
                });
                wrapper.classList.add("selecionado");

                const titulo = [...document.querySelectorAll(".category-title")]
                    .find(el => el.textContent.trim() === categoria);
                if (titulo) {
                    titulo.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });

            categoriaCarrossel.appendChild(wrapper);
        });

        const primeiro = categoriaCarrossel.querySelector(".categoria-circulo");
        if (primeiro) primeiro.classList.add("selecionado");
    }

    // --- LÓGICA DO MODAL DE FINALIZAR PEDIDO (EVENT LISTENERS) ---
    // Esses listeners agora são anexados diretamente no DOMContentLoaded
    // porque o modal está no HTML desde o início.
    if (finalizarPedidoModal) { // Garante que o modal existe no HTML
        const fecharFinalizarPedidoBtn = document.getElementById("fecharFinalizarPedido");
        const clienteNomeInput = document.getElementById("clienteNome");
        const clienteCelularInput = document.getElementById("clienteCelular");
        const retirarBtn = finalizarPedidoModal.querySelector('[data-type="retirar"]'); // Usar querySelector para o primeiro botão encontrado
        const entregaBtn = finalizarPedidoModal.querySelector('[data-type="entrega"]'); // Usar querySelector para o segundo botão encontrado
        const enderecoGroup = document.getElementById("enderecoGroup");
        const clienteEnderecoInput = document.getElementById("clienteEndereco"); // Referência ao input de endereço
        const paymentOptionsFinalizarContainer = document.getElementById("paymentOptionsFinalizar");
        const cupomInput = document.getElementById("cupomInput");
        const finalizarPedidoTotalSpan = document.getElementById("finalizarPedidoTotal");
        const revisarPedidoBtn = document.getElementById("revisarPedidoBtn");
        const finalizarPedidoConfirmBtn = document.getElementById("finalizarPedidoWhatsappBtn"); // Botão Finalizar Pedido no modal

        // Event listener para fechar o modal
        if (fecharFinalizarPedidoBtn) {
            fecharFinalizarPedidoBtn.addEventListener('click', () => closeModal(finalizarPedidoModal));
        }
        // Event listener para fechar ao clicar no overlay
        finalizarPedidoModal.addEventListener('click', (e) => {
            if (e.target === finalizarPedidoModal) closeModal(finalizarPedidoModal);
        });

        // Lógica dos botões Retirar/Entrega
        if (retirarBtn) {
            retirarBtn.addEventListener('click', () => {
                retirarBtn.classList.add('selected');
                if (entregaBtn) entregaBtn.classList.remove('selected');
                if (enderecoGroup) enderecoGroup.classList.add('hidden');
                if (clienteEnderecoInput) clienteEnderecoInput.removeAttribute('required'); // Remove required
            });
        }
        if (entregaBtn) {
            entregaBtn.addEventListener('click', () => {
                entregaBtn.classList.add('selected');
                if (retirarBtn) retirarBtn.classList.remove('selected');
                if (enderecoGroup) enderecoGroup.classList.remove('hidden');
                if (clienteEnderecoInput) clienteEnderecoInput.setAttribute('required', 'true'); // Adiciona required
            });
        }

         // Função para renderizar as formas de pagamento no modal de finalizar pedido (TOTALMENTE REFEITA)
        function renderPaymentOptionsForFinalizar() {
            if (!paymentMethodSelectWrapper || !customSelectTrigger || !customOptionsList) {
                console.error("Elementos do custom select de pagamento não encontrados. Verifique o HTML e o ID 'paymentMethodSelect'.");
                return;
            }

            customOptionsList.innerHTML = ''; // Limpa as opções existentes
            let defaultSelectedMethod = null;

            if (lojaConfig.sobre.pagamentos && lojaConfig.sobre.pagamentos.length > 0) {
                lojaConfig.sobre.pagamentos.forEach((metodo, index) => {
                    const customOption = document.createElement('div');
                    customOption.classList.add('custom-option');
                    customOption.dataset.metodo = metodo;

                    let iconSrc = '';
                    const metodoLower = metodo.toLowerCase();
                    if (metodoLower.includes('pix')) iconSrc = 'pix.svg';
                    else if (metodoLower.includes('dinheiro')) iconSrc = 'dinheiro.svg';
                    else if (metodoLower.includes('bitcoin')) iconSrc = 'bitcoin.svg';
                    else iconSrc = 'card.svg'; // Ícone padrão para outros métodos

                    if (iconSrc) {
                        const iconImg = document.createElement('img');
                        iconImg.src = iconSrc;
                        iconImg.alt = `Ícone ${metodo}`;
                        iconImg.classList.add('custom-option-icon');
                        customOption.appendChild(iconImg);
                    }
                    customOption.appendChild(document.createTextNode(metodo));
                    customOptionsList.appendChild(customOption);

                    // Seleciona a primeira opção por padrão na lista e no trigger
                    if (index === 0) {
                        defaultSelectedMethod = metodo;
                        customOption.classList.add('selected-option');
                    }

                    customOption.addEventListener('click', (e) => {
                        const selectedMetodo = e.currentTarget.dataset.metodo;
                        
                        // Atualiza o trigger com o valor selecionado
                        selectedOptionText.textContent = selectedMetodo;
                        selectedOptionIcon.src = e.currentTarget.querySelector('.custom-option-icon').src;
                        selectedOptionIcon.alt = e.currentTarget.querySelector('.custom-option-icon').alt;

                        // Remove a classe 'selected-option' de todos e adiciona ao clicado na lista
                        customOptionsList.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected-option'));
                        e.currentTarget.classList.add('selected-option');

                        // Fecha o dropdown
                        customSelectTrigger.classList.remove('active');
                        customOptionsList.classList.remove('show-options');
                    });
                });

                // Configura o valor inicial do trigger ao carregar
                if (defaultSelectedMethod) {
                    selectedOptionText.textContent = defaultSelectedMethod;
                    // Encontra o ícone da primeira opção para exibir no trigger inicial
                    const firstOptionIconSrc = customOptionsList.querySelector('.custom-option.selected-option')?.querySelector('.custom-option-icon')?.src || 'card.svg';
                    selectedOptionIcon.src = firstOptionIconSrc;
                    selectedOptionIcon.alt = `Ícone ${defaultSelectedMethod}`;
                }

                // Listener para abrir/fechar o dropdown ao clicar no trigger
                customSelectTrigger.addEventListener('click', (e) => {
                    e.stopPropagation(); // Impede que o clique se propague para o document e feche imediatamente
                    customSelectTrigger.classList.toggle('active');
                    customOptionsList.classList.toggle('show-options');
                });

                // Fecha o dropdown se clicar fora de qualquer parte do custom select
                document.addEventListener('click', (e) => {
                    if (!paymentMethodSelectWrapper.contains(e.target)) {
                        customSelectTrigger.classList.remove('active');
                        customOptionsList.classList.remove('show-options');
                    }
                });

            } else {
                selectedOptionText.textContent = 'Nenhuma forma de pagamento configurada.';
                selectedOptionIcon.src = 'card.svg'; // Ícone padrão para "nenhum"
                selectedOptionIcon.alt = 'Ícone padrão';
                customSelectTrigger.style.cursor = 'default';
                // Verifica se o listener existe antes de tentar remover (evita erro se já não tiver sido adicionado)
                // Se `customSelectTrigger` não tem listener ou não é um elemento clicável inicialmente, não remova.
                // Para simplificar, podemos apenas garantir que ele não se comporte como um dropdown se estiver vazio.
                customSelectTrigger.classList.remove('active');
                customOptionsList.classList.remove('show-options');
            }
        }


        renderPaymentOptionsForFinalizar(); // Renderiza as opções de pagamento ao carregar o modal

        // Listener para o botão "Revisar"
        if (revisarPedidoBtn) {
            revisarPedidoBtn.addEventListener('click', () => {
                closeModal(finalizarPedidoModal);
                carrinhoSidebar.classList.add('open'); // Abre o carrinho lateral
            });
        }

        // Listener para o botão "Finalizar Pedido" no modal
        if (finalizarPedidoConfirmBtn) {
            finalizarPedidoConfirmBtn.addEventListener('click', () => {
                const nome = clienteNomeInput.value.trim();
                const celular = clienteCelularInput.value.trim();
                const tipoEntrega = finalizarPedidoModal.querySelector('.delivery-option-btn.selected')?.dataset.type;
                const endereco = clienteEnderecoInput.value.trim();
                const formaPagamento = finalizarPedidoModal.querySelector('.pay-option-finalizar.selected')?.dataset.metodo || "Não selecionado";
                const cupom = cupomInput.value.trim();

                if (!nome || !celular) {
                    alert("Por favor, preencha seu nome e celular.");
                    return;
                }
                if (tipoEntrega === 'entrega' && !endereco) {
                    alert("Por favor, preencha o endereço para entrega.");
                    return;
                }
                if (carrinho.length === 0) {
                    alert("Seu carrinho está vazio!");
                    return;
                }

                // Lógica para SALVAR o pedido e REDIRECIONAR para painelpedido.html
                const novoPedido = {
                    id: Date.now(), // ID único para o pedido
                    cliente: { nome, celular, tipoEntrega, endereco },
                    formaPagamento,
                    cupom,
                    itens: JSON.parse(JSON.stringify(carrinho)), // Cópia do carrinho
                    total: finalizarPedidoTotalSpan.textContent, // Usa o texto do total do modal
                    status: 'Pendente', // Status inicial do pedido
                    data: new Date().toISOString() // Adiciona data e hora do pedido
                };

                const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
                pedidos.push(novoPedido);
                localStorage.setItem('pedidos', JSON.stringify(pedidos));

                alert("Pedido confirmado! Redirecionando para o painel de pedidos.");

                carrinho = []; // Esvazia o carrinho
                salvarCarrinho();
                renderizarCarrinho(); // Atualiza o carrinho visualmente
                closeModal(finalizarPedidoModal); // Fecha o modal
                carrinhoSidebar.classList.remove('open'); // Fecha o carrinho lateral

                // Redireciona para o painel de pedidos
                window.location.href = 'painelpedido.html';
            });
        }
    }


    // --- EVENT LISTENERS PARA OS BOTÕES FIXOS DO RODAPÉ (Carrinho) ---
    if (finalizarPedidoBtn) {
        finalizarPedidoBtn.addEventListener('click', () => {
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.");
                return;
            }
            // Preenche o total no modal antes de abri-lo
            if (finalizarPedidoTotalSpan) { // Garante que o span exista
                finalizarPedidoTotalSpan.textContent = carrinhoTotalValor.textContent;
            }
            openModal(finalizarPedidoModal); // Abre o modal de finalizar pedido
        });
    }

    if (continuarComprandoBtn) {
        continuarComprandoBtn.addEventListener('click', () => {
            carrinhoSidebar.classList.remove('open');
        });
    }

    // Event listener para o botão Limpar Carrinho
    if (limparCarrinhoBtn) {
        limparCarrinhoBtn.addEventListener('click', () => {
            if (confirm("Tem certeza que deseja limpar o carrinho?")) {
                carrinho = [];
                salvarCarrinho();
                renderizarCarrinho();
                alert("Carrinho limpo!");
            }
        });
    }

    if (botaoCarrinho) {
        botaoCarrinho.addEventListener('click', () => {
            carrinhoSidebar.classList.add('open');
            renderizarCarrinho();
        });
    }

    if (voltarCarrinhoBtn) {
        voltarCarrinhoBtn.addEventListener('click', () => {
            carrinhoSidebar.classList.remove('open');
        });
    }

    document.addEventListener('click', (e) => {
        if (carrinhoSidebar && botaoCarrinho && carrinhoSidebar.classList.contains('open')) {
            if (!carrinhoSidebar.contains(e.target) && !botaoCarrinho.contains(e.target)) {
                carrinhoSidebar.classList.remove('open');
            }
        }
    });

    // --- INICIALIZAÇÃO DE FUNÇÕES ---
    renderBannersCarousel();
    atualizarStatusLoja();
    setInterval(atualizarStatusLoja, 60 * 1000);
    renderizarCarrinho(); // Renderiza o carrinho ao carregar a página
});