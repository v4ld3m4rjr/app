/* ===================================================================
   app.js — Application Init & Tab Router
   =================================================================== */

function switchMainTab(tab) {
    const views = {
        today: document.getElementById('viewToday'),
        entry: document.getElementById('viewEntry'),
        neuroAI: document.getElementById('viewNeuroAI'),
        table: document.getElementById('viewTable'),
        trends: document.getElementById('viewTrends'),
        science: document.getElementById('viewScience')
    };

    const navItems = {
        today: document.getElementById('tabNavToday'),
        entry: document.getElementById('tabNavEntry'),
        neuroAI: document.getElementById('tabNavNeuroAI'),
        table: document.getElementById('tabNavTable'),
        trends: document.getElementById('tabNavTrends'),
        science: document.getElementById('tabNavScience')
    };

    const topTabs = {
        today: document.getElementById('topTabToday'),
        entry: document.getElementById('topTabEntry'),
        neuroAI: document.getElementById('topTabNeuroAI'),
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
    } else if (tab === 'neuroAI') {
        if (typeof renderNeuroAIAnalysis === 'function') renderNeuroAIAnalysis();
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
    if (typeof updateIndices === 'function') updateIndices(data);
    if (typeof runAIAnalysis === 'function') runAIAnalysis();
    if (typeof renderChart === 'function') renderChart();
    if (typeof renderSpreadsheetTable === 'function') renderSpreadsheetTable();
    const neuroView = document.getElementById('viewNeuroAI');
    if (neuroView && neuroView.style.display !== 'none' && typeof renderNeuroAIAnalysis === 'function') {
        renderNeuroAIAnalysis();
    }
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

async function handlePushAllSupabase() {
    if (typeof pushAllToSupabase === 'function') {
        const btn = document.getElementById('btnPushAllSb');
        const originalText = btn ? btn.textContent : '';
        if (btn) {
            btn.textContent = '⏳ Enviando registros para o Supabase...';
            btn.disabled = true;
        }
        const ok = await pushAllToSupabase();
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
        if (ok) {
            alert('✅ Todos os registros foram enviados e sincronizados com sucesso no Supabase!');
            closeModal('supabaseConfigModal');
        }
    }
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
