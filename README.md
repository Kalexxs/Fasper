# FASPER Projeto Empreendedor II
# Unidade 1, 2 

Abra `frontend/index.html` no navegador.

## Entregas implementadas
- RF1 Registro de usuários
- RF2 Perfil do vendedor
- RF3 Cadastro de produtos
- RF4 Listagem de produtos
- RF5 Carrinho de compras
- RF6 Realizar pedido
- RF7 Mensagens
- RF8 Avaliação de produto
- RF9 Histórico de compras
- RF10 Login/autenticação
- RF11 Busca de produtos

## Persistência usada nesta etapa
Os dados continuam em `localStorage` e os botões de salvar/exportar geram arquivos Excel (`.xls`).

## Atividade 2 do cronograma
Foram adicionadas as telas:
- `frontend/produtos.html`
- `frontend/lista-produtos.html`

Também foram adicionados comentários no código para identificar a Atividade 2 do cronograma.

## Atividade 3 do cronograma
Foram adicionadas as telas:
- `frontend/carrinho.html`
- `frontend/pedido.html`

Também foram adicionadas as funcionalidades:
- adicionar produto ao carrinho
- alterar quantidade
- remover item do carrinho
- finalizar pedido
- exportar pedidos em Excel

## Atividade 4 do cronograma
Foram adicionadas as telas:
- `frontend/historico.html`
- `frontend/avaliacoes.html`
- `frontend/mensagens.html`

Também foram adicionadas as funcionalidades:
- consultar histórico de compras
- registrar avaliação de produto
- atualizar a média de avaliação do produto
- enviar mensagens entre comprador e vendedor
- exportar histórico, avaliações e mensagens em Excel

## Atividade 5 do cronograma (Projeto Empreendedor 2 - Unidade 1)
Foram adicionadas as funcionalidades:

RF10 - Login/Autenticação:
- Tela de login com validação de e-mail e senha
- Redirecionamento conforme tipo de usuário (comprador/vendedor)
- Controle de sessão com sessionStorage
- Proteção de rotas (páginas exigem login)
- Botão de sair

RF11 - Busca de produtos:
- Barra de busca na listagem de produtos
- Filtro em tempo real pelo nome do produto
- Botão para limpar os filtros

## Atividade 6 do cronograma (Projeto Empreendedor 2 - Unidade 2)

RF12 Edição/exclusão de produtos pelo vendedor
- Edição de produtos já cadastrados (nome, preço, categoria, descrição e avaliação)
- Exclusão de produtos da listagem
- Atualização automática da lista após edição ou remoção
- Sincronização com carrinho de compras (remoção de itens relacionados ao produto excluído)

## Atividade 7 do cronograma (Projeto Empreendedor 2 - Unidade 3)

RF13 - Responsividade e usabilidade:
- Layout responsivo com breakpoint em 1024px (inclui tablets)
- Menu de navegação em drawer deslizante da esquerda para a direita no mobile
- Overlay com bloqueio de scroll ao abrir o menu
- Fechamento do drawer por clique no overlay, em link de navegação ou tecla Escape
- Touch targets mínimos de 44px em botões e campos
- Grids adaptados para coluna única no mobile (carrinho, pedido, atividade 4)
- Tabelas com scroll horizontal para não vazar do layout
- Filtros e seções com ações reorganizados em coluna no mobile

RF14 - Validações e testes finais:
- Validação em tempo real por campo (blur) com marcação visual de erro/sucesso
- Mensagens de erro por campo abaixo do input inválido
- Labels de campos obrigatórios marcados com asterisco (*)
- Validação aplicada em todos os formulários: cadastro, vendedor, produtos, pedido, avaliações e mensagens
- Formulários com atributo `novalidate` (validação totalmente controlada por JS)