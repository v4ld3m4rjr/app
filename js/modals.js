/* ===================================================================
   modals.js — Modal Management, Questionnaire (0-10 & TQR 0-13),
   Dynamic Scale Descriptors & Detailed Legend Modal
   =================================================================== */

function openModal(id) {
    if (id === 'curriculumModal' && typeof currentUser !== 'undefined' && currentUser) {
        const nEl = document.getElementById('currName'); if (nEl) nEl.textContent = currentUser.name;
        const eEl = document.getElementById('currEmail'); if (eEl) eEl.textContent = currentUser.email;
        const dEl = document.getElementById('currDate'); if (dEl) dEl.textContent = new Date(currentUser.createdAt).toLocaleDateString('pt-BR');
        const rEl = document.getElementById('currRecords'); if (rEl) rEl.textContent = getData().length;
    }
    if (id === 'editProfileModal' && typeof currentUser !== 'undefined' && currentUser) {
        const enEl = document.getElementById('editName'); if (enEl) enEl.value = currentUser.name;
        const eeEl = document.getElementById('editEmail'); if (eeEl) eeEl.value = currentUser.email;
    }
    if (id === 'supabaseConfigModal') {
        const uEl = document.getElementById('sbUrlInput');
        const kEl = document.getElementById('sbKeyInput');
        const tEl = document.getElementById('sbTableInput');
        if (uEl) uEl.value = (typeof SUPABASE_CONFIG !== 'undefined') ? SUPABASE_CONFIG.url : '';
        if (kEl) kEl.value = (typeof SUPABASE_CONFIG !== 'undefined') ? SUPABASE_CONFIG.anonKey : '';
        if (tEl) tEl.value = (typeof SUPABASE_CONFIG !== 'undefined') ? SUPABASE_CONFIG.table : 'training_logs';
    }
    if (id === 'questionnaireModal') {
        const data = getData();
        const today = new Date().toISOString().slice(0, 10);
        const te = data.find(function (e) { return e.date && e.date.slice(0, 10) === today; });
        const qHrvEl = document.getElementById('qHrv');
        if (qHrvEl) {
            qHrvEl.value = (te && te.hrv) ? te.hrv : '';
        }

        // Initialize / sync all slider descriptors
        const sliders = [
            { id: 'sonoQ', valId: 'vSonoQ', key: 'sonoQ' },
            { id: 'sonoH', valId: 'vSonoH', key: null },
            { id: 'fadiga', valId: 'vFadiga', key: 'fadiga' },
            { id: 'estresse', valId: 'vEstresse', key: 'estresse' },
            { id: 'doms', valId: 'vDoms', key: 'doms' },
            { id: 'humor', valId: 'vHumor', key: 'humor' },
            { id: 'tqr', valId: 'vTqr', key: 'tqr' },
            { id: 'prs', valId: 'vPrs', key: 'prs' },
            { id: 'dor', valId: 'vDor', key: 'dor' },
            { id: 'motivacao', valId: 'vMotivacao', key: 'motivacao' }
        ];

        sliders.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) {
                if (te && te[s.id] != null) el.value = te[s.id];
                sv(el, s.valId, s.key);
            }
        });
    }
    if (id === 'workoutModal') {
        const wdEl = document.getElementById('wkDate');
        if (wdEl) wdEl.value = new Date().toISOString().slice(0, 10);
        const wkPseEl = document.getElementById('wkPse');
        if (wkPseEl) sv(wkPseEl, 'vWkPse', 'wkPse');
    }
    const modalEl = document.getElementById(id);
    if (modalEl && modalEl.classList) modalEl.classList.add('active');
}

function closeModal(id) {
    const modalEl = document.getElementById(id);
    if (modalEl && modalEl.classList) modalEl.classList.remove('active');
}

/**
 * Update Slider Value & Live Scale Descriptor
 */
function sv(slider, valId, scaleKey) {
    const valEl = document.getElementById(valId);
    if (!valEl) return;

    const val = parseFloat(slider.value);

    if (scaleKey && typeof SCALE_LEGENDS !== 'undefined' && SCALE_LEGENDS[scaleKey]) {
        const info = SCALE_LEGENDS[scaleKey];
        const desc = info.descriptions[val] || '';

        // Display value
        valEl.textContent = val;

        // Update live descriptor hint below slider
        const descEl = document.getElementById('desc_' + scaleKey);
        if (descEl) {
            descEl.innerHTML = `<strong>${val}:</strong> ${desc}`;
        }
    } else {
        valEl.textContent = slider.value + (valId === 'vSonoH' ? 'h' : valId === 'vWkDur' ? 'm' : '');
    }
}

