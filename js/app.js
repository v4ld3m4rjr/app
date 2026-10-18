/* ===================================================================
   app.js — Application Init & Tab Router
   =================================================================== */

function switchMainTab(tab) {
    const views = {
        today: document.getElementById('viewToday'),
        entry: document.getElementById('viewEntry'),
        table: document.getElementById('viewTable'),
        trends: document.getElementById('viewTrends'),
        science: document.getElementById('viewScience')
    };

    const navItems = {
        today: document.getElementById('tabNavToday'),
        entry: document.getElementById('tabNavEntry'),
        table: document.getElementById('tabNavTable'),
        trends: document.getElementById('tabNavTrends'),
        science: document.getElementById('tabNavScience')
    };

    const topTabs = {
        today: document.getElementById('topTabToday'),
        entry: document.getElementById('topTabEntry'),
        table: document.getElementById('topTabTable'),
        trends: document.getElementById('topTabTrends'),
        science: document.getElementById('topTabScience')
    };

    // Hide all views and remove active class
    Object.keys(views).forEach(k => {
        if (views[k]) views[k].style.display = k === tab ? 'block' : 'none';
        if (navItems[k]) navItems[k].classList.toggle('active', k === tab);
        if (topTabs[k]) topTabs[k].classList.toggle('active', k === tab);
    });

    // Specific tab activations
    if (tab === 'entry') {
        initEntryForm();
    } else if (tab === 'table') {
        renderSpreadsheetTable();
    } else if (tab === 'trends') {
        buildVarChips();
        renderChart();
    } else if (tab === 'science') {
        renderMethodology();
    } else if (tab === 'today') {
        refreshAll();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDashboard() {
    const authScreen = document.getElementById('authScreen');
    const mainScreen = document.getElementById('mainScreen');
    if (authScreen) authScreen.classList.remove('active');
    if (mainScreen) mainScreen.classList.add('active');

    const now = new Date();
    const dEl = document.getElementById('headerDate');
    if (dEl) {
        const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        const capDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        const uName = (currentUser && currentUser.name) ? currentUser.name.split(' ')[0] : 'Atleta';
        dEl.textContent = `${capDate} · ${uName}`;
    }

    buildVarChips();
    refreshAll();
    renderSpreadsheetTable();
    initEntryForm();
    renderMethodology();

    if (typeof syncFromSupabase === 'function') syncFromSupabase();
}

function refreshAll() {
    const data = getData();
    updateIndices(data);
    runAIAnalysis();
    renderChart();
    renderSpreadsheetTable();
}

function handleSaveSupabaseConfig() {
    const url = document.getElementById('sbUrlInput').value;
    const key = document.getElementById('sbKeyInput').value;
    const table = document.getElementById('sbTableInput').value;

    if (!url || !key) return alert('Por favor, informe a URL e a Anon Key do Supabase!');

    saveSupabaseConfig(url, key, table);
    closeModal('supabaseConfigModal');
    alert('Configurações do Supabase salvas com sucesso! Sincronizando dados...');
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof initSupabase === 'function') {
        initSupabase();
    }

    const s = localStorage.getItem(SK.USER);
    if (s) {
        try {
            currentUser = JSON.parse(s);
            showDashboard();
        } catch (e) {
            console.error(e);
        }
    }
});
