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
    const containerUsuario = document.getElementById('usuarioInfo');
    const botaoSair = document.getElementById('btnSair');
    
    if (containerUsuario && usuario) {
        containerUsuario.innerHTML = `
            <span class="user-name">👤 ${usuario.nome || usuario.email}</span>
        `;
    }
    
    if (botaoSair) {
        botaoSair.addEventListener('click', (e) => {
            e.preventDefault();
            fazerLogout();
        });
    }
}

// INICIALIZAÇÃO DA TELA DE LOGIN
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('loginForm');
        const msgDiv = document.getElementById('msgLogin');
        
        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                
                const email = document.getElementById('email').value.trim();
                const senha = document.getElementById('senha').value;
                
                // Buscar usuários cadastrados no localStorage
                // O sistema atual guarda o usuário em 'usuario' (apenas um)
               
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
});