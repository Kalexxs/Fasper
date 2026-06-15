// RF10 - Login e Autenticação de Usuários

function getUsuarioLogado() {
    const usuario = sessionStorage.getItem('usuarioLogado');
    return usuario ? JSON.parse(usuario) : null;
}


function verificarAutenticacao() {
    const usuario = getUsuarioLogado();
    const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
    
    
    const paginasPublicas = ['login.html', 'cadastro.html', 'index.html'];
    
    if (!usuario && !paginasPublicas.includes(paginaAtual)) {
        
        sessionStorage.setItem('redirectAfterLogin', paginaAtual);
        window.location.href = 'login.html';
        return false;
    }
    
    
    if (usuario && paginaAtual === 'login.html') {
        if (usuario.tipo === 'vendedor') {
            window.location.href = 'resumo.html';
        } else {
            window.location.href = 'lista-produtos.html';
        }
        return false;
    }
    
    return true;
}


function fazerLogout() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
}


function exibirInfoUsuario() {
    const usuario = getUsuarioLogado();
    const pagina = window.location.pathname.split('/').pop() || 'index.html';

    if (!usuario) {
        // Mostra botões Entrar / Cadastrar quando não logado (exceto nas próprias páginas)
        if (pagina !== 'login.html' && pagina !== 'cadastro.html') {
            // DESKTOP: top bar fixo no canto superior direito
            if (!document.getElementById('topLoginBar')) {
                const bar = document.createElement('div');
                bar.id = 'topLoginBar';
                bar.className = 'top-user-bar';

                const entrarBtn = document.createElement('a');
                entrarBtn.href = 'login.html';
                entrarBtn.className = 'btn-entrar-desktop';
                entrarBtn.textContent = 'Entrar';

                const cadastroBtn = document.createElement('a');
                cadastroBtn.href = 'cadastro.html';
                cadastroBtn.className = 'btn-cadastro-desktop';
                cadastroBtn.textContent = 'Cadastrar';

                bar.appendChild(entrarBtn);
                bar.appendChild(cadastroBtn);
                document.body.appendChild(bar);
            }

            // MOBILE: bloco Entrar/Cadastrar dentro do drawer
            const nav = document.getElementById('navPrincipal');
            if (nav && !document.getElementById('navLoginBlock')) {
                const block = document.createElement('div');
                block.id = 'navLoginBlock';
                block.className = 'nav-usuario-block';
                block.innerHTML = `
                    <a class="nav-entrar-btn" href="login.html">Entrar</a>
                    <a class="nav-cadastro-btn" href="cadastro.html">Cadastrar</a>
                `;
                nav.insertBefore(block, nav.firstChild);
            }
        }
        return;
    }

    if (pagina === 'login.html') return;

    // Remove elementos legados
    const oldChip = document.getElementById('usuarioChip');
    if (oldChip) oldChip.remove();

    const primeiroNome = usuario.nome
        ? usuario.nome.split(' ').slice(0, 2).join(' ')
        : usuario.email;

    // DESKTOP: top bar fixo no <body> (fora do header), nome + botão SAIR
    if (!document.getElementById('topUserBar')) {
        const bar = document.createElement('div');
        bar.id = 'topUserBar';
        bar.className = 'top-user-bar';

        const nomeEl = document.createElement('span');
        nomeEl.id = 'usuarioDesktopInfo';
        nomeEl.className = 'usuario-desktop-info';
        nomeEl.title = usuario.email;
        nomeEl.textContent = '👤 ' + primeiroNome;

        const sairEl = document.createElement('button');
        sairEl.className = 'btn-sair-desktop';
        sairEl.textContent = 'SAIR';
        sairEl.addEventListener('click', fazerLogout);

        bar.appendChild(nomeEl);
        bar.appendChild(sairEl);
        document.body.appendChild(bar); // no <body>, fora do header

        // Oculta o botão SAIR inline do HTML (substituído pela top bar)
        const btnSairHTML = document.getElementById('btnSair');
        if (btnSairHTML) btnSairHTML.style.display = 'none';
    }

    // MOBILE: bloco com nome + Sair dentro do drawer
    const nav = document.getElementById('navPrincipal');
    if (nav && !document.getElementById('navUsuarioBlock')) {
        const block = document.createElement('div');
        block.id = 'navUsuarioBlock';
        block.className = 'nav-usuario-block';
        block.innerHTML = `
            <span class="nav-usuario-nome">👤 ${primeiroNome}</span>
            <button class="nav-sair-btn" id="btnSairMobile">Sair</button>
        `;
        nav.insertBefore(block, nav.firstChild);

        document.getElementById('btnSairMobile').addEventListener('click', fazerLogout);
    }
}

// INICIALIZAÇÃO DA TELA DE LOGIN
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('loginForm');
        const msgDiv = document.getElementById('msgLogin');
        
        if (form) {
            // RF14 – validação em tempo real
            const emailInp = document.getElementById('email');
            const senhaInp = document.getElementById('senha');
            emailInp?.addEventListener('blur', () => {
              if (!emailInp.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInp.value.trim()))
                emailInp.classList.add('invalido');
              else emailInp.classList.remove('invalido');
            });
            senhaInp?.addEventListener('blur', () => {
              if (!senhaInp.value || senhaInp.value.length < 6)
                senhaInp.classList.add('invalido');
              else senhaInp.classList.remove('invalido');
            });

            form.addEventListener('submit', (event) => {
                event.preventDefault();
                
                const email = document.getElementById('email').value.trim();
                const senha = document.getElementById('senha').value;

                // RF14 – validação campos login
                const emailEl = document.getElementById('email');
                const senhaEl = document.getElementById('senha');
                let loginValido = true;
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  emailEl.classList.add('invalido'); loginValido = false;
                } else { emailEl.classList.remove('invalido'); }
                if (!senha || senha.length < 6) {
                  senhaEl.classList.add('invalido'); loginValido = false;
                } else { senhaEl.classList.remove('invalido'); }
                if (!loginValido) {
                  msgDiv.innerHTML = '<span class="erro-campo">Preencha e-mail e senha corretamente (senha mín. 6 caracteres).</span>';
                  return;
                }

                const usuarioCadastrado = JSON.parse(localStorage.getItem('usuario') || '{}');
                
                // Verificar se as credenciais são válidas
                if (usuarioCadastrado.email === email && usuarioCadastrado.senha === senha) {
                    
                    sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioCadastrado));
                    
                    
                    const redirect = sessionStorage.getItem('redirectAfterLogin');
                    sessionStorage.removeItem('redirectAfterLogin');
                    
                    
                    if (redirect && redirect !== 'login.html') {
                        window.location.href = redirect;
                    } else if (usuarioCadastrado.tipo === 'vendedor') {
                        window.location.href = 'resumo.html';
                    } else {
                        window.location.href = 'lista-produtos.html';
                    }
                } else {
                    msgDiv.innerHTML = '<div class="msg-error-login">❌ E-mail ou senha inválidos!</div>';
                }
            });
        }
        
        
        const esqueciBtn = document.getElementById('esqueciSenha');
        if (esqueciBtn) {
            esqueciBtn.addEventListener('click', (e) => {
                e.preventDefault();
                msgDiv.innerHTML = '<div class="msg-success">📧 Instruções de recuperação enviadas para seu e-mail cadastrado.</div>';
            });
        }
    });
}

// BOTÃO SAIR - para todas as páginas


function configurarBotaoSair() {
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            sessionStorage.removeItem('usuarioLogado');
            window.location.href = 'login.html';
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    configurarBotaoSair();
    exibirInfoUsuario();
});