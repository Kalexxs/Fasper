const $ = (id) => document.getElementById(id);
const ler = (chave, padrao = {}) => JSON.parse(localStorage.getItem(chave) || JSON.stringify(padrao));
const gravar = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));
const baixarArquivo = (nome, texto) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([texto], { type: 'application/vnd.ms-excel' }));
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const criarXls = (cabecalhos, linhas) => {
  const linhasHtml = linhas.map((linha) => `<tr>${linha.map((valor) => `<td>${String(valor ?? '')}</td>`).join('')}</tr>`).join('');
  return `
    <html>
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          <tr>${cabecalhos.map((item) => `<th>${item}</th>`).join('')}</tr>
          ${linhasHtml}
        </table>
      </body>
    </html>
  `;
};

const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const gerarId = (prefixo = 'ID') => `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const normalizarTexto = (texto) => String(texto || '').trim().toLowerCase();
const obterProdutos = () => ler('produtos', []);
const salvarProdutos = (produtos) => gravar('produtos', produtos);
const obterCarrinho = () => ler('carrinho', []);
const salvarCarrinho = (carrinho) => gravar('carrinho', carrinho);
const obterPedidos = () => ler('pedidos', []);
const salvarPedidos = (pedidos) => gravar('pedidos', pedidos);

function mostrarMensagem(idElemento, texto, erro = false) {
  const elemento = $(idElemento);
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.classList.toggle('msg-error', erro);
}

// Atividade 3 do cronograma: atualiza o contador visual de itens no carrinho
function atualizarIndicadorCarrinho() {
  const carrinho = obterCarrinho();
  const totalItens = carrinho.reduce((soma, item) => soma + Number(item.quantidade || 0), 0);
  document.querySelectorAll('[data-cart-count]').forEach((elemento) => {
    elemento.textContent = String(totalItens);
  });
}

function validarFotos(files) {
  if (!files || files.length < 2) {
    return 'Campo é obrigatório. Selecione no mínimo 2 fotos do produto.';
  }

  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      return `A foto ${file.name} ultrapassa o limite de 5MB.`;
    }
  }

  return '';
}

function lerArquivoComoBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Erro ao ler o arquivo ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

async function converterFotos(files) {
  const fotos = [];
  for (const file of files) {
    const base64 = await lerArquivoComoBase64(file);
    fotos.push({
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
      dados: base64
    });
  }
  return fotos;
}

function renderizarPreviewFotos(files) {
  const preview = $('previewFotos');
  const lista = $('listaArquivosSelecionados');
  if (!preview) return;

  preview.innerHTML = '';
  if (lista) lista.innerHTML = '';

  Array.from(files || []).forEach((file, indice) => {
    const url = URL.createObjectURL(file);
    const card = document.createElement('div');
    card.className = 'preview-card';
    card.innerHTML = `
      <img src="${url}" alt="Prévia da foto do produto">
      <p>${file.name}</p>
    `;
    preview.appendChild(card);

    if (lista) {
      const item = document.createElement('div');
      item.className = 'selected-file-item';
      item.innerHTML = `
        <span>${indice + 1}. ${file.name}</span>
        <button type="button" class="btn-remove-file" data-index="${indice}">Remover</button>
      `;
      lista.appendChild(item);
    }
  });
}

function exportarUsuarios() {
  const usuario = ler('usuario', {});
  baixarArquivo(
    'usuarios.xls',
    criarXls(['Nome', 'E-mail', 'Senha', 'Tipo', 'Observação'], [[usuario.nome, usuario.email, usuario.senha, usuario.tipo, usuario.observacao]])
  );
}

function exportarVendedor() {
  const vendedor = ler('vendedor', {});
  baixarArquivo(
    'vendedores.xls',
    criarXls(['Loja', 'Contato', 'Imagem', 'Descrição'], [[vendedor.loja, vendedor.contato, vendedor.imagem, vendedor.descricao]])
  );
}

// Atividade 2 do cronograma: exportação dos produtos para Excel
function exportarProdutos() {
  const produtos = obterProdutos();
  const linhas = produtos.map((produto) => [
    produto.id,
    produto.nome,
    produto.preco,
    produto.categoria,
    produto.avaliacao,
    produto.descricao,
    produto.quantidadeFotos,
    produto.criadoEm
  ]);

  baixarArquivo(
    'produtos.xls',
    criarXls(['ID', 'Nome', 'Preço', 'Categoria', 'Avaliação', 'Descrição', 'Qtd. fotos', 'Criado em'], linhas)
  );
}

// Atividade 3 do cronograma: exportação dos pedidos para Excel
function exportarPedidos() {
  const pedidos = obterPedidos();
  const linhas = pedidos.map((pedido) => [
    pedido.numero,
    pedido.cliente,
    pedido.contato,
    pedido.endereco,
    pedido.formaPagamento,
    pedido.totalItens,
    pedido.valorTotal,
    pedido.criadoEm
  ]);

  baixarArquivo(
    'pedidos.xls',
    criarXls(['Pedido', 'Cliente', 'Contato', 'Endereço', 'Pagamento', 'Itens', 'Valor total', 'Data'], linhas)
  );
}

// Atividade 3 do cronograma: RF5 adicionar produto ao carrinho
function adicionarAoCarrinho(produto) {
  const carrinho = obterCarrinho();
  const existente = carrinho.find((item) => item.id === produto.id);

  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: Number(produto.preco || 0),
      foto: produto.fotos?.[0]?.dados || '',
      quantidade: 1
    });
  }

  salvarCarrinho(carrinho);
  atualizarIndicadorCarrinho();
}

// Atividade 3 do cronograma: RF5 remover item do carrinho
function removerDoCarrinho(idProduto) {
  const carrinho = obterCarrinho().filter((item) => item.id !== idProduto);
  salvarCarrinho(carrinho);
  atualizarIndicadorCarrinho();
}

// Atividade 3 do cronograma: RF5 atualização de quantidade no carrinho
function atualizarQuantidadeCarrinho(idProduto, quantidade) {
  const carrinho = obterCarrinho();
  const item = carrinho.find((registro) => registro.id === idProduto);
  if (!item) return;

  if (quantidade <= 0) {
    removerDoCarrinho(idProduto);
    return;
  }

  item.quantidade = quantidade;
  salvarCarrinho(carrinho);
  atualizarIndicadorCarrinho();
}

// Atividade 3 do cronograma: cálculo de total de itens e valor total
function obterResumoCarrinho() {
  const carrinho = obterCarrinho();
  const totalItens = carrinho.reduce((soma, item) => soma + Number(item.quantidade || 0), 0);
  const valorTotal = carrinho.reduce((soma, item) => soma + (Number(item.preco || 0) * Number(item.quantidade || 0)), 0);
  return { carrinho, totalItens, valorTotal };
}

function preencherResumo() {
  const usuario = ler('usuario', {});
  const vendedor = ler('vendedor', {});
  const produtos = obterProdutos();
  const pedidos = obterPedidos();

  ['nome', 'email', 'tipo'].forEach((campo) => {
    const elemento = $(`r_${campo}`);
    if (elemento) elemento.textContent = usuario[campo] || '-';
  });

  ['loja', 'contato', 'descricao'].forEach((campo) => {
    const elemento = $(`r_${campo}`);
    if (elemento) elemento.textContent = vendedor[campo] || '-';
  });

  if ($('r_total_produtos')) $('r_total_produtos').textContent = String(produtos.length);
  if ($('r_ultimo_produto')) $('r_ultimo_produto').textContent = produtos.length ? produtos[produtos.length - 1].nome : '-';
  if ($('r_total_pedidos')) $('r_total_pedidos').textContent = String(pedidos.length);
  if ($('r_ultimo_pedido')) $('r_ultimo_pedido').textContent = pedidos.length ? pedidos[pedidos.length - 1].numero : '-';
}

// Atividade 2 do cronograma: cadastro de produtos com fotos e exportação
async function configurarCadastroProduto() {
  const form = $('produtoForm');
  const inputFotos = $('produtoFotos');
  const btnExportar = $('btnExportarProdutos');

  btnExportar?.addEventListener('click', exportarProdutos);

  if (!form || !inputFotos) return;

  let arquivosSelecionados = [];

  function atualizarInterfaceFotos() {
    renderizarPreviewFotos(arquivosSelecionados);

    const lista = $('listaArquivosSelecionados');
    if (lista) {
      lista.querySelectorAll('.btn-remove-file').forEach((botao) => {
        botao.addEventListener('click', () => {
          const indice = Number(botao.dataset.index);
          arquivosSelecionados.splice(indice, 1);
          atualizarInterfaceFotos();
        });
      });
    }
  }

  inputFotos.addEventListener('change', () => {
    const novosArquivos = Array.from(inputFotos.files || []);

    novosArquivos.forEach((arquivo) => {
      const jaExiste = arquivosSelecionados.some((item) => (
        item.name === arquivo.name && item.size === arquivo.size && item.lastModified === arquivo.lastModified
      ));

      if (!jaExiste) {
        arquivosSelecionados.push(arquivo);
      }
    });

    inputFotos.value = '';
    atualizarInterfaceFotos();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = $('produtoNome').value.trim();
    const preco = Number(String($('produtoPreco').value).replace(',', '.'));
    const categoria = $('produtoCategoria').value.trim();
    const avaliacao = Number($('produtoAvaliacao').value || 0);
    const descricao = $('produtoDescricao').value.trim();
    const files = Array.from(arquivosSelecionados || []);

    if (!nome || !categoria || !preco || preco <= 0) {
      mostrarMensagem('msgProduto', 'Campo é obrigatório. Preencha nome, preço e categoria corretamente.', true);
      return;
    }

    const erroFotos = validarFotos(files);
    if (erroFotos) {
      mostrarMensagem('msgProduto', erroFotos, true);
      return;
    }

    try {
      const fotos = await converterFotos(files);
      const produtos = obterProdutos();

      produtos.push({
        id: gerarId('PROD'),
        nome,
        preco,
        categoria,
        descricao,
        avaliacao,
        quantidadeFotos: fotos.length,
        fotos,
        criadoEm: new Date().toLocaleString('pt-BR')
      });

      salvarProdutos(produtos);
      form.reset();
      arquivosSelecionados = [];
      atualizarInterfaceFotos();
      mostrarMensagem('msgProduto', 'Produto cadastrado com sucesso.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => mostrarMensagem('msgProduto', ''), 4000);
    } catch (erro) {
      mostrarMensagem('msgProduto', 'Não foi possível salvar as fotos do produto.', true);
      console.error(erro);
    }
  });
}

// Atividade 2 e 3 do cronograma: listagem de produtos com botão para adicionar ao carrinho
function configurarListaProdutos() {
  const tabelaBody = $('tabelaProdutosBody');
  if (!tabelaBody) return;

  const botaoFiltrar = $('btnFiltrarProdutos');
  const botaoLimpar = $('btnLimparFiltros');
  const modal = $('modalImagens');
  const modalTitulo = $('modalTituloProduto');
  const btnExportar = $('btnExportarProdutosLista');
  if (modal) modal.hidden = true;
  const modalImagemPrincipal = $('modalImagemPrincipal');
  const modalMiniaturas = $('modalMiniaturas');
  const botaoFecharModal = $('btnFecharModalImagens');

  btnExportar?.addEventListener('click', exportarProdutos);

  function obterFiltros() {
    return {
      busca: normalizarTexto($('filtroBusca')?.value),
      precoMax: Number(String($('filtroPrecoMax')?.value || '').replace(',', '.')) || 0,
      avaliacao: Number($('filtroAvaliacao')?.value || 0)
    };
  }

  function filtrarProdutos() {
    const filtros = obterFiltros();
    const produtos = obterProdutos();

    return produtos.filter((produto) => {
      const nomeOk = !filtros.busca || normalizarTexto(produto.nome).includes(filtros.busca);
      const precoOk = !filtros.precoMax || Number(produto.preco) <= filtros.precoMax;
      const avaliacaoOk = !filtros.avaliacao || Number(produto.avaliacao) >= filtros.avaliacao;
      return nomeOk && precoOk && avaliacaoOk;
    });
  }

  function abrirModalImagens(produto) {
    if (!modal) return;

    modal.hidden = false;
    modalTitulo.textContent = produto.nome;

    const fotos = Array.isArray(produto.fotos) ? produto.fotos : [];
    const fotoInicial = fotos[0]?.dados || '';

    modalImagemPrincipal.innerHTML = fotoInicial
      ? `<img src="${fotoInicial}" alt="Imagem principal do produto ${produto.nome}">`
      : '<div class="modal-image-empty">Sem imagem cadastrada.</div>';

    modalMiniaturas.innerHTML = '';

    fotos.forEach((foto, indice) => {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = `thumb-button ${indice === 0 ? 'active' : ''}`;
      botao.innerHTML = `<img src="${foto.dados}" alt="Miniatura ${indice + 1} do produto ${produto.nome}">`;
      botao.addEventListener('click', () => {
        modalImagemPrincipal.innerHTML = `<img src="${foto.dados}" alt="Imagem ${indice + 1} do produto ${produto.nome}">`;
        modalMiniaturas.querySelectorAll('.thumb-button').forEach((item) => item.classList.remove('active'));
        botao.classList.add('active');
      });
      modalMiniaturas.appendChild(botao);
    });
  }

  function fecharModalImagens() {
    if (!modal) return;
    modal.hidden = true;
  }

  function renderizarTabela(produtosFiltrados) {
    tabelaBody.innerHTML = '';

    produtosFiltrados.forEach((produto) => {
      const fotoPrincipal = produto.fotos?.[0]?.dados || '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="product-name-cell">
            <strong>${produto.nome}</strong>
          </div>
        </td>
        <td>${formatarMoeda(produto.preco)}</td>
        <td>${produto.descricao || '-'}</td>
        <td>${Number(produto.avaliacao || 0)}</td>
        <td>
          <button class="photo-thumb-button" type="button" aria-label="Abrir imagens do produto ${produto.nome}">
            ${fotoPrincipal ? `<img src="${fotoPrincipal}" alt="Miniatura do produto ${produto.nome}" class="table-photo-thumb">` : '<span class="table-photo-empty">Sem foto</span>'}
          </button>
        </td>
        <td>
          <div class="table-actions-wrap">
            <button class="btn btn-secondary btn-small" type="button">Ver imagem</button>
            <button class="btn btn-primary btn-small btn-add-cart" type="button">Adicionar</button>
          </div>
        </td>
      `;

      tr.querySelector('.photo-thumb-button').addEventListener('click', () => abrirModalImagens(produto));
      tr.querySelector('.btn-secondary').addEventListener('click', () => abrirModalImagens(produto));
      tr.querySelector('.btn-add-cart').addEventListener('click', () => {
        adicionarAoCarrinho(produto);
        mostrarMensagem('msgListaProdutos', `Produto ${produto.nome} adicionado ao carrinho.`);
        setTimeout(() => mostrarMensagem('msgListaProdutos', ''), 2500);
      });
      tabelaBody.appendChild(tr);
    });

    if (!produtosFiltrados.length) {
      tabelaBody.innerHTML = '<tr><td colspan="6" class="table-empty">Nenhum produto encontrado.</td></tr>';
    }
  }

  function renderizar() {
    const produtosFiltrados = filtrarProdutos();
    $('listaVazia').hidden = produtosFiltrados.length !== 0;
    renderizarTabela(produtosFiltrados);
  }

  botaoFiltrar?.addEventListener('click', renderizar);
  botaoLimpar?.addEventListener('click', () => {
    ['filtroBusca', 'filtroPrecoMax', 'filtroAvaliacao'].forEach((id) => {
      if ($(id)) $(id).value = '';
    });
    renderizar();
  });

  $('filtroBusca')?.addEventListener('input', renderizar);
  $('filtroPrecoMax')?.addEventListener('input', renderizar);
  $('filtroAvaliacao')?.addEventListener('change', renderizar);

  botaoFecharModal?.addEventListener('click', fecharModalImagens);
  modal?.addEventListener('click', (event) => {
    if (event.target.dataset.closeModal === 'true') fecharModalImagens();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.hidden) fecharModalImagens();
  });

  renderizar();
}

