// Referências para elementos do DOM - Declaradas no escopo global para serem acessíveis em qualquer lugar
const refs = {};

// Declaração de variáveis no escopo adequado para serem acessíveis
let lojistaConfig = {}; // Inicializado com um objeto vazio. Será preenchido ou com defaults.
let notificationAudio; // Declarado aqui, será atribuído no DOMContentLoaded
let notificationInterval = null; // Para controlar o intervalo das notificações

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa as referências DOM dentro do DOMContentLoaded para garantir que os elementos já existam
    refs.imageInput = document.getElementById('addItemImage');
    refs.titleInput = document.getElementById('title');
    refs.descriptionInput = document.getElementById('description');
    refs.priceInput = document.getElementById('price');
    refs.categorySelect = document.getElementById('category');
    refs.newCategoryInput = document.getElementById('newCategory');
    refs.menuList = document.getElementById('menuList');
    refs.categoryTabs = document.getElementById('categoryTabs');

    refs.editModal = document.getElementById('editModal');
    refs.editItemImagePreview = document.getElementById('editItemImagePreview');
    refs.editItemImage = document.getElementById('editItemImage');
    refs.editItemTitle = document.getElementById('editItemTitle');
    refs.editItemDescription = document.getElementById('editItemDescription');
    refs.editItemPrice = document.getElementById('editItemPrice');
    refs.editItemCategory = document.getElementById('editItemCategory');

    refs.saveMenuBtn = document.getElementById('saveMenu');

    refs.adicionaisModal = document.getElementById("adicionaisModal");
    refs.adicionalNome = document.getElementById("adicionalNome");
    refs.adicionalPreco = document.getElementById("adicionalPreco");
    refs.salvarAdicionais = document.getElementById("salvarAdicionais");
    refs.adicionaisList = document.getElementById("adicionaisList");

    refs.userIconButton = document.getElementById('userIconButton');
    refs.bellIconButton = document.getElementById('bellIconButton');
    refs.bellIcon = document.getElementById('bellIcon'); // A imagem dentro do botão do sino

    refs.userOptionsModal = document.getElementById('userOptionsModal');
    refs.configButton = document.getElementById('configButton');
    refs.supportButton = document.getElementById('supportButton');

    refs.userConfigModal = document.getElementById('userConfigModal');
    // **CORREÇÃO AQUI**: Apenas uma linha para refs.userConfigForm, apontando para o ID correto
    refs.userConfigForm = document.getElementById('userConfigForm');
    refs.userNameInput = document.getElementById('userName');
    refs.userEmailInput = document.getElementById('userEmail');
    refs.userPhoneInput = document.getElementById('userPhone');
    refs.notificationVolumeInput = document.getElementById('notificationVolume');
    refs.volumeValueSpan = document.getElementById('volumeValue');

    refs.supportModal = document.getElementById('supportModal');
    refs.notificationModal = document.getElementById('notificationModal');
    
    // Atribui o elemento de áudio à variável declarada anteriormente
    notificationAudio = document.getElementById('notificationSound');

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

    // Variáveis de estado do aplicativo
    let menuItems = JSON.parse(localStorage.getItem("menu")) || [];
    let categoryOrder = JSON.parse(localStorage.getItem("categoryOrder")) || [];
    let currentFilter = 'Todos';
    let editingIndex = null; // Índice do item sendo editado
    let currentAdicionaisItemIndex = null; // Índice do item cujos adicionais estão sendo gerenciados

    // --- Funções de Estado e Persistência ---
    function saveState() {
        localStorage.setItem("menu", JSON.stringify(menuItems));
        localStorage.setItem("categoryOrder", JSON.stringify(categoryOrder));
        localStorage.setItem("ordemCategorias", JSON.stringify(categoryOrder)); // Usado no index.html
        alert("Cardápio salvo com sucesso!");
    }

    // --- Funções Auxiliares de Dados ---
    function getOrderedCategories() {
        const categories = [...new Set(menuItems.map(i => i.category))].filter(Boolean); // Filtrar categorias vazias
        categoryOrder = categoryOrder.filter(c => categories.includes(c)); // Remove categorias que não existem mais
        const newOnes = categories.filter(c => !categoryOrder.includes(c)); // Adiciona novas categorias
        categoryOrder.push(...newOnes);
        return [...categoryOrder];
    }

    function updateCategorySelects() {
        const categories = [...new Set(menuItems.map(i => i.category))].filter(Boolean);
        const options = categories.map(c => `<option value="${c}">${c}</option>`).join('');
        refs.categorySelect.innerHTML = `<option value="">Selecione uma categoria</option>` + options;
        refs.editItemCategory.innerHTML = options;
    }

    function clearAddItemForm() {
        refs.titleInput.value = '';
        refs.descriptionInput.value = '';
        refs.priceInput.value = '';
        refs.categorySelect.value = '';
        refs.newCategoryInput.value = '';
        refs.imageInput.value = '';

        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.src = '';
            preview.style.display = 'none';
        }
    }

    // --- Funções de Renderização da UI ---
    function renderCategoryTabs() {
        refs.categoryTabs.innerHTML = '';

        const createTab = (name, isActive) => {
            const tab = document.createElement('div');
            tab.className = 'tab-btn' + (isActive ? ' active' : '');
            tab.textContent = name;
            tab.addEventListener('click', () => {
                currentFilter = name;
                renderMenuItems();
                renderCategoryTabs();
            });
            return tab;
        };

        refs.categoryTabs.appendChild(createTab('Todos', currentFilter === 'Todos'));

        getOrderedCategories().forEach(category => {
            const wrapper = document.createElement('div');
            wrapper.className = 'tab-btn-wrapper';
            wrapper.draggable = true;
            wrapper.dataset.categoryName = category; // Armazena o nome da categoria para drag and drop

            const tab = createTab(category, currentFilter === category);
            const menuBtn = document.createElement('button');
            menuBtn.className = 'category-menu-btn';
            menuBtn.addEventListener('click', e => {
                e.stopPropagation();
                showContextMenu(category, menuBtn);
            });

            const icon = document.createElement('img');
            icon.src = 'bars.svg';
            icon.alt = 'Opções';
            icon.classList.add('drag-handle');
            menuBtn.appendChild(icon);
            tab.appendChild(menuBtn);
            wrapper.appendChild(tab);

            // Drag and Drop para categorias
            wrapper.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', wrapper.dataset.categoryName);
                wrapper.classList.add('dragging');
            });

            wrapper.addEventListener('dragover', e => {
                e.preventDefault();
                // Adiciona uma borda visual para indicar a área de drop
                const draggingCategory = e.dataTransfer.getData('text/plain');
                if (draggingCategory !== wrapper.dataset.categoryName) {
                    wrapper.style.borderLeft = '2px solid #2196f3';
                }
            });

            wrapper.addEventListener('dragleave', () => {
                wrapper.style.borderLeft = 'none';
            });

            wrapper.addEventListener('drop', e => {
                e.preventDefault();
                wrapper.style.borderLeft = 'none'; // Remove a borda

                const draggedCategoryName = e.dataTransfer.getData('text/plain');
                const targetCategoryName = wrapper.dataset.categoryName;

                const fromIndex = categoryOrder.indexOf(draggedCategoryName);
                const toIndex = categoryOrder.indexOf(targetCategoryName);

                if (fromIndex > -1 && toIndex > -1 && fromIndex !== toIndex) {
                    const [removed] = categoryOrder.splice(fromIndex, 1);
                    categoryOrder.splice(toIndex, 0, removed);
                    
                    renderCategoryTabs(); // Re-renderiza para refletir a nova ordem
                    renderMenuItems(); // Pode ser necessário re-renderizar itens se a ordem das categorias afetar a exibição
                    alert("Ordem das categorias alterada na lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
                }
            });
            wrapper.addEventListener('dragend', () => {
                wrapper.classList.remove('dragging');
                wrapper.style.borderLeft = 'none';
            });

            refs.categoryTabs.appendChild(wrapper);
        });

        refs.categoryTabs.appendChild(createTab('Ocultos', currentFilter === 'Ocultos'));
    }

    function renderMenuItems() {
        refs.menuList.innerHTML = '';

        let filtered = menuItems;
        if (currentFilter === 'Ocultos') {
            filtered = filtered.filter(i => i.hidden);
        } else if (currentFilter !== 'Todos') {
            filtered = filtered.filter(i => i.category === currentFilter && !i.hidden);
        } else {
            filtered = filtered.filter(i => !i.hidden);
        }

        if (filtered.length === 0) {
            refs.menuList.innerHTML = '<p>Nenhum item para exibir.</p>';
            return;
        }

        filtered.forEach(item => {
            // Usa o ID único ou um clone do objeto para garantir que o realIndex seja estável
            // Se você não tem um ID único, vamos trabalhar com a referência do objeto (pode ser problemático se houver objetos idênticos)
            // Uma solução mais robusta seria adicionar um ID único a cada item ao ser criado.
            // Por enquanto, vamos usar findIndex baseando-se no próprio objeto, o que funciona se eles forem referências únicas.
            const realIndex = menuItems.findIndex(i => i === item);

            const div = document.createElement('div');
            div.className = 'menu-item';
            div.draggable = true;
            div.dataset.index = realIndex; // Armazena o índice real para drag and drop

            // Drag and Drop para Itens
            div.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', realIndex); // Passa o índice do item arrastado
                div.classList.add('dragging');
            });
            div.addEventListener('dragover', e => {
                e.preventDefault();
                // Visual feedback for drop target
                if (!div.classList.contains('dragging')) { // Prevents adding to itself
                    div.classList.add('drag-over');
                }
            });
            div.addEventListener('dragleave', () => {
                div.classList.remove('drag-over');
            });
            div.addEventListener('drop', e => {
                e.preventDefault();
                div.classList.remove('drag-over');

                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const targetIndex = parseInt(div.dataset.index);

                if (draggedIndex === targetIndex) { // Avoids moving to self
                    return;
                }

                // Reorganiza o array menuItems
                const draggedItem = menuItems[draggedIndex];
                menuItems.splice(draggedIndex, 1); // Remove o item da posição original
                menuItems.splice(targetIndex, 0, draggedItem); // Insere na nova posição

                renderMenuItems(); // Re-renderiza para refletir a nova ordem
                alert("Ordem dos itens alterada na lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
            });
            div.addEventListener('dragend', () => {
                div.classList.remove('dragging');
                document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            });

            const img = document.createElement('img');
            img.src = item.image;

            const details = document.createElement('div');
            details.className = 'menu-item-details';
            details.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <p><strong>R$ ${parseFloat(item.price).toFixed(2)}</strong></p>
                <p><em>Categoria: ${item.category}</em></p>
            `;

            const buttons = document.createElement('div');
            buttons.className = 'menu-buttons';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'btn-edit';
            editBtn.addEventListener('click', () => openEditModal(realIndex));

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remover';
            removeBtn.className = 'btn-remove';
            removeBtn.addEventListener('click', () => {
                if (confirm("Tem certeza que deseja remover este item?")) {
                    menuItems.splice(realIndex, 1);
                    renderMenuItems();
                    updateCategorySelects();
                    renderCategoryTabs(); // Renderiza as abas novamente, caso uma categoria fique vazia
                    alert("Item removido da lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
                }
            });

            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = item.hidden ? 'Mostrar' : 'Ocultar';
            toggleBtn.className = 'btn-toggle';
            toggleBtn.addEventListener('click', () => {
                item.hidden = !item.hidden;
                renderMenuItems();
                alert(`Item ${item.hidden ? 'ocultado' : 'mostrado'} na lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!`);
            });

            const extraBtn = document.createElement('button');
            extraBtn.className = 'btn-extra-icon';
            extraBtn.innerHTML = `<img src="add.svg" alt="Gerenciar Adicionais" />`;
            extraBtn.addEventListener('click', () => {
                openAdicionaisModal(realIndex);
            });

            buttons.append(editBtn, removeBtn, toggleBtn);
            div.append(img, details, buttons, extraBtn);

            refs.menuList.appendChild(div);
        });
    }

    // --- Funções de Manipulação de Itens do Menu ---
    window.addItem = function () {
        const title = refs.titleInput.value.trim();
        const description = refs.descriptionInput.value.trim();
        const price = refs.priceInput.value.trim();
        const category = refs.categorySelect.value || refs.newCategoryInput.value.trim();

        if (!title || !price || !category || refs.imageInput.files.length === 0) {
            alert("Preencha todos os campos obrigatórios e selecione uma imagem.");
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            const newItem = {
                image: e.target.result,
                title,
                description,
                price: parseFloat(price).toFixed(2),
                category,
                hidden: false,
                adicionais: [] // Garante que novos itens tenham um array de adicionais vazio
            };
            menuItems.push(newItem);
            clearAddItemForm();
            renderMenuItems();
            updateCategorySelects();
            renderCategoryTabs();
            alert("Item adicionado à lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
        };
        reader.readAsDataURL(refs.imageInput.files[0]);
    };

    window.openEditModal = function (index) {
        editingIndex = index;
        const item = menuItems[index];

        refs.editModal.classList.remove('hidden');
        refs.editItemImagePreview.src = item.image;
        refs.editItemImagePreview.style.display = 'block';
        refs.editItemImage.value = ''; // Limpa o input de arquivo
        refs.editItemTitle.value = item.title;
        refs.editItemDescription.value = item.description;
        refs.editItemPrice.value = item.price;
        // Atualiza as opções do select de categoria antes de definir o valor
        updateCategorySelects();
        refs.editItemCategory.value = item.category;
    };

    window.closeEditModal = () => {
        refs.editModal.classList.add('hidden');
        editingIndex = null;
    };

    window.previewEditImage = event => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                refs.editItemImagePreview.src = e.target.result;
                refs.editItemImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    };

    window.saveEditedItem = () => {
        const title = refs.editItemTitle.value.trim();
        const description = refs.editItemDescription.value.trim();
        const price = refs.editItemPrice.value.trim();
        const category = refs.editItemCategory.value;

        if (!title || !price || !category) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const item = menuItems[editingIndex];
        item.title = title;
        item.description = description;
        item.price = parseFloat(price).toFixed(2);
        item.category = category;

        const file = refs.editItemImage.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                item.image = e.target.result;
                finalizeEdit();
            };
            reader.readAsDataURL(file);
        } else {
            finalizeEdit();
        }
    };

    function finalizeEdit() {
        renderMenuItems();
        updateCategorySelects();
        renderCategoryTabs();
        closeEditModal();
        alert("Item editado na lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
    }

    // --- Funções de Manipulação de Categorias ---
    function showContextMenu(category, anchor) {
        const old = document.getElementById('category-context-menu');
        if (old) old.remove();

        const menu = document.createElement('div');
        menu.id = 'category-context-menu';
        menu.className = 'context-menu category-context-menu';
        menu.innerHTML = `
            <div class="context-option edit" data-action="editCategory" data-category="${category}">Editar Categoria</div>
            <div class="context-option delete" data-action="deleteCategory" data-category="${category}">Excluir Categoria</div>
        `;

        document.body.appendChild(menu);
        const rect = anchor.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;

        // Adiciona event listeners aos botões do menu de contexto
        menu.querySelector('[data-action="editCategory"]').addEventListener('click', (e) => {
            const oldName = e.target.dataset.category;
            const newName = prompt("Digite o novo nome da categoria:", oldName);
            if (!newName || newName.trim() === "" || newName === oldName) {
                document.getElementById('category-context-menu')?.remove();
                return;
            }

            menuItems.forEach(item => {
                if (item.category === oldName) {
                    item.category = newName;
                }
            });
            categoryOrder = categoryOrder.map(cat => cat === oldName ? newName : cat);

            document.getElementById('category-context-menu')?.remove();
            renderCategoryTabs();
            renderMenuItems();
            updateCategorySelects();
            alert("Categoria editada na lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
        });

        menu.querySelector('[data-action="deleteCategory"]').addEventListener('click', (e) => {
            const categoryToDelete = e.target.dataset.category;
            if (!confirm(`Excluir a categoria "${categoryToDelete}" e todos os seus itens? Esta ação não pode ser desfeita sem salvar o cardápio.`)) {
                document.getElementById('category-context-menu')?.remove();
                return;
            }

            menuItems = menuItems.filter(i => i.category !== categoryToDelete);
            categoryOrder = categoryOrder.filter(c => c !== categoryToDelete);

            document.getElementById('category-context-menu')?.remove();
            renderMenuItems();
            updateCategorySelects();
            renderCategoryTabs();
            alert("Categoria removida da lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
        });

        setTimeout(() => {
            window.addEventListener('click', e => {
                if (!menu.contains(e.target) && e.target !== anchor) {
                    menu.remove();
                }
            }, { once: true }); // Remove o listener após o primeiro clique
        }, 10);
    }

    // --- Funções de Gerenciamento de Adicionais ---
    window.openAdicionaisModal = function(index) {
        currentAdicionaisItemIndex = index;
        const item = menuItems[index];
        // Garante que o array de adicionais exista
        if (!item.adicionais) {
            item.adicionais = [];
        }

        refs.adicionaisList.innerHTML = "";
        refs.adicionalNome.value = "";
        refs.adicionalPreco.value = "";
        document.getElementById("adicionalImagem").value = "";
        document.getElementById("previewImagem").src = "";
        document.getElementById("previewImagem").classList.add("hidden");

        const adicionais = item.adicionais; // Agora 'adicionais' é o array do item

        adicionais.forEach((add, i) => {
            const li = document.createElement("li");
            li.classList.add("adicional-item");
            li.setAttribute('draggable', true);
            li.dataset.adicionalIndex = i; // Guarda o índice do adicional

            li.innerHTML = `
                <div class="adicional-info">
                    ${add.imagem ? `<img src="${add.imagem}" class="adicional-thumb" alt="Imagem">` : ""}
                    <span><strong>${add.nome}</strong><br>R$ ${parseFloat(add.preco).toFixed(2)}</span>
                </div>
                <div class="adicional-actions">
                    <button class="btn-icon btn-edit" data-item-index="${index}" data-adicional-index="${i}">
                        <img src="gear.svg" alt="Editar">
                    </button>
                    <button class="btn-icon btn-remove" data-item-index="${index}" data-adicional-index="${i}">
                        <img src="trash.svg" alt="Remover">
                    </button>
                </div>
            `;
            refs.adicionaisList.appendChild(li);

            // Adiciona event listeners para os botões dentro do li
            li.querySelector('.btn-edit').addEventListener('click', (e) => {
                editarAdicional(
                    parseInt(e.currentTarget.dataset.itemIndex),
                    parseInt(e.currentTarget.dataset.adicionalIndex)
                );
            });
            li.querySelector('.btn-remove').addEventListener('click', (e) => {
                if (confirm("Tem certeza que deseja remover este adicional?")) {
                    removeAdicional(
                        parseInt(e.currentTarget.dataset.itemIndex),
                        parseInt(e.currentTarget.dataset.adicionalIndex)
                    );
                }
            });
        });

        // Drag and Drop de adicionais
        let draggedAdicionalIndex = null;

        refs.adicionaisList.querySelectorAll('.adicional-item').forEach((li, i) => {
            li.addEventListener('dragstart', () => {
                draggedAdicionalIndex = i;
                li.classList.add('dragging');
            });

            li.addEventListener('dragover', (e) => {
                e.preventDefault();
                // Visual feedback for drop target
                if (!li.classList.contains('dragging')) {
                    li.classList.add('drag-over');
                }
            });

            li.addEventListener('dragleave', () => {
                li.classList.remove('drag-over');
            });

            li.addEventListener('drop', () => {
                li.classList.remove('drag-over');

                if (draggedAdicionalIndex !== null && draggedAdicionalIndex !== i) {
                    const item = menuItems[currentAdicionaisItemIndex];
                    const moved = item.adicionais.splice(draggedAdicionalIndex, 1)[0];
                    item.adicionais.splice(i, 0, moved);
                    openAdicionaisModal(currentAdicionaisItemIndex); // atualiza visual
                    alert("Ordem dos adicionais alterada na lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
                }
                draggedAdicionalIndex = null;
            });

            li.addEventListener('dragend', () => {
                li.classList.remove('dragging');
                document.querySelectorAll('.adicional-item.drag-over').forEach(el => el.classList.remove('drag-over'));
            });
        });

        // Pré-visualização da imagem para novo adicional
        const imagemInput = document.getElementById("adicionalImagem");
        const previewImagem = document.getElementById("previewImagem");
        imagemInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImagem.src = e.target.result;
                    previewImagem.classList.remove("hidden");
                };
                reader.readAsDataURL(file);
            } else {
                previewImagem.src = "";
                previewImagem.classList.add("hidden");
            }
        });

        // Botão de adicionar adicional
        refs.salvarAdicionais.addEventListener('click', () => {
            const nome = refs.adicionalNome.value.trim();
            const preco = parseFloat(refs.adicionalPreco.value.trim());
            const imagemFile = imagemInput.files[0];
            const item = menuItems[currentAdicionaisItemIndex];

            if (!nome || isNaN(preco)) {
                alert("Preencha nome e preço válidos para o adicional!");
                return;
            }

            const adicionarAdicionalAoItem = (imagemData = "") => {
                item.adicionais.push({ nome, preco, imagem: imagemData });
                refs.adicionalNome.value = ""; // Limpa campos após adicionar
                refs.adicionalPreco.value = "";
                imagemInput.value = ""; // Limpa o input de arquivo
                previewImagem.src = ""; // Limpa a pré-visualização
                previewImagem.classList.add("hidden");
                openAdicionaisModal(currentAdicionaisItemIndex); // Re-renderiza o modal
                alert("Adicional adicionado na lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
            };

            if (imagemFile) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    adicionarAdicionalAoItem(e.target.result);
                };
                reader.readAsDataURL(imagemFile);
            } else {
                adicionarAdicionalAoItem();
            }
        });

        refs.adicionaisModal.classList.remove("hidden");
    };

    window.editarAdicional = function(indexItem, indexAdicional) {
        const item = menuItems[indexItem];
        const adicional = item.adicionais[indexAdicional];
        const li = refs.adicionaisList.children[indexAdicional];

        li.innerHTML = ''; // Limpa o li para o modo de edição

        const editandoDiv = document.createElement('div');
        editandoDiv.className = 'adicional-info editando';

        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'img-edit-wrapper';

        const imgPreview = document.createElement('img');
        imgPreview.className = 'adicional-thumb editable-img';
        imgPreview.alt = 'Imagem';
        imgPreview.src = adicional.imagem || 'placeholder.png';

        const inputFile = document.createElement('input');
        inputFile.type = 'file';
        inputFile.accept = 'image/*';
        inputFile.className = 'hidden-input';

        imgWrapper.appendChild(imgPreview);
        imgWrapper.appendChild(inputFile);
        editandoDiv.appendChild(imgWrapper);

        const editFields = document.createElement('div');
        editFields.className = 'edit-fields';

        const inputNome = document.createElement('input');
        inputNome.type = 'text';
        inputNome.className = 'edit-nome';
        inputNome.value = adicional.nome;
        inputNome.placeholder = 'Nome';

        const inputPreco = document.createElement('input');
        inputPreco.type = 'number';
        inputPreco.className = 'edit-preco';
        inputPreco.value = adicional.preco;
        inputPreco.step = '0.01';
        inputPreco.placeholder = 'Preço';

        editFields.appendChild(inputNome);
        editFields.appendChild(inputPreco);
        editandoDiv.appendChild(editFields);

        li.appendChild(editandoDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'adicional-actions';

        const btnSalvar = document.createElement('button');
        btnSalvar.className = 'btn-save';
        btnSalvar.title = 'Salvar edição';
        btnSalvar.textContent = 'Salvar';

        actionsDiv.appendChild(btnSalvar);
        li.appendChild(actionsDiv);

        btnSalvar.addEventListener('click', () => {
            const novoNome = inputNome.value.trim();
            const novoPreco = parseFloat(inputPreco.value.trim());

            if (!novoNome || isNaN(novoPreco)) {
                alert("Preencha nome e preço válidos para o adicional!");
                return;
            }

            adicional.nome = novoNome;
            adicional.preco = novoPreco;
            // A imagem já foi atualizada pelo listener do inputFile

            openAdicionaisModal(indexItem); // Re-renderiza o modal para sair do modo edição
            alert("Adicional editado na lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
        });

        imgPreview.addEventListener('click', () => inputFile.click());

        inputFile.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                imgPreview.src = e.target.result;
                adicional.imagem = e.target.result; // Atualiza a imagem diretamente no objeto adicional
            };
            reader.readAsDataURL(file);
        });
    };

    window.removeAdicional = function(indexItem, indexAdicional) {
        const item = menuItems[indexItem];
        if (item.adicionais) {
            item.adicionais.splice(indexAdicional, 1);
            openAdicionaisModal(indexItem);
            alert("Adicional removido da lista. Clique em 'Salvar Cardápio' para aplicar as mudanças!");
        }
    };

    // --- Inicialização ---
    renderMenuItems();
    renderCategoryTabs();
    updateCategorySelects();

    // --- Event Listeners Globais ---

    // Centraliza o salvamento no botão "Salvar Cardápio"
    refs.saveMenuBtn.addEventListener('click', saveState);

    // Fechar modais ao clicar no botão de fechar (X)
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.add('hidden');
            // Fechar o modal de edição especificamente
            if (btn.closest('.modal') === refs.editModal) {
                closeEditModal();
            }
            // Se for o modal de adicionais
            if (btn.closest('.modal') === refs.adicionaisModal) {
                 // Nenhuma ação extra necessária, openAdicionaisModal já cuida do estado
            }
        });
    });

    // Fechar o modal de adicionais ao clicar fora
    window.addEventListener('click', function(event) {
        const modalAdicionais = refs.adicionaisModal;
        const modalEdicao = refs.editModal;

        if (event.target === modalAdicionais) {
            modalAdicionais.classList.add('hidden');
        }
        if (event.target === modalEdicao) {
            closeEditModal(); // Reutiliza a função que já limpa o editingIndex
        }
    });

    // Preview da imagem ao selecionar o arquivo no formulário de adicionar (item principal)
    refs.imageInput.addEventListener('change', () => {
        const file = refs.imageInput.files[0];
        const preview = document.getElementById('imagePreview');
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
    refs.saveMenuBtn.addEventListener('click', saveState);

    // Fechar modais ao clicar no botão de fechar (X)
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            const modalToClose = document.getElementById(modalId);
            if (modalToClose) {
                closeModal(modalToClose);
                // Lógica adicional de fechamento se necessário
                if (modalToClose === refs.editModal) {
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
        if (event.target === refs.editModal) {
            closeModal(refs.editModal);
        }
        if (event.target === refs.adicionaisModal) {
            closeModal(refs.adicionaisModal);
        }
        if (event.target === refs.notificationModal) { // Adicionado para fechar o modal de notificação
            closeModal(refs.notificationModal);
        }
    });

    // Preview da imagem ao selecionar o arquivo no formulário de adicionar (item principal)
    refs.imageInput.addEventListener('change', () => {
        const file = refs.imageInput.files[0];
        const preview = document.getElementById('imagePreview');
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
    renderMenuItems();
    renderCategoryTabs();
    updateCategorySelects();
    // Se você quiser iniciar a notificação automaticamente ao carregar a página
    // startNotification(); // Descomente se quiser iniciar automaticamente
});