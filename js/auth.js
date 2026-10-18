/* ===================================================================
   auth.js — Authentication (Login / Register / Reset Password / Logout / Profile)
   =================================================================== */

let currentUser = null;

function toggleAuth(mode) {
    const loginEl = document.getElementById('loginForm');
    const regEl = document.getElementById('registerForm');
    const resetEl = document.getElementById('resetForm');

    if (loginEl) loginEl.style.display = mode === 'login' ? 'block' : 'none';
    if (regEl) regEl.style.display = mode === 'register' ? 'block' : 'none';
    if (resetEl) resetEl.style.display = mode === 'reset' ? 'block' : 'none';
}

function register() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const emailC = document.getElementById('regEmailConfirm').value.trim();
    const pw = document.getElementById('regPassword').value;
    const pwC = document.getElementById('regPasswordConfirm').value;

    if (!name || !email || !pw) return alert('Preencha todos os campos!');
    if (email !== emailC) return alert('Os e-mails não coincidem!');
    if (pw !== pwC) return alert('As senhas não coincidem!');
    if (pw.length < 6) return alert('Senha deve ter no mínimo 6 caracteres!');

    const users = JSON.parse(localStorage.getItem(SK.USERS) || '[]');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return alert('E-mail já cadastrado!');

    const u = { id: Date.now().toString(), name, email, password: pw, createdAt: new Date().toISOString() };
    users.push(u);
    localStorage.setItem(SK.USERS, JSON.stringify(users));
    alert('Cadastro realizado com sucesso! Faça login.');
    document.getElementById('loginEmail').value = email;
    toggleAuth('login');
}

function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const pw = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem(SK.USERS) || '[]');
    const u = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pw);
    if (!u) return alert('E-mail ou senha inválidos!');
    currentUser = u;
    localStorage.setItem(SK.USER, JSON.stringify(u));
    showDashboard();
}

function loginAsDemo() {
    const demoUser = {
        id: 'demo-athlete',
        name: 'Valdemar Jr',
        email: 'valdemar@app.io',
        createdAt: new Date().toISOString()
    };
    currentUser = demoUser;
    localStorage.setItem(SK.USER, JSON.stringify(demoUser));
    showDashboard();
}

function resetPassword() {
    const email = document.getElementById('resetEmail').value.trim();
    const pw = document.getElementById('resetPassword').value;
    const pwC = document.getElementById('resetPasswordConfirm').value;

    if (!email || !pw || !pwC) return alert('Preencha todos os campos!');
    if (pw !== pwC) return alert('As senhas não coincidem!');
    if (pw.length < 6) return alert('A nova senha deve ter no mínimo 6 caracteres!');

    const users = JSON.parse(localStorage.getItem(SK.USERS) || '[]');
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
        return alert('Nenhuma conta cadastrada com este e-mail!');
    }

    users[userIndex].password = pw;
    localStorage.setItem(SK.USERS, JSON.stringify(users));

    const cur = JSON.parse(localStorage.getItem(SK.USER) || 'null');
    if (cur && cur.email.toLowerCase() === email.toLowerCase()) {
        cur.password = pw;
        localStorage.setItem(SK.USER, JSON.stringify(cur));
    }

    alert('Senha redefinida com sucesso! Você já pode entrar com sua nova senha.');
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = '';
    toggleAuth('login');
}

function logout() {
    currentUser = null;
    localStorage.removeItem(SK.USER);
    document.getElementById('mainScreen').classList.remove('active');
    document.getElementById('authScreen').classList.add('active');
    toggleAuth('login');
}

function saveProfile() {
    const n = document.getElementById('editName').value.trim();
    if (!n) return alert('Nome não pode ficar vazio!');
    currentUser.name = n;
    localStorage.setItem(SK.USER, JSON.stringify(currentUser));
    const users = JSON.parse(localStorage.getItem(SK.USERS) || '[]');
    const i = users.findIndex(u => u.id === currentUser.id);
    if (i !== -1) { users[i] = currentUser; localStorage.setItem(SK.USERS, JSON.stringify(users)); }
    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = n.split(' ')[0];
    closeModal('editProfileModal');
    alert('Perfil atualizado com sucesso!');
}