/**
 * Show Detailed Scale Legend in Modal
 */
function showScaleLegend(scaleKey) {
    if (typeof SCALE_LEGENDS === 'undefined' || !SCALE_LEGENDS[scaleKey]) return;
    const info = SCALE_LEGENDS[scaleKey];

    const titleEl = document.getElementById('scaleLegendTitle');
    const contentEl = document.getElementById('scaleLegendContent');
    const sliderEl = document.getElementById(scaleKey);
    const currentVal = sliderEl ? parseFloat(sliderEl.value) : -1;

    if (titleEl) titleEl.textContent = `📋 Legenda: ${info.title}`;

    if (contentEl) {
        let html = '<div class="scale-legend-list">';
        for (let i = info.min; i <= info.max; i++) {
            const isSelected = (i === currentVal);
            const desc = info.descriptions[i] || '';
            html += `
                <div class="scale-legend-row ${isSelected ? 'selected' : ''}" onclick="selectScaleValue('${scaleKey}', ${i})">
                    <div class="scale-num-badge">${i}</div>
                    <div class="scale-desc-text">${desc}</div>
                    ${isSelected ? '<span class="scale-selected-check">✓ Selecionado</span>' : ''}
                </div>
            `;
        }
        html += '</div>';
        contentEl.innerHTML = html;
    }

    openModal('scaleLegendModal');
}

/**
 * Quick select value from legend modal
 */
function selectScaleValue(scaleKey, val) {
    const sliderEl = document.getElementById(scaleKey);
    if (sliderEl) {
        sliderEl.value = val;
        const valMap = {
            sonoQ: 'vSonoQ', fadiga: 'vFadiga', estresse: 'vEstresse',
            doms: 'vDoms', humor: 'vHumor', tqr: 'vTqr',
            prs: 'vPrs', dor: 'vDor', motivacao: 'vMotivacao', wkPse: 'vWkPse'
        };
        sv(sliderEl, valMap[scaleKey], scaleKey);
    }
    closeModal('scaleLegendModal');
}

function num(id) {
    var el = document.getElementById(id);
    return el ? (parseFloat(el.value) || 0) : 0;
}

/* ── Global Floating Confirmation Toast & Success Feedback ── */
let toastTimeout = null;

function showConfirmationToast(title, desc, durationMs = 4000) {
    const toast = document.getElementById('globalConfirmToast');
    const titleEl = document.getElementById('toastTitle');
    const descEl = document.getElementById('toastDesc');
    const bar = document.getElementById('toastProgressBar');
    if (!toast) return;

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;

    toast.style.display = 'block';
    if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '100%';
        setTimeout(() => {
            bar.style.transition = `width ${durationMs}ms linear`;
            bar.style.width = '0%';
        }, 20);
    }

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        hideConfirmToast();
    }, durationMs);

    if (navigator.vibrate) {
        try { navigator.vibrate([30, 40, 30]); } catch (e) {}
    }
}

function hideConfirmToast() {
    const toast = document.getElementById('globalConfirmToast');
    if (toast) toast.style.display = 'none';
    if (toastTimeout) clearTimeout(toastTimeout);
}

/**
 * Show Rich Submission Success Modal Dialog
 */
function showSubmissionSuccessModal(entry, formTitle = 'Questionário Matinal') {
    const modal = document.getElementById('submissionSuccessModal');
    if (!modal) {
        showConfirmationToast('✅ Dados Enviados!', `${formTitle} salvo com sucesso.`);
        return;
    }

    const titleEl = document.getElementById('subSuccessTitle');
    const dateEl = document.getElementById('subSuccessDate');
    const prontEl = document.getElementById('subValProntidao');
    const recEl = document.getElementById('subValRecuperacao');
    const hrvEl = document.getElementById('subValHrv');
    const cargaEl = document.getElementById('subValCarga');

    if (titleEl) titleEl.textContent = `✅ ${formTitle} Salvo!`;
    const dt = entry.date ? entry.date.slice(0, 10).split('-').reverse().join('/') : 'Hoje';
    if (dateEl) dateEl.textContent = `Registro de ${dt} processado, recalculado e sincronizado.`;

    if (prontEl) prontEl.textContent = `${entry.prontidao != null ? entry.prontidao : '--'}%`;
    if (recEl) recEl.textContent = `${entry.recuperacao != null ? entry.recuperacao : '--'}%`;
    if (hrvEl) hrvEl.textContent = `${entry.hrv || '--'} ms`;
    const carga = (entry.tss || entry.trimp) ? `${entry.tss || entry.trimp} TSS` : '0 (Descanso)';
    if (cargaEl) cargaEl.textContent = carga;

    // Toast in top
    showConfirmationToast('✅ Dados Salvos com Sucesso!', `${formTitle}: Prontidão ${entry.prontidao || 0}% · Recuperação ${entry.recuperacao || 0}%`);

    // Open bottom modal sheet
    openModal('submissionSuccessModal');
}

/* ── Save Recovery Questionnaire (0-10 Scales, TQR 0-13) ── */
function saveQuestionnaire() {
    try {
        var sonoQ = num('sonoQ');
        var sonoHEl = document.getElementById('sonoH');
        var sonoH = sonoHEl ? (parseFloat(sonoHEl.value) || 7.5) : 7.5;
        var fadiga = num('fadiga');
        var estresse = num('estresse');
        var doms = num('doms');
        var humor = num('humor');
        var tqr = num('tqr');
        var prs = num('prs');
        var dor = num('dor');
        var motivacao = num('motivacao');
        var qHrv = num('qHrv');

        var hooper = typeof cHooper === 'function' ? cHooper(fadiga, estresse, doms, humor) : (fadiga + estresse + doms + (10 - humor));
        var prontidao = typeof cPront === 'function' ? cPront(tqr, prs, sonoQ, motivacao) : 70;
        var recuperacao = typeof cRecup === 'function' ? cRecup(tqr, prs, sonoQ, doms) : 70;

        var today = new Date().toISOString().slice(0, 10);

        var entry = {
            date: today,
            sonoQ: sonoQ,
            sensacao: prs,
            sonoWatch: Math.round(sonoQ * 10),
            sonoH: sonoH,
            fadiga: fadiga,
            estresse: estresse,
            doms: doms,
            humor: humor,
            tqr: tqr,
            prs: prs,
            psr: prs,
            dor: dor,
            motivacao: motivacao,
            hooper: hooper,
            prontidao: prontidao,
            recuperacao: recuperacao
        };
        if (qHrv > 0) entry.hrv = qHrv;

        var saved = saveEntry(entry);
        closeModal('questionnaireModal');
        refreshAll();
        showSubmissionSuccessModal(saved || entry, 'Questionário Matinal');
    } catch (err) {
        console.error('Erro ao salvar questionário:', err);
        showConfirmationToast('Erro ao Salvar', err.message);
        alert('Erro ao salvar questionário: ' + err.message);
    }
}

/* ── Save Workout ── */
function saveWorkout() {
    try {
        var dateEl = document.getElementById('wkDate');
        var selectedDate = (dateEl && dateEl.value) ? dateEl.value : new Date().toISOString().slice(0, 10);
        var typeEl = document.getElementById('wkType');
        var type = typeEl ? typeEl.value : 'Musculação / Força';
        var dur = num('wkDur');
        var pse = num('wkPse');
        var hrv = num('wkHrv');
        var fcmedia = num('wkFc');
        var notesEl = document.getElementById('wkNotes');
        var notes = notesEl ? notesEl.value : '';

        var entry = {
            date: selectedDate,
            wkType: type,
            dur: dur,
            pse: pse,
            fcmedia: fcmedia,
            notes: notes
        };
        if (hrv > 0) entry.hrv = hrv;

        var saved = saveEntry(entry);
        closeModal('workoutModal');
        refreshAll();
        showSubmissionSuccessModal(saved || entry, 'Treino de ' + type);
    } catch (err) {
        console.error('Erro ao salvar treino:', err);
        showConfirmationToast('Erro ao Salvar', err.message);
        alert('Erro ao salvar treino: ' + err.message);
    }
}

/* ── Close on backdrop click ── */
window.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