// Atividade 3 do cronograma: RF5 tela do carrinho de compras
function configurarCarrinho() {
  const tabelaBody = $('tabelaCarrinhoBody');
  if (!tabelaBody) return;

  function renderizarCarrinho() {
    const { carrinho, totalItens, valorTotal } = obterResumoCarrinho();
    tabelaBody.innerHTML = '';

    if (!carrinho.length) {
      tabelaBody.innerHTML = '<tr><td colspan="5" class="table-empty">Seu carrinho está vazio.</td></tr>';
    }

    carrinho.forEach((item) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="cart-product-cell">
            ${item.foto ? `<img src="${item.foto}" alt="Foto do produto ${item.nome}" class="cart-thumb">` : '<div class="cart-thumb cart-thumb-empty">Sem foto</div>'}
            <div>
              <strong>${item.nome}</strong>
              <div class="cart-id">${item.id}</div>
            </div>
          </div>
        </td>
        <td>${formatarMoeda(item.preco)}</td>
        <td>
          <input class="cart-qty-input" type="number" min="1" value="${item.quantidade}" data-id="${item.id}">
        </td>
        <td>${formatarMoeda(Number(item.preco || 0) * Number(item.quantidade || 0))}</td>
        <td><button type="button" class="btn btn-secondary btn-small" data-remove="${item.id}">Remover</button></td>
      `;
      tabelaBody.appendChild(tr);
    });

    if ($('cartTotalItens')) $('cartTotalItens').textContent = String(totalItens);
    if ($('cartValorTotal')) $('cartValorTotal').textContent = formatarMoeda(valorTotal);
    if ($('cartResumoItens')) $('cartResumoItens').textContent = String(totalItens);
    if ($('cartResumoTotal')) $('cartResumoTotal').textContent = formatarMoeda(valorTotal);
    if ($('btnIrPedido')) $('btnIrPedido').classList.toggle('btn-disabled', !carrinho.length);

    tabelaBody.querySelectorAll('[data-remove]').forEach((botao) => {
      botao.addEventListener('click', () => {
        removerDoCarrinho(botao.dataset.remove);
        renderizarCarrinho();
      });
    });

    tabelaBody.querySelectorAll('.cart-qty-input').forEach((input) => {
      input.addEventListener('change', () => {
        const quantidade = Math.max(1, Number(input.value || 1));
        atualizarQuantidadeCarrinho(input.dataset.id, quantidade);
        renderizarCarrinho();
      });
    });
  }

  $('btnLimparCarrinho')?.addEventListener('click', () => {
    salvarCarrinho([]);
    atualizarIndicadorCarrinho();
    renderizarCarrinho();
  });

  $('btnIrPedido')?.addEventListener('click', () => {
    const { carrinho } = obterResumoCarrinho();
    if (!carrinho.length) {
      mostrarMensagem('msgCarrinho', 'Adicione pelo menos um produto ao carrinho.', true);
      return;
    }
    location.href = 'pedido.html';
  });

  renderizarCarrinho();
}

// Atividade 3 do cronograma: RF6 tela de finalização do pedido
function configurarPedido() {
  const form = $('pedidoForm');
  if (!form) return;

  const btnExportar = $('btnExportarPedidos');
  btnExportar?.addEventListener('click', exportarPedidos);

  const { carrinho, totalItens, valorTotal } = obterResumoCarrinho();
  const resumoLista = $('pedidoResumoLista');
  if (resumoLista) {
    resumoLista.innerHTML = '';
    carrinho.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.nome} x ${item.quantidade}</span><strong>${formatarMoeda(Number(item.preco || 0) * Number(item.quantidade || 0))}</strong>`;
      resumoLista.appendChild(li);
    });
  }

  if ($('pedidoResumoItens')) $('pedidoResumoItens').textContent = String(totalItens);
  if ($('pedidoResumoTotal')) $('pedidoResumoTotal').textContent = formatarMoeda(valorTotal);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const { carrinho: carrinhoAtual, totalItens: totalAtual, valorTotal: valorAtual } = obterResumoCarrinho();
    if (!carrinhoAtual.length) {
      mostrarMensagem('msgPedido', 'O carrinho está vazio. Adicione produtos antes de finalizar o pedido.', true);
      return;
    }

    const cliente = $('pedidoCliente').value.trim();
    const contato = $('pedidoContato').value.trim();
    const endereco = $('pedidoEndereco').value.trim();
    const formaPagamento = $('pedidoPagamento').value;
    const observacao = $('pedidoObservacao').value.trim();

    if (!cliente || !contato || !endereco) {
      mostrarMensagem('msgPedido', 'Preencha nome, contato e endereço para finalizar o pedido.', true);
      return;
    }

    const pedidos = obterPedidos();
    const numero = `PED-${new Date().getFullYear()}-${String(pedidos.length + 1).padStart(3, '0')}`;

    pedidos.push({
      id: gerarId('PED'),
      numero,
      cliente,
      contato,
      endereco,
      formaPagamento,
      observacao,
      itens: carrinhoAtual,
      totalItens: totalAtual,
      valorTotal: valorAtual,
      criadoEm: new Date().toLocaleString('pt-BR')
    });

    salvarPedidos(pedidos);
    salvarCarrinho([]);
    atualizarIndicadorCarrinho();
    form.reset();
    mostrarMensagem('msgPedido', `Pedido ${numero} finalizado com sucesso.`);
    setTimeout(() => {
      location.href = 'resumo.html';
    }, 1500);
  });
}

function configurarCadastroUsuario() {
  const form = $('cadastroForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const dados = {
      nome: $('nome').value,
      email: $('email').value,
      senha: $('senha').value,
      tipo: $('tipo').value,
      observacao: $('observacao').value
    };

    gravar('usuario', dados);
    exportarUsuarios();
    location.href = 'vendedor.html';
  });
}

function configurarVendedor() {
  const form = $('vendedorForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const dados = {
      loja: $('loja').value,
      contato: $('contato').value,
      imagem: $('imagem').value,
      descricao: $('descricao').value
    };

    gravar('vendedor', dados);
    exportarVendedor();
    location.href = 'resumo.html';
  });
}

// Inicialização geral das telas das entregas 1, 2 e 3 do cronograma
document.addEventListener('DOMContentLoaded', () => {
  const pagina = location.pathname.split('/').pop() || 'index.html';

  atualizarIndicadorCarrinho();

  if (pagina === 'cadastro.html') configurarCadastroUsuario();
  if (pagina === 'vendedor.html') configurarVendedor();
  if (pagina === 'resumo.html') preencherResumo();
  if (pagina === 'produtos.html') configurarCadastroProduto();
  if (pagina === 'lista-produtos.html') configurarListaProdutos();
  if (pagina === 'carrinho.html') configurarCarrinho();
  if (pagina === 'pedido.html') configurarPedido();
});
