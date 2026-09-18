async function esperar(millisegundos) {
    return new Promise(resolve => {
        setTimeout(resolve, millisegundos);
    })
}

function carregarFiltro() {
    const botoesFiltro = document.querySelectorAll("#filtro button")

    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", function () {
            const filtro = botao.dataset.filtro;

            const pratos = document.querySelectorAll(".prato");
            pratos.forEach(prato => {
                const categoria = prato.dataset.categoria;
                if (filtro == "todos" || categoria == filtro) {
                    prato.classList.remove('d-none');
                } else {
                    prato.classList.add('d-none');
                }
            });
        });
    })
}

async function apagarProduto(id) {
    const elementoBotaoCancelar = document.querySelector("#apagarProdutoModalCancelar");
    const elementoBotaoConfirmar = document.querySelector("#apagarProdutoModalConfirmar");
    const elementoBotaoImagemRecarregar = document.querySelector("#elementoBotaoImagemRecarregar");

    elementoBotaoCancelar.hidden = true;
    elementoBotaoConfirmar.hidden = true;
    elementoBotaoImagemRecarregar.hidden = false;

    try {
        const result = await fetch(`http://localhost:8080/produtos/${id}`, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json'
            }
        });
        if (result.status != 204) {
            const resultado = await result.json();
            alert(resultado.erro);
            return;
        }
    } catch (error) {
        console.log(error);
    }

    elementoBotaoCancelar.hidden = false;
    elementoBotaoConfirmar.hidden = false;
    elementoBotaoImagemRecarregar.hidden = true;
    elementoBotaoCancelar.click();
    carregarCardapio();
}}

function popularApagarProdutoModal(id, nome) {
    const elementoTitulo = document.querySelector("#apagarProdutoModalLabel");
    elementoTitulo.textContent = `Apagar ${nome}`;
    const elementoCorpo = document.querySelector("#apagarProdutoModalCorpo");
    elementoCorpo.textContent = 'Você tem certeza que quer remover o produto ${nome} do cardápio?'
    const elementoBotao = document.querySelector("#apagarProdutoModalBotao");
    elementoBotao.addEventListener("click", () => { apagarProduto(id) });
}

async function carregarCardapio() {
    let cardapio;
    let cardapioHTML = "";
    const elementoCardapio = document.querySelector("#cardapio");
    elementoCardapio.innerHTML = '<img class="reload-img" src="/public/images/reload.gif" alt="Recarregar"/>';

    await esperar(250);

    try {
        const chamada = await fetch("http://localhost:8080/produtos");
        if (!chamada.ok) {
            throw new Error(`Response status: ${chamada.status}`);
        }

        cardapio = await chamada.json();

        cardapio.forEach((item) => {
            cardapioHTML = cardapioHTML + `<div class="col-md-3 col-md-6 col-sm-12 mb-4 h-100 prato" data-categoria="${item.categoria}">
                <div class="border rounded p-3 h-100 d-flex flex-column">
                    <div>
                        <div class="d-flex justify-content-between align-items-end">
                            <h5>${item.nome}</h5>
                            <div class="d-flex gap-2">
                                <button type="button" onclick="mostrarCadastroProduto(${JSON.stringify(item)})" class="btn btn-outline-light pv-1 ph-2 m-0">
                                    <img height="20px" width="20px" width="20px" src="public/images/editar.webp"/>
                                </button>
                                <button type="button" class="btn btn-outline-light pv-1 ph-2 m-0" data-bs-toggle="modal" data-bs-target="#apagarProdutoModal" onClick="popularApagarProdutoModal('${item.id}', '${item.nome}')">
                                    <img height="20px" width="20px" src="public/images/apagar.webp"/>
                                </button>
                            </div>
                        </div>
                        <p class="mt-2 text-muted small">${item.descricao}</p>
                    </div>
                    <p class="mt-auto mb-0 pt-3">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}</p>
                </div>
            </div>
            `
        })
    } catch (error) {
        cardapioHTML = `
            <div class="d-flex align-items-center gap-3 text-danger">
                <p class="m-0"><b>Houve um erro ao buscar o cardápio!</b></p>
                <button type="button" class="btn btn-outline-primary" onClick="carregarCardapio()">
                    <img src="/public/images/reload.png" alt="Recarregar" width="24"/> Recarregar 
                </button>
            </div>
        `;

        console.log("Houve um erro ao buscar os dados, tente novamente mais tarde", error);
    }

    elementoCardapio.innerHTML = cardapioHTML;
}

function mostrarCadastroProdutos(produto = null) {
    let cardapioHTML = "";
    const elementoCardapio = document.querySelector("#cardapio");
    elementoCardapio.innerHTML = `
        <div class="mb-3">
            <label for="nome-produto" class="form-label">Nome do produto:</label>
            <input type="text" id="nome-produto" name="nome-produto" class="form-control">
        </div>

        <div class="mb-3">
            <label for="descricao-produto" class="form-label">Descrição do produto:</label>
            <input type="text" id="descricao-produto" name="descricao-produto" class="form-control">
        </div>

        <div class="mb-3">
            <label for="categoria" class="form-label">Categoria:</label>
            <select id="categoria" name="categoria" class="form-select">
                <option value="">Selecione uma categoria</option>
                <option value="massa">massa</option>
                <option value="pizza">pizza</option>
                <option value="entrada">entrada</option>
                <option value="bebida">bebida</option>
                <option value="sobremesa">sobremesa</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="preco" class="form-label">Preço:</label>
            <input type="number" id="preco" name="preco" class="form-control">
        </div>

        <div class="mb-3" id="box-error-cadastro-produto">
        </div>

        <div class="d-flex">
            ${produto != null ?
            '<button class="btn btn-primary" onClick="editarProduto('${ produto.id } ')">Editar</button> ':
    '<button class="btn btn-primary" onClick="cadastrarProduto()">Cadastrar</button>'
}
<button class="btn btn-secondary ms-2" onClick="carregarCardapio()">Cancelar</button>
        </div >
    `;
}

async function cadastrarProduto() {
    const validacao = validarProduto();

    if (validacao.contagemErro > 0){
        return;
    }

    const produto = validacao.produto;

    try {
        const result = await fetch("http://localhost:8080/produtos", {
            method: "POST",
            body: JSON.stringify(produto),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                }
        });
        if (result.status != 201) {
            const resultado = await result.json();
            elementoBoxErro.innerHTML = `< p class="text-danger" > ${ resultado.erro }</p > `}
            return;
        }
        carregarCardapio();
    } catch (error) {
        console.log(error);
    }
}  

async function editarProduto(id) {
    const validacao = validarProduto();

    if (validacao.contagemErro > 0){
        return;
    }

    const produto = validacao.produto;

    try {
        const result = await fetch(`http://localhost:8080/produtos/${id}`, {
            method: "PUT",
            body: JSON.stringify(produto),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                }
        });
        if (result.status != 201) {
            const resultado = await result.json();
            elementoBoxErro.innerHTML = `< p class="text-danger" > ${ resultado.erro }</p > `}
            return;
        }
        carregarCardapio();
    } catch (error) {
        console.log(error);
    }
}
function validarProduto() {
    const elementoBoxErro = document.querySelector("#box-error-cadastro-produto");
    elementoBoxErro.innerHTML = "";
    let contagemErro = 0;
                
    const elementoBoxErro = document.querySelector("#box-error-cadastro-produto");
    elementoBoxErro.innerHTML = "";
    let contagemErro = 0;

    const elementoNomeProduto = document.querySelector("#nome-produto");
    let nomeProduto = elementoNomeProduto.value;
    nomeProduto = nomeProduto.trim();
    if (nomeProduto == "") {
        elementoBoxErro.innerHTML += `< p class="text-danger" > Nome não pode ser vazio!</p > `;
        contagemErro++;
    }

    const elementoDescricaoProduto = document.querySelector("#descricao-produto");
    let descricaoProduto = elementoDescricaoProduto.value;
    descricaoProduto = descricaoProduto.trim();
    if (descricaoProduto == "") {
        elementoBoxErro.innerHTML += `< p class="text-danger" > Descrição não pode ser vazia!</p > `;
        contagemErro++;
    }

    const elementoCategoriaProduto = document.querySelector("#categoria");
    let categoriaProduto = elementoCategoriaProduto.value;
    categoriaProduto = categoriaProduto.trim();
    if (categoriaProduto == "") {
        elementoBoxErro.innerHTML += `< p class="text-danger" > Categoria não pode ser vazio!</p > `;
        contagemErro++;
    }

    const elementoPreco = document.querySelector("#preco");
    let preco = elementoPreco.value;
    preco = Number(preco)
    if (preco <= 0) {
        elementoBoxErro.innerHTML += `< p class="text-danger" > Preço inválido!</p > `;
        contagemErro++;
    }

    return {
        contagemErro: contagemErro,
        produto: {
            nome: nomeProduto,
            descricao: descricaoProduto,
            categoria: categoriaProduto,
            preco: preco
        }
    };
}