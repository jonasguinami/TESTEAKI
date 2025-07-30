let abrirModal, fecharModal;

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
    const finalizarPedidoBtn = document.getElementById("finalizarPedidoBtn");
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

    // Removendo referências a modalAdicionaisContainer, modalAdicionaisTitulo, modalAdicionaisList
    // pois não serão usados neste modal.

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

    // === NOVO: Variáveis para o modal de edição de adicionais ===
    let modalEditarAdicionais = null;
    let currentCarrinhoItemIndex = -1; // Índice do item do carrinho que está sendo editado

    // --- FUNÇÕES DE AJUDA ---

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
                    // Multiplica pelo quantity do adicional
                    precoAdicionais += parseFloat(adicional.preco) * adicional.quantity;
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
        } else {
            carrinhoVazioMsg.style.display = 'none';
            carrinho.forEach((itemCarrinho, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('carrinho-item');
                itemDiv.dataset.index = index;

                let adicionaisTexto = "Sem adicionais";
                let adicionaisHtml = '';
                // Se houver adicionais selecionados, lista-os.
                if (itemCarrinho.adicionaisSelecionados && itemCarrinho.adicionaisSelecionados.length > 0) {
                    adicionaisTexto = "Adicionais:";
                    adicionaisHtml = `<ul class="adicionais-lista">`;
                    itemCarrinho.adicionaisSelecionados.forEach(adicional => {
                        adicionaisHtml += `<li>${adicional.nome} (${adicional.quantity}x) - R$ ${parseFloat(adicional.preco).toFixed(2).replace('.', ',')}</li>`;
                    });
                    adicionaisHtml += `</ul>`;
                } else {
                    // Se não tiver adicionais, adiciona a classe para esconder o botão de toggle/editar
                    itemDiv.classList.add('no-adicionais');
                }

                itemDiv.innerHTML = `
                    <div class="item-info">
                        <h4 class="item-titulo">${itemCarrinho.title}</h4>
                        <p class="item-preco">R$ ${parseFloat(itemCarrinho.price).toFixed(2).replace('.', ',')}</p>
                        <div class="item-adicionais-info">
                            <p class="adicionais-texto">${adicionaisTexto}</p>
                            ${adicionaisHtml}
                        </div>
                    </div>
                    <div class="item-acoes">
                        <div class="item-quantidade-controle">
                            <button class="qty-btn less-qty" data-index="${index}"><img src="less.svg" alt="Diminuir"></button>
                            <span class="item-quantidade">${itemCarrinho.quantity}</span>
                            <button class="qty-btn add-qty" data-index="${index}"><img src="add.svg" alt="Aumentar"></button>
                        </div>
                        ${(itemCarrinho.adicionaisDisponiveis && itemCarrinho.adicionaisDisponiveis.length > 0) ? `<button class="btn-editar-adicionais" data-index="${index}">Editar Adicionais</button>` : ''}
                        ${(itemCarrinho.adicionaisDisponiveis && itemCarrinho.adicionaisDisponiveis.length > 0) ? `<button class="btn-toggle-adicionais" data-index="${index}"><img src="down.svg" alt="Mostrar/Esconder adicionais"></button>` : ''}
                    </div>
                `;
                carrinhoItemsContainer.appendChild(itemDiv);
            });

            // Adiciona event listeners para os botões de quantidade e toggle/editar adicionais
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
                    e.currentTarget.classList.toggle('rotated');
                });
            });

            // Adiciona funcionalidade ao botão "Editar Adicionais"
            carrinhoItemsContainer.querySelectorAll('.btn-editar-adicionais').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    // Passa o item do carrinho e seu índice
                    abrirModalEditarAdicionais(carrinho[index], index);
                });
            });
        }
        calcularTotalCarrinho();
    }

    // Função para adicionar item ao carrinho
    // Não recebe adicionais selecionados aqui, pois o modal de item não permite.
    window.adicionarAoCarrinho = function(itemDoMenuOriginal, quantidade = 1) { // Removido adicionaisSelecionados aqui
        // Encontrar se o item (sem considerar adicionais aqui, já que não são selecionados neste ponto)
        // já existe no carrinho. Se você quiser agrupar itens no carrinho por ID e adicionais,
        // a lógica de 'findIndex' deve considerar os adicionais também.
        // Por enquanto, vamos adicionar como um novo item se não houver adicionais.
        // Se houver, a ideia é que ele seja um item único no carrinho até o usuário editar adicionais.
        const itemExistenteIndex = carrinho.findIndex(item =>
            item.id === itemDoMenuOriginal.id &&
            item.adicionaisSelecionados.length === 0 // Considera se já existe sem adicionais
        );

        if (itemExistenteIndex > -1) {
            carrinho[itemExistenteIndex].quantity += quantidade;
        } else {
            const itemParaCarrinho = {
                id: itemDoMenuOriginal.id || Date.now(),
                title: itemDoMenuOriginal.title,
                price: itemDoMenuOriginal.price,
                image: itemDoMenuOriginal.image, // Caminho da imagem, não a imagem em si
                description: itemDoMenuOriginal.description,
                adicionaisDisponiveis: itemDoMenuOriginal.adicionais || [], // Guarda os adicionais disponíveis para edição futura
                adicionaisSelecionados: [], // Começa com adicionais vazios
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

    // NOVO: Função para abrir modal de edição de adicionais (separado do modal de item)
    function abrirModalEditarAdicionais(carrinhoItem, index) {
        currentCarrinhoItemIndex = index;

        // Se o modal de edição ainda não existe no DOM, cria-o
        if (!modalEditarAdicionais) {
            modalEditarAdicionais = document.createElement('div');
            modalEditarAdicionais.id = 'modalEditarAdicionais';
            modalEditarAdicionais.classList.add('modal');
            modalEditarAdicionais.innerHTML = `
                <div class="modal-content">
                    <button class="fechar fechar-editar-adicionais" aria-label="Fechar modal">
                        <img src="xicon.svg" alt="Fechar"/>
                    </button>
                    <h2>Editar Adicionais de: <span id="editarAdicionaisTituloItem"></span></h2>
                    <div id="editarAdicionaisList" class="adicionais-opcoes-list">
                        </div>
                    <button id="salvarAdicionaisBtn" class="adicionar-btn">Salvar Adicionais</button>
                </div>
            `;
            document.body.appendChild(modalEditarAdicionais);

            // Adiciona listeners para o novo modal
            modalEditarAdicionais.querySelector('.fechar-editar-adicionais').addEventListener('click', () => {
                modalEditarAdicionais.classList.remove('show');
            });
            modalEditarAdicionais.addEventListener('click', (e) => {
                if (!e.target.closest('.modal-content')) {
                    modalEditarAdicionais.classList.remove('show');
                }
            });
            // O Escape Key Listener já está no escopo global para todos os modais.
        }

        // Preenche o modal com os dados do item do carrinho
        modalEditarAdicionais.querySelector('#editarAdicionaisTituloItem').textContent = carrinhoItem.title;
        const editarAdicionaisList = modalEditarAdicionais.querySelector('#editarAdicionaisList');
        editarAdicionaisList.innerHTML = ''; // Limpa a lista anterior

        // Se o item do carrinho tem adicionais disponíveis para ele
        if (carrinhoItem.adicionaisDisponiveis && carrinhoItem.adicionaisDisponiveis.length > 0) {
            modalEditarAdicionais.querySelector('#salvarAdicionaisBtn').style.display = 'block'; // Mostra o botão salvar

            // Cria uma cópia dos adicionais selecionados para edição temporária
            // Isso permite cancelar a edição sem salvar
            let tempAdicionaisSelecionados = JSON.parse(JSON.stringify(carrinhoItem.adicionaisSelecionados));

            carrinhoItem.adicionaisDisponiveis.forEach(adicional => {
                // Encontra a quantidade atual desse adicional no item do carrinho
                const adicionalSelecionado = tempAdicionaisSelecionados.find(a => a.id === adicional.id);
                const quantity = adicionalSelecionado ? adicionalSelecionado.quantity : 0;

                const adicionalDiv = document.createElement('div');
                adicionalDiv.classList.add('adicional-opcao');
                adicionalDiv.innerHTML = `
                    <span>${adicional.nome} (R$ ${parseFloat(adicional.preco).toFixed(2).replace('.', ',')})</span>
                    <div class="adicional-quantity-control">
                        <button class="adicional-qty-btn less-adicional" data-adicional-id="${adicional.id}"><img src="less.svg" alt="Diminuir"></button>
                        <span class="adicional-quantity">${quantity}</span>
                        <button class="adicional-qty-btn add-adicional" data-adicional-id="${adicional.id}"><img src="add.svg" alt="Aumentar"></button>
                    </div>
                `;
                editarAdicionaisList.appendChild(adicionalDiv);
            });

            // Adiciona listeners para os botões de quantidade de adicionais NO MODAL DE EDIÇÃO
            editarAdicionaisList.querySelectorAll('.add-adicional').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const adicionalId = parseInt(e.currentTarget.dataset.adicionalId);
                    const spanQty = e.currentTarget.parentElement.querySelector('.adicional-quantity');
                    let currentQty = parseInt(spanQty.textContent);
                    currentQty++;
                    spanQty.textContent = currentQty;

                    // Atualiza a cópia temporária dos adicionais selecionados
                    const adicionalTemp = tempAdicionaisSelecionados.find(a => a.id === adicionalId);
                    if (adicionalTemp) {
                        adicionalTemp.quantity = currentQty;
                    } else {
                        // Se o adicional não estava na lista de selecionados, adiciona-o
                        const originalAdicional = carrinhoItem.adicionaisDisponiveis.find(a => a.id === adicionalId);
                        if (originalAdicional) {
                            tempAdicionaisSelecionados.push({ ...originalAdicional, quantity: currentQty });
                        }
                    }
                });
            });
            editarAdicionaisList.querySelectorAll('.less-adicional').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const adicionalId = parseInt(e.currentTarget.dataset.adicionalId);
                    const spanQty = e.currentTarget.parentElement.querySelector('.adicional-quantity');
                    let currentQty = parseInt(spanQty.textContent);
                    if (currentQty > 0) {
                        currentQty--;
                        spanQty.textContent = currentQty;

                        // Atualiza a cópia temporária dos adicionais selecionados
                        const adicionalTempIndex = tempAdicionaisSelecionados.findIndex(a => a.id === adicionalId);
                        if (adicionalTempIndex > -1) {
                            tempAdicionaisSelecionados[adicionalTempIndex].quantity = currentQty;
                            if (currentQty === 0) {
                                // Remove o adicional se a quantidade for 0
                                tempAdicionaisSelecionados.splice(adicionalTempIndex, 1);
                            }
                        }
                    }
                });
            });

            // Listener para o botão Salvar Adicionais
            const salvarAdicionaisBtn = modalEditarAdicionais.querySelector('#salvarAdicionaisBtn');
            salvarAdicionaisBtn.onclick = () => {
                // Ao salvar, atualiza o item original no carrinho com a cópia temporária
                carrinho[currentCarrinhoItemIndex].adicionaisSelecionados = tempAdicionaisSelecionados;
                salvarCarrinho();
                renderizarCarrinho();
                modalEditarAdicionais.classList.remove('show');
                alert("Adicionais salvos!");
            };
        } else {
            editarAdicionaisList.innerHTML = '<p>Este item não possui adicionais configuráveis.</p>';
            modalEditarAdicionais.querySelector('#salvarAdicionaisBtn').style.display = 'none';
        }

        modalEditarAdicionais.classList.add('show');
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
                tag.textContent = metodo;
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
    // Se lojaConfig.nome existir e não for uma string vazia, atualiza o título.
    // Caso contrário, o texto "Sua loja" do HTML será mantido.
    if (lojaConfig.nome) { // Verifica se a propriedade existe e tem um valor
        nomeLojaTitulo.textContent = lojaConfig.nome;
    }
}
if (fotoPerfilElement) {
    // A foto de perfil ainda terá um fallback se lojaConfig.fotoPerfil não existir
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

        // NÃO HÁ LÓGICA DE ADICIONAIS AQUI NESTE MODAL.
        // O container de adicionais no HTML do modal (se existir) deve ser ocultado por padrão.
        // Se você tinha modal-adicionais-container, certifique-se de que ele não é exibido.

        btnAdicionarModal.onclick = null;
        btnAdicionarModal.onclick = () => {
            // Adiciona o item ao carrinho SEM adicionais iniciais.
            // Os adicionais serão configurados no carrinho.
            window.adicionarAoCarrinho(currentMenuItemInModal, 1);
            alert("Item adicionado: " + currentMenuItemInModal.title);
            fecharModal();
        };

        modal.classList.add("show");
    };

    fecharModal = () => {
        modal.classList.remove("show");
        // Não há checkboxes de adicionais para limpar aqui.
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
                sobreModal.classList.remove("show");
            }
            if (modalEditarAdicionais && modalEditarAdicionais.classList.contains('show')) {
                modalEditarAdicionais.classList.remove('show');
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

            sobreModal.classList.add("show");
        });
    }

    if (fecharSobre) {
        fecharSobre.addEventListener("click", () => {
            sobreModal.classList.remove("show");
        });
    }

    if (sobreModal) {
        sobreModal.addEventListener("click", (e) => {
            if (!e.target.closest(".modal-sobre-content")) {
                sobreModal.classList.remove("show");
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

    // --- EVENT LISTENERS PARA OS BOTÕES FIXOS DO RODAPÉ (Carrinho) ---
    if (finalizarPedidoBtn) {
        finalizarPedidoBtn.addEventListener('click', () => {
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.");
                return;
            }
            alert("Simulando Finalizar Pedido! (Aqui a lógica de envio para o backend seria implementada)");
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
                carrinho = []; // Esvazia o array do carrinho
                salvarCarrinho(); // Salva o carrinho vazio no localStorage
                renderizarCarrinho(); // Atualiza a exibição do carrinho
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
    renderizarCarrinho();
});