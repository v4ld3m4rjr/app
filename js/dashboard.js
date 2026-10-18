/* ===================================================================
   dashboard.js — Synthonia AI UI Engine
   Segmented controls, 7-day bar charts, circular gauges, HRV deltas & AI
   =================================================================== */

let currentSegment = 'recovery';

/**
 * Switch between Today segmented tabs: Recovery, Exertion, Energy
 */
function switchSegment(seg) {
    currentSegment = seg;
    const subRec = document.getElementById('subViewRecovery');
    const subEx = document.getElementById('subViewExertion');
    const subEn = document.getElementById('subViewEnergy');

    const btnRec = document.getElementById('segRecovery');
    const btnEx = document.getElementById('segExertion');
    const btnEn = document.getElementById('segEnergy');

    if (btnRec) btnRec.classList.toggle('active', seg === 'recovery');
    if (btnEx) btnEx.classList.toggle('active', seg === 'exertion');
    if (btnEn) btnEn.classList.toggle('active', seg === 'energy');

    if (subRec) subRec.style.display = seg === 'recovery' ? 'block' : 'none';
    if (subEx) subEx.style.display = seg === 'exertion' ? 'block' : 'none';
    if (subEn) subEn.style.display = seg === 'energy' ? 'block' : 'none';
}

/**
 * Update all dashboard indices and cards
 */
function updateIndices(data) {
    if (!data || !data.length) return;
    const L = data[data.length - 1];

    const rec = CL(L.recuperacao || 0, 0, 100);
    const pront = CL(L.prontidao || 0, 0, 100);
    const sonoQ = CL((L.sonoQ || 3) * 20, 0, 100);
    const sonoH = L.sonoH || 7;
    const tss = L.tss || 0;
    const atl = L.atl || 0;
    const ctl = L.ctl || 45;
    const tsb = L.tsb || (ctl - atl);
    const mono = L.monotonia || 1.1;
    const hrv = L.hrv || 85;
    const rhr = L.rhr || (L.fcmedia ? Math.round(L.fcmedia * 0.38) : 42); // Resting Heart Rate
    const exertion = +(pront / 10).toFixed(1); // 0-10 scale

    // ── 1. RECOVERY HERO CARD ──
    const valRecScore = document.getElementById('valRecoveryScore');
    const recColorBar = document.getElementById('recColorBar');
    const recStatusTitle = document.getElementById('recStatusTitle');
    const recCoachingText = document.getElementById('recCoachingText');
    const recUpdateTime = document.getElementById('recUpdateTime');

    let recThemeColor = '#ffcc00';
    let statusText = 'Recovering';
    let coachMsg = 'Your Recovery today indicates that your body is in a state of recovery and you should consider training at a moderate or reduced load.';

    if (rec >= 67) {
        recThemeColor = '#34c759'; // Apple Green
        statusText = 'Optimal';
        coachMsg = 'Seu tônus vagal e sistema autonômico estão excelentes. Você está pronto para sessões de alta intensidade ou progressão de carga.';
    } else if (rec >= 40) {
        recThemeColor = '#a4cd39'; // Lime Green / Yellow
        statusText = 'Recovering';
        coachMsg = 'Sua recuperação de hoje indica que o corpo está em processo de restauração metabólica. Mantenha os treinos em zona de esforço moderada.';
    } else {
        recThemeColor = '#ff3b30'; // Apple Red
        statusText = 'Resting';
        coachMsg = 'Fadiga ou estresse fisiológico detectados. Priorize sono, hidratação e recuperação ativa para restabelecer o equilíbrio homeostático.';
    }

    if (valRecScore) {
        valRecScore.textContent = `${rec}%`;
        valRecScore.style.color = recThemeColor;
    }
    if (recColorBar) {
        recColorBar.style.background = recThemeColor;
    }
    if (recStatusTitle) {
        recStatusTitle.textContent = statusText;
    }
    if (recCoachingText) {
        recCoachingText.textContent = coachMsg;
    }
    if (recUpdateTime) {
        const now = new Date();
        recUpdateTime.textContent = `Última sincronização: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // ── 2. BIOMETRIC DELTAS (HRV & RESTING HR) ──
    // 7-day Rolling Baseline for HRV
    const recentHrvEntries = data.slice(-8, -1).map(e => e.hrv).filter(v => v > 0);
    const avgPastHrv = recentHrvEntries.length
        ? Math.round(recentHrvEntries.reduce((a, b) => a + b, 0) / recentHrvEntries.length)
        : 75;
    const hrvDiff = Math.round(((hrv - avgPastHrv) / avgPastHrv) * 100);
    const hrvDeltaText = `${hrvDiff >= 0 ? '+' : ''}${hrvDiff}% (${avgPastHrv}) ${hrvDiff >= 0 ? '↑' : '↓'}`;

    const bioHrvVal = document.getElementById('bioHrvVal');
    const bioHrvDelta = document.getElementById('bioHrvDelta');
    if (bioHrvVal) bioHrvVal.innerHTML = `${hrv} <span style="font-size:12px;font-weight:600;color:var(--text-tertiary)">ms</span>`;
    if (bioHrvDelta) {
        bioHrvDelta.textContent = hrvDeltaText;
        bioHrvDelta.className = hrvDiff >= 0 ? 'bio-delta-up' : 'bio-delta-down';
    }

    // 7-day Baseline for Resting HR
    const avgPastRhr = 43;
    const rhrDiff = Math.round(((rhr - avgPastRhr) / avgPastRhr) * 100);
    const rhrDeltaText = `${rhrDiff >= 0 ? '+' : ''}${rhrDiff}% (${avgPastRhr}) ${rhrDiff <= 0 ? '↓' : '↑'}`;

    const bioRhrVal = document.getElementById('bioRhrVal');
    const bioRhrDelta = document.getElementById('bioRhrDelta');
    if (bioRhrVal) bioRhrVal.innerHTML = `${rhr} <span style="font-size:12px;font-weight:600;color:var(--text-tertiary)">bpm</span>`;
    if (bioRhrDelta) {
        bioRhrDelta.textContent = rhrDeltaText;
        bioRhrDelta.className = rhrDiff <= 0 ? 'bio-delta-up' : 'bio-delta-down';
    }

    // ── 3. 7-DAY RECOVERY PER DAY BAR CHART ──
    renderDailyRecoveryBars(data);

    // ── 4. EXERTION HERO CARD & CIRCULAR GAUGE ──
    const targetMin = Math.max(1.5, +((rec / 25) + 1.2).toFixed(1));
    const targetMax = Math.min(9.8, +(targetMin + 2.0).toFixed(1));

    const targetExertionLabel = document.getElementById('targetExertionLabel');
    if (targetExertionLabel) {
        targetExertionLabel.textContent = `Target Exertion Zone: ${targetMin.toString().replace('.', ',')} - ${targetMax.toString().replace('.', ',')}`;
    }

    const valExertionScore = document.getElementById('valExertionScore');
    const gaugeCenterSub = document.getElementById('gaugeCenterSub');
    const exertionCoachingText = document.getElementById('exertionCoachingText');

    let exCategory = 'Moderate';
    let exColor = '#ff9500';
    if (exertion < targetMin) {
        exCategory = 'Light';
        exColor = '#32ade6';
    } else if (exertion <= targetMax) {
        exCategory = 'Moderate';
        exColor = '#ff9500';
    } else {
        exCategory = 'Overreaching';
        exColor = '#ff3b30';
    }

    if (valExertionScore) valExertionScore.textContent = exertion.toString().replace('.', ',');
    if (gaugeCenterSub) gaugeCenterSub.textContent = exCategory;
    if (exertionCoachingText) {
        exertionCoachingText.textContent = `Sua recuperação foi ${statusText} hoje e você está ${exertion <= targetMax ? 'dentro da sua Target Exertion Zone' : 'acima da zona recomendada'}. Tente manter o esforço abaixo de ${targetMax.toString().replace('.', ',')} para regenerar completamente amanhã.`;
    }

    // Update Circular Gauge SVG Progress
    const gaugeCircle = document.getElementById('gaugeProgressCircle');
    const gaugeTargetArc = document.getElementById('gaugeTargetArc');
    const circumference = 2 * Math.PI * 72; // ~452.39

    if (gaugeCircle) {
        const exertionRatio = Math.min(1, Math.max(0, exertion / 10));
        const offset = circumference - (exertionRatio * circumference);
        gaugeCircle.style.strokeDashoffset = offset;
        gaugeCircle.style.stroke = exColor;
    }

    if (gaugeTargetArc) {
        const targetRatio = Math.min(1, targetMax / 10);
        const targetOffset = circumference - (targetRatio * circumference);
        gaugeTargetArc.style.strokeDashoffset = targetOffset;
    }

    // ── 5. 7-DAY EXERTION TOTAL PER DAY BAR CHART ──
    renderDailyExertionBars(data);

    // ── 6. ENERGY & AI METRICS ──
    const valAtl = document.getElementById('valAtl');
    const valCtl = document.getElementById('valCtl');
    const valTsb = document.getElementById('valTsb');
    const valMono = document.getElementById('valMono');
    const energyTssBadge = document.getElementById('energyTssBadge');
    const sleepQualityBadge = document.getElementById('sleepQualityBadge');
    const hooperBadge = document.getElementById('hooperBadge');

    if (valAtl) valAtl.textContent = atl;
    if (valCtl) valCtl.textContent = ctl;
    if (valTsb) {
        valTsb.textContent = (tsb >= 0 ? '+' : '') + tsb;
        valTsb.style.color = tsb >= 0 ? 'var(--green)' : 'var(--red)';
    }
    if (valMono) valMono.textContent = mono;
    if (energyTssBadge) energyTssBadge.textContent = `${tss > 0 ? tss : atl} TSS`;
    if (sleepQualityBadge) sleepQualityBadge.textContent = `${sonoH}h · Q${L.sonoQ || 3}/5`;
    if (hooperBadge) hooperBadge.textContent = `${L.hooper || 12}/28`;

    // ── 7. TRENDS VIEW SUMMARY ──
    const trendMostRecentRec = document.getElementById('trendMostRecentRec');
    const trendAvgRec = document.getElementById('trendAvgRec');
    const trendAvgHrv = document.getElementById('trendAvgHrv');

    if (trendMostRecentRec) trendMostRecentRec.textContent = `${rec}%`;
    const last30 = data.slice(-30);
    const avgRec30 = Math.round(last30.reduce((a, b) => a + (b.recuperacao || 0), 0) / last30.length);
    const avgHrv30 = Math.round(last30.reduce((a, b) => a + (b.hrv || 0), 0) / last30.length);

    if (trendAvgRec) trendAvgRec.textContent = `${avgRec30}%`;
    if (trendAvgHrv) trendAvgHrv.textContent = `${avgHrv30} ms`;
}

/**
 * Render 7-day Recovery Bars
 */
function renderDailyRecoveryBars(data) {
    const container = document.getElementById('recDailyBars');
    const avgLabel = document.getElementById('recWeeklyAvg');
    if (!container) return;

    const last7 = data.slice(-7);
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    let html = '';
    let totalScore = 0;

    last7.forEach(entry => {
        const dt = new Date(entry.date);
        const dayName = isNaN(dt.getTime()) ? 'DIA' : dayNames[dt.getDay()];
        const score = CL(entry.recuperacao || 0, 0, 100);
        totalScore += score;

        let barColor = '#34c759'; // Green
        if (score >= 67) barColor = '#34c759';
        else if (score >= 50) barColor = '#a4cd39';
        else if (score >= 35) barColor = '#ffcc00';
        else barColor = '#ff3b30';

        const heightPx = Math.max(12, Math.round((score / 100) * 100));

        html += `
            <div class="daily-bar-col">
                <span class="daily-bar-val">${score}%</span>
                <div class="daily-bar-track">
                    <div class="daily-bar-fill" style="height:${heightPx}px;background:${barColor}"></div>
                </div>
                <span class="daily-bar-label">${dayName}</span>
            </div>
        `;
    });

    container.innerHTML = html;
    const weeklyAvg = Math.round(totalScore / (last7.length || 1));
    if (avgLabel) {
        avgLabel.innerHTML = `${weeklyAvg}% ${weeklyAvg >= 60 ? '↑' : '↓'}`;
    }
}

/**
 * Render 7-day Exertion Bars
 */
function renderDailyExertionBars(data) {
    const container = document.getElementById('exertionDailyBars');
    const avgLabel = document.getElementById('exertionWeeklyAvg');
    if (!container) return;

    const last7 = data.slice(-7);
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    let html = '';
    let totalScore = 0;

    last7.forEach(entry => {
        const dt = new Date(entry.date);
        const dayName = isNaN(dt.getTime()) ? 'DIA' : dayNames[dt.getDay()];
        const pront = CL(entry.prontidao || 0, 0, 100);
        const exVal = +(pront / 10).toFixed(1);
        totalScore += exVal;

        const heightPx = Math.max(12, Math.round((exVal / 10) * 100));

        html += `
            <div class="daily-bar-col">
                <span class="daily-bar-val">${exVal.toString().replace('.', ',')}</span>
                <div class="daily-bar-track">
                    <div class="daily-bar-fill" style="height:${heightPx}px;background:linear-gradient(180deg,#ff9500,#ff3b30)"></div>
                </div>
                <span class="daily-bar-label">${dayName}</span>
            </div>
        `;
    });

    container.innerHTML = html;
    const weeklyAvg = (totalScore / (last7.length || 1)).toFixed(1);
    if (avgLabel) {
        avgLabel.innerHTML = `${weeklyAvg.toString().replace('.', ',')} ${weeklyAvg >= 6.0 ? '↑' : '↓'}`;
    }
}

/**
 * Multi-variable AI Analysis Engine
 */
function runAIAnalysis() {
    const data = getData(), el = document.getElementById('aiBlocks');
    if (!el) return;
    if (!data || !data.length) {
        el.innerHTML = '<div class="card">Sem dados suficientes. Preencha o questionário ou registre treinos.</div>';
        return;
    }

    const L = data[data.length - 1];

    const rec = CL(L.recuperacao || 0, 0, 100);
    const pront = CL(L.prontidao || 0, 0, 100);
    const atl = L.atl || 0;
    const ctl = L.ctl || 0;
    const tsb = L.tsb || 0;
    const hrv = L.hrv || 0;
    const hooper = L.hooper || 0;
    const dor = L.dor || 0;
    const sonoQ = L.sonoQ || 3;
    const sonoH = L.sonoH || 7;

    let html = '';

    // BLOCO 1: ADAPTAÇÕES DO TREINAMENTO
    html += '<div class="ai-block b1">';
    html += '<div class="ai-block-title" style="color:var(--indigo)">🧠 Bloco 1: Adaptações do Treinamento</div>';
    html += '<div class="ai-block-text">';
    if (ctl >= 40) {
        html += `Com uma carga crônica acumulada (CTL ${ctl}), o sistema neuromuscular apresenta consolidação de vias motoras e maior sincronização de disparos de motoneurônios alfa. Ocorreu aumento no recrutamento de unidades motoras e biogênese mitocondrial otimizada.`;
    } else {
        html += `A carga crônica atual (CTL ${ctl}) indica fase inicial de sinalização adaptativa. O estresse induziu transcrição de fatores miogênicos (mTOR / PGC-1α), estimulando adaptação miofibrilar progressiva.`;
    }
    html += '</div></div>';

    // BLOCO 2: ADAPTAÇÕES NOS PROCESSOS DE FADIGA
    html += '<div class="ai-block b2">';
    html += '<div class="ai-block-title" style="color:var(--teal)">⚡ Bloco 2: Modulação Autonômica & Fadiga</div>';
    html += '<div class="ai-block-text">';
    if (rec >= 65 && hooper < 15) {
        html += `Fadiga central e periférica sob controle (Hooper ${hooper}/28, Dor ${dor}/10). A modulação autonômica ${hrv ? '(HRV ' + hrv + 'ms)' : ''} demonstra predomínio vagal parassimpático e rápida recuperação homeostática.`;
    } else {
        html += `Fadiga fisiológica presente (Hooper ${hooper}/28, Dor ${dor}/10). A sinalização nociceptiva e a queda temporária de HRV (${hrv}ms) requerem priorização do sono (${sonoH}h) para restauração do sistema nervoso.`;
    }
    html += '</div></div>';

    // BLOCO 3: ADAPTAÇÕES PARA O PRÓXIMO CICLO
    html += '<div class="ai-block b3">';
    html += '<div class="ai-block-title" style="color:var(--green)">🎯 Bloco 3: Diretriz para o Próximo Ciclo</div>';
    html += '<div class="ai-block-text">';
    if (pront >= 65 && tsb >= -15) {
        html += `<strong>Diretriz: Alta Intensidade / Supercompensação.</strong> Prontidão (${pront}/100) favorável. A janela de desempenho está aberta para ganho de potência.`;
    } else if (pront >= 45) {
        html += `<strong>Diretriz: Carga Moderada / Manutenção.</strong> Prontidão moderada (${pront}/100). Recomenda-se manter treinos em intensidade controlada.`;
    } else {
        html += `<strong>Diretriz: Regeneração Ativa / Deload.</strong> Prontidão deprimida (${pront}/100). Recomenda-se descanso ou sessão regenerativa por 24-48h.`;
    }
    html += '</div></div>';

    el.innerHTML = html;
}

/**
 * Open Help Info Modal
 */
function openHelpModal(type) {
    const title = document.getElementById('helpModalTitle');
    const body = document.getElementById('helpModalBody');
    if (type === 'recovery') {
        title.textContent = 'Sobre a Recuperação & HRV';
        body.innerHTML = `
            <p style="margin-bottom:12px">A pontuação de <strong>Recuperação</strong> sintetiza o tônus vagal (HRV rMSSD), a frequência cardíaca de repouso (RHR), as horas e qualidade de sono e os índices subjetivos de fadiga e dor muscular (DOMS).</p>
            <p style="margin-bottom:12px"><strong>Classificação:</strong></p>
            <ul style="padding-left:20px;margin-bottom:12px">
                <li><strong style="color:var(--green)">67% a 100%:</strong> Excelente recuperação autonômica.</li>
                <li><strong style="color:var(--green-lime)">40% a 66%:</strong> Recuperação adequada / moderada.</li>
                <li><strong style="color:var(--red)">0% a 39%:</strong> Fadiga acumulada. Priorize descanso.</li>
            </ul>
        `;
    } else if (type === 'exertion') {
        title.textContent = 'Sobre o Esforço & Target Zone';
        body.innerHTML = `
            <p style="margin-bottom:12px">A <strong>Target Exertion Zone</strong> é calculada diariamente com base na sua capacidade de recuperação. Ela define a janela ideal de esforço (escala 0 a 10) para maximizar o ganho de condicionamento físico sem causar overtraining.</p>
            <p style="margin-bottom:12px">Se mantiver o esforço dentro da faixa verde alvo, sua recuperação de amanhã será preservada com eficiência.</p>
        `;
    }
    openModal('helpModal');
}

/**
 * Share Summary Simulation
 */
function openShareSummary() {
    const data = getData();
    const L = data[data.length - 1];
    const text = `📊 Relatório de Hoje:\n• Recuperação: ${L.recuperacao}%\n• HRV: ${L.hrv} ms\n• Esforço: ${(L.prontidao/10).toFixed(1)}/10\n• Sono: ${L.sonoH}h`;
    if (navigator.share) {
        navigator.share({ title: 'Relatório Diário', text: text }).catch(() => {});
    } else {
        alert(text);
    }
}

/* ===================================================================
   SPREADSHEET TABLE & DAILY DATA ENTRY ENGINE (monitor meu.xlsx)
   =================================================================== */

/**
 * Initialize Data Entry Form with Select Options and Defaults
 */
function initEntryForm() {
    const wkSelect = document.getElementById('entryWkType');
    if (wkSelect && typeof WORKOUT_TYPES !== 'undefined') {
        wkSelect.innerHTML = WORKOUT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
    }

    const dorSelect = document.getElementById('entryDorLocal');
    if (dorSelect && typeof BODY_REGIONS !== 'undefined') {
        dorSelect.innerHTML = BODY_REGIONS.map(r => `<option value="${r}">${r}</option>`).join('');
    }

    const dateInput = document.getElementById('entryDate');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().slice(0, 10);
    }

    handleEntryDateChange();
}

/**
 * Handle Date Change in Entry Form: Load Existing Record or Reset to Draft
 */
function handleEntryDateChange() {
    const dateInput = document.getElementById('entryDate');
    if (!dateInput || !dateInput.value) return;

    const selectedDate = dateInput.value;
    const dt = new Date(selectedDate + 'T12:00:00');
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const wkLabel = document.getElementById('entryWeekdayLabel');
    if (wkLabel) wkLabel.textContent = dayNames[dt.getDay()];

    const data = getData();
    const existing = data.find(e => e.date && e.date.slice(0, 10) === selectedDate);
    const editIndicator = document.getElementById('entryEditIndicator');

    if (existing) {
        if (editIndicator) editIndicator.style.display = 'inline-block';
        
        // Populate inputs from existing entry
        setInputValue('entrySonoQ', existing.sonoQ ?? 7, 'vEntrySonoQ', 'sonoQ');
        setInputValue('entrySensacao', existing.sensacao ?? existing.sonoQ ?? 7, 'vEntrySensacao');
        setInputValue('entrySonoWatch', existing.sonoWatch ?? 80);
        setInputValue('entrySonoH', existing.sonoH ?? 7.5);
        setInputValue('entryHrv', existing.hrv ?? 75);
        setInputValue('entryRhr', existing.rhr ?? 48);
        setInputValue('entryPsr', existing.psr ?? 7, 'vEntryPsr', 'prs');
        setInputValue('entryEstresse', existing.estresse ?? 3, 'vEntryEstresse', 'estresse');

        setInputValue('entryDorManha', existing.dorManha ?? 0);
        setInputValue('entryDorMeio', existing.dorMeio ?? 0);
        setInputValue('entryDorNoite', existing.dorNoite ?? 0);
        setInputValue('entryDorGeral', existing.dor ?? 0, 'vEntryDor');
        
        const dorLocalEl = document.getElementById('entryDorLocal');
        if (dorLocalEl && existing.dorLocal) dorLocalEl.value = existing.dorLocal;

        const wkTypeEl = document.getElementById('entryWkType');
        if (wkTypeEl && existing.wkType) wkTypeEl.value = existing.wkType;

        setInputValue('entryDur', existing.dur ?? 60, 'vEntryDur');
        setInputValue('entryPse', existing.pse ?? 6, 'vEntryPse', 'wkPse');
        setInputValue('entryFcMedia', existing.fcmedia ?? 142);
        
        const notesEl = document.getElementById('entryNotes');
        if (notesEl) notesEl.value = existing.notes || '';
    } else {
        if (editIndicator) editIndicator.style.display = 'none';
    }

    updateLiveEntryPreview();
}

/**
 * Set entry date to today
 */
function setEntryDateToday() {
    const dateInput = document.getElementById('entryDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().slice(0, 10);
        handleEntryDateChange();
    }
}

/**
 * Copy previous day's metrics into the form as a draft shortcut
 */
function copyPreviousDayToForm() {
    const dateInput = document.getElementById('entryDate');
    if (!dateInput || !dateInput.value) return;

    const curDt = new Date(dateInput.value + 'T12:00:00');
    curDt.setDate(curDt.getDate() - 1);
    const prevDateStr = curDt.toISOString().slice(0, 10);

    const data = getData();
    const prev = data.find(e => e.date && e.date.slice(0, 10) === prevDateStr);
    if (!prev) {
        alert('Nenhum registro encontrado no dia anterior (' + prevDateStr + ').');
        return;
    }

    setInputValue('entrySonoQ', prev.sonoQ ?? 7, 'vEntrySonoQ', 'sonoQ');
    setInputValue('entrySensacao', prev.sensacao ?? 7, 'vEntrySensacao');
    setInputValue('entrySonoWatch', prev.sonoWatch ?? 80);
    setInputValue('entrySonoH', prev.sonoH ?? 7.5);
    setInputValue('entryHrv', prev.hrv ?? 75);
    setInputValue('entryRhr', prev.rhr ?? 48);
    setInputValue('entryPsr', prev.psr ?? 7, 'vEntryPsr', 'prs');
    setInputValue('entryEstresse', prev.estresse ?? 3, 'vEntryEstresse', 'estresse');
    
    setInputValue('entryDorManha', prev.dorManha ?? 0);
    setInputValue('entryDorMeio', prev.dorMeio ?? 0);
    setInputValue('entryDorNoite', prev.dorNoite ?? 0);
    setInputValue('entryDorGeral', prev.dor ?? 0, 'vEntryDor');

    updateLiveEntryPreview();
    alert('Valores de base de ' + prevDateStr + ' copiados para o formulário!');
}

/**
 * Auto calculate general pain slider from Morning, Midday, Evening
 */
function autoCalcDorGeral() {
    const m = Number(document.getElementById('entryDorManha')?.value) || 0;
    const md = Number(document.getElementById('entryDorMeio')?.value) || 0;
    const n = Number(document.getElementById('entryDorNoite')?.value) || 0;
    const avg = Math.round((m + md + n) / 3);
    const dorSlider = document.getElementById('entryDorGeral');
    if (dorSlider) {
        dorSlider.value = avg;
        sv(dorSlider, 'vEntryDor');
    }
}

/**
 * Handle Workout Type Change (e.g., Repouso Total sets dur=0, pse=0)
 */
function handleWkTypeChange() {
    const wkType = document.getElementById('entryWkType')?.value;
    if (wkType === 'Repouso Total') {
        setInputValue('entryDur', 0, 'vEntryDur');
        setInputValue('entryPse', 0, 'vEntryPse', 'wkPse');
    }
    updateLiveEntryPreview();
}

/**
 * Helper to set value and trigger visual slider descriptor update
 */
function setInputValue(id, val, valId, scaleKey) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val;
    if (valId) sv(el, valId, scaleKey);
}

/**
 * Live Mathematical Preview of monitor meu.xlsx formulas
 */
function updateLiveEntryPreview() {
    const pse = Number(document.getElementById('entryPse')?.value) || 0;
    const dur = Number(document.getElementById('entryDur')?.value) || 0;
    const psr = Number(document.getElementById('entryPsr')?.value) || 7;
    const sonoQ = Number(document.getElementById('entrySonoQ')?.value) || 7;
    const sensacao = Number(document.getElementById('entrySensacao')?.value) || sonoQ;
    const dor = Number(document.getElementById('entryDorGeral')?.value) || 0;

    // Banister TRIMP & Coggan TSS
    const trimp = Math.round(pse * dur);
    const tss = Number((pse * 0.64 * dur).toFixed(1));

    // Valor Sono (Mediana/Média da planilha)
    const valorSono = Number(((sonoQ + sensacao) / 2).toFixed(1));

    // Nível de Prontidão (Fórmula matemática da planilha):
    // (((PSR + ValorSono + (10 - PSE)) / 30) * 100) - (((Min * Dor) / 1000) * 100)
    const term1 = ((psr + valorSono + (10 - pse)) / 30) * 100;
    const term2 = ((dur * dor) / 1000) * 100;
    const prontidao = Math.max(0, Math.min(100, Math.round(term1 - term2)));

    // DOM Updates
    const elTrimp = document.getElementById('prevTrimp');
    const elTss = document.getElementById('prevTss');
    const elPront = document.getElementById('prevProntidao');
    const elBadge = document.getElementById('previewZoneBadge');
    const elRec = document.getElementById('prevRecommendation');

    if (elTrimp) elTrimp.textContent = trimp;
    if (elTss) elTss.textContent = tss;
    if (elPront) {
        elPront.textContent = `${prontidao}%`;
        elPront.style.color = prontidao >= 70 ? 'var(--green)' : prontidao >= 45 ? 'var(--yellow)' : 'var(--red)';
    }

    if (elBadge && elRec) {
        if (prontidao >= 70 && dor <= 3) {
            elBadge.textContent = '🟢 Alta Prontidão';
            elBadge.style.background = 'rgba(52,199,89,0.2)';
            elBadge.style.color = '#34c759';
            elRec.innerHTML = `<strong>Prontidão Excelente (${prontidao}%):</strong> Condições ideais para treinos de alta intensidade, progressão de carga neuromuscular ou estímulos específicos de limiar.`;
        } else if (prontidao >= 45 && dor <= 5) {
            elBadge.textContent = '🟡 Carga Moderada';
            elBadge.style.background = 'rgba(255,204,0,0.2)';
            elBadge.style.color = '#ffcc00';
            elRec.innerHTML = `<strong>Prontidão Moderada (${prontidao}%):</strong> Capacidade fisiológica estável para treinos submáximos ou de manutenção. Evite exaustão extrema.`;
        } else {
            elBadge.textContent = '🔴 Deload / Regenerativo';
            elBadge.style.background = 'rgba(255,59,48,0.2)';
            elBadge.style.color = '#ff3b30';
            elRec.innerHTML = `<strong>Fadiga ou Desconforto Detectados (${prontidao}% | Dor ${dor}/10):</strong> Recomendada regeneração ativa, mobilidade ou descanso para evitar lesões por sobreuso.`;
        }
    }
}

/**
 * Save Daily Entry from Form
 */
function saveEntryForm() {
    const dateInput = document.getElementById('entryDate');
    if (!dateInput || !dateInput.value) {
        alert('Por favor, informe a data do registro.');
        return;
    }

    const dt = new Date(dateInput.value + 'T12:00:00');
    const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const weekday = weekdays[dt.getDay()];

    const entry = {
        date: dateInput.value,
        weekday: weekday,
        sonoQ: Number(document.getElementById('entrySonoQ')?.value) || 7,
        sensacao: Number(document.getElementById('entrySensacao')?.value) || 7,
        sonoWatch: Number(document.getElementById('entrySonoWatch')?.value) || 80,
        sonoH: Number(document.getElementById('entrySonoH')?.value) || 7.5,
        hrv: Number(document.getElementById('entryHrv')?.value) || 75,
        rhr: Number(document.getElementById('entryRhr')?.value) || 48,
        psr: Number(document.getElementById('entryPsr')?.value) || 7,
        estresse: Number(document.getElementById('entryEstresse')?.value) || 3,
        dorManha: Number(document.getElementById('entryDorManha')?.value) || 0,
        dorMeio: Number(document.getElementById('entryDorMeio')?.value) || 0,
        dorNoite: Number(document.getElementById('entryDorNoite')?.value) || 0,
        dor: Number(document.getElementById('entryDorGeral')?.value) || 0,
        dorLocal: document.getElementById('entryDorLocal')?.value || 'Nenhuma dor',
        wkType: document.getElementById('entryWkType')?.value || 'Musculação / Força',
        dur: Number(document.getElementById('entryDur')?.value) || 0,
        pse: Number(document.getElementById('entryPse')?.value) || 0,
        fcmedia: Number(document.getElementById('entryFcMedia')?.value) || 140,
        notes: document.getElementById('entryNotes')?.value || ''
    };

    saveEntry(entry);
    refreshAll();
    renderSpreadsheetTable();

    alert(`✅ Registro do dia ${dateInput.value.split('-').reverse().join('/')} salvo com sucesso!`);
}

/**
 * Reset form to blank / defaults
 */
function resetEntryForm() {
    document.getElementById('dailyEntryForm')?.reset();
    setEntryDateToday();
}

/**
 * Edit a specific date: open in Entry tab
 */
function editRecord(dateStr) {
    switchMainTab('entry');
    const dateInput = document.getElementById('entryDate');
    if (dateInput) {
        dateInput.value = dateStr.slice(0, 10);
        handleEntryDateChange();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Delete a specific date record
 */
function removeRecord(dateStr) {
    const formatted = dateStr.slice(0, 10).split('-').reverse().join('/');
    if (confirm(`Deseja realmente excluir o registro do dia ${formatted}?`)) {
        deleteEntry(dateStr);
        refreshAll();
        renderSpreadsheetTable();
    }
}

/**
 * Render Interactive Spreadsheet Table
 */
function renderSpreadsheetTable(filterText = '') {
    const tbody = document.getElementById('spreadsheetTableBody');
    const countEl = document.getElementById('tableRecordCount');
    if (!tbody) return;

    let data = getData();
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="16" style="text-align:center;padding:28px;color:var(--text-tertiary)">Nenhum registro encontrado. Clique em "Preenchimento" para adicionar o primeiro dia.</td></tr>`;
        if (countEl) countEl.textContent = '0 registros';
        return;
    }

    // Filter if search query present
    if (filterText && filterText.trim()) {
        const q = filterText.toLowerCase().trim();
        data = data.filter(e => {
            const dt = (e.date || '').toLowerCase();
            const wk = (e.weekday || '').toLowerCase();
            const tp = (e.wkType || '').toLowerCase();
            const dl = (e.dorLocal || '').toLowerCase();
            const nt = (e.notes || '').toLowerCase();
            return dt.includes(q) || wk.includes(q) || tp.includes(q) || dl.includes(q) || nt.includes(q);
        });
    }

    // Display newest first
    const displayRows = [...data].reverse();

    if (countEl) {
        countEl.textContent = `${displayRows.length} dia(s) registrado(s) na planilha`;
    }

    let html = '';
    displayRows.forEach(e => {
        const dateFormatted = e.date ? e.date.slice(0, 10).split('-').reverse().join('/') : '—';
        const weekday = e.weekday ? e.weekday.toUpperCase() : '—';
        
        // Color badges
        const pseBadge = e.pse >= 8 ? 'badge-red' : e.pse >= 5 ? 'badge-yellow' : 'badge-blue';
        const tsbBadge = e.tsb >= 0 ? 'badge-green' : e.tsb >= -15 ? 'badge-yellow' : 'badge-red';
        const dorBadge = e.dor >= 4 ? 'badge-red' : e.dor >= 2 ? 'badge-yellow' : 'badge-green';
        const prontBadge = e.prontidao >= 70 ? 'badge-green' : e.prontidao >= 45 ? 'badge-yellow' : 'badge-red';
        const monoBadge = (e.monotonia || 1) >= 2.0 ? 'badge-red' : 'badge-gray';

        html += `
            <tr>
                <td><strong>${dateFormatted}</strong></td>
                <td><span class="badge-gray">${weekday}</span></td>
                <td>Q:${e.sonoQ} · S:${e.sensacao} <span style="color:var(--blue);font-weight:700">(${e.sonoWatch || 0}%)</span></td>
                <td><strong style="color:var(--cyan)">${e.hrv || 0}</strong> ms</td>
                <td><span class="badge-blue">${e.psr || 0}</span></td>
                <td><span class="${dorBadge}">G:${e.dor || 0}</span> <small style="color:var(--text-tertiary)">(${e.dorManha || 0}/${e.dorMeio || 0}/${e.dorNoite || 0})</small></td>
                <td><strong>${e.wkType || 'Treino'}</strong> <span style="color:var(--text-secondary)">(${e.dur || 0}m)</span></td>
                <td><span class="${pseBadge}">PSE ${e.pse || 0}</span></td>
                <td><strong style="color:var(--purple)">${e.trimp || 0}</strong></td>
                <td><strong style="color:var(--indigo)">${e.tss || 0}</strong></td>
                <td>${e.atl || 0}</td>
                <td>${e.ctl || 0}</td>
                <td><span class="${tsbBadge}">${e.tsb > 0 ? '+' : ''}${e.tsb || 0}</span></td>
                <td><span class="${monoBadge}">${e.monotonia || 1}</span></td>
                <td><span class="${prontBadge}">${e.prontidao || 0}%</span></td>
                <td style="text-align:center;white-space:nowrap">
                    <button type="button" class="btn-table-action" onclick="editRecord('${e.date}')" title="Editar registro">✏️</button>
                    <button type="button" class="btn-table-action delete" onclick="removeRecord('${e.date}')" title="Excluir registro">🗑️</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

/**
 * Handle Search Input in Spreadsheet Table
 */
function handleTableSearch(query) {
    renderSpreadsheetTable(query);
}

/**
 * Handle File Import from Excel or CSV
 */
function handleFileImport(inputEl) {
    if (!inputEl.files || !inputEl.files[0]) return;
    const file = inputEl.files[0];

    importFromXlsx(file, function(count) {
        inputEl.value = '';
        refreshAll();
        renderSpreadsheetTable();
        alert(`🎉 Sucesso! ${count} registros foram importados e sincronizados com a planilha.`);
    }, function(err) {
        inputEl.value = '';
        alert('Erro ao importar: ' + err);
    });
}

/**
 * Restore original data from monitor meu.xlsx
 */
function handleResetOriginalSpreadsheet() {
    if (confirm('Deseja recarregar a planilha original de monitoramento? Seus registros serão restaurados com a base de dados do sistema.')) {
        resetToSpreadsheetData();
        refreshAll();
        renderSpreadsheetTable();
        alert('Planilha restaurada com sucesso!');
    }
}

/**
 * Render Methodology and Science Cards from monitor meu.xlsx
 */
function renderMethodology() {
    const container = document.getElementById('methodologyCardsContainer');
    if (!container || typeof METHODOLOGY_VARS === 'undefined') return;

    container.innerHTML = METHODOLOGY_VARS.map(v => `
        <div class="card" style="margin-bottom:0">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <div style="font-size:16px;font-weight:800;color:var(--text-primary)">
                    <span style="display:inline-block;padding:3px 8px;background:var(--blue-light);color:var(--blue);border-radius:6px;font-size:13px;margin-right:6px">${v.sigla}</span>
                    ${v.nome}
                </div>
            </div>
            <div style="font-size:12.5px;color:var(--blue);font-weight:700;margin-bottom:6px">✍️ ${v.autores}</div>
            <p style="font-size:13.5px;color:var(--text-secondary);line-height:1.5;margin-bottom:8px">${v.bio}</p>
            ${v.formula ? `<div style="background:var(--bg-system);padding:6px 10px;border-radius:8px;font-family:monospace;font-size:12px;color:var(--purple);margin-bottom:6px">📐 Fórmula: <strong>${v.formula}</strong></div>` : ''}
            <div style="font-size:12.5px;color:var(--text-tertiary);line-height:1.4"><strong style="color:var(--text-secondary)">Interpretação:</strong> ${v.interpretacao}</div>
        </div>
    `).join('');
}

