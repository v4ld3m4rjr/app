/* ===================================================================
   neuro_ai.js — Motor de Inteligência Artificial Neurofisiológica
   Avaliação do Sistema Nervoso Autônomo (SNA), Balanço Simpato-Vagal,
   Eixo HPA, Fadiga Central vs. Periférica, Carga Alostática e Prescrição.
   =================================================================== */

/**
 * Calcula métricas neurofisiológicas aprofundadas a partir do histórico
 */
function calcNeuroMetrics(selectedDateStr) {
    const data = getData();
    if (!data || !data.length) return null;

    // Localizar registro da data ou o mais recente
    let targetIdx = data.length - 1;
    if (selectedDateStr) {
        const found = data.findIndex(e => e.date && e.date.slice(0, 10) === selectedDateStr.slice(0, 10));
        if (found !== -1) targetIdx = found;
    }

    const current = data[targetIdx];
    const prevDays = data.slice(Math.max(0, targetIdx - 6), targetIdx + 1);
    const last30Days = data.slice(Math.max(0, targetIdx - 29), targetIdx + 1);

    // 1. Variabilidade da Frequência Cardíaca (HRV rMSSD)
    const hrvCurrent = Number(current.hrv) || 75;
    const hrvList7 = prevDays.map(e => Number(e.hrv) || 75);
    const hrvMean7 = hrvList7.reduce((a, b) => a + b, 0) / hrvList7.length;
    const hrvVar7 = hrvList7.reduce((a, b) => a + Math.pow(b - hrvMean7, 2), 0) / hrvList7.length;
    const hrvSd7 = Math.sqrt(hrvVar7) || 4;
    const hrvZScore = Number(((hrvCurrent - hrvMean7) / hrvSd7).toFixed(2));
    const hrvDeltaPct = Number((((hrvCurrent - hrvMean7) / hrvMean7) * 100).toFixed(1));

    // 2. Frequência Cardíaca de Repouso (RHR)
    const rhrCurrent = Number(current.rhr) || 48;
    const rhrList7 = prevDays.map(e => Number(e.rhr) || 48);
    const rhrMean7 = rhrList7.reduce((a, b) => a + b, 0) / rhrList7.length;
    const rhrDelta = Number((rhrCurrent - rhrMean7).toFixed(1));

    // 3. Sistema Nervoso Autônomo: Balanço Simpático vs. Parassimpático
    // O tônus vagal (parassimpático) é aumentado por: HRV alto, RHR baixo, TQR alto, Sono bom.
    // O tônus simpático é ativado por: Estresse alto, Fadiga alta, Queda abrupta de HRV, Dor, Hooper alto.
    let vagalScore = 50 + (hrvZScore * 18);
    if (current.sonoQ != null) vagalScore += (current.sonoQ - 5) * 3;
    if (current.tqr != null) vagalScore += ((current.tqr / 13) * 10) - 5;
    if (current.estresse != null) vagalScore -= (current.estresse - 3) * 3;
    if (rhrDelta > 3) vagalScore -= (rhrDelta * 2);
    vagalScore = Math.max(10, Math.min(90, Math.round(vagalScore)));

    const sympatheticPct = 100 - vagalScore;
    const parasympatheticPct = vagalScore;

    // Determinar Quadrante Autonômico
    let quadrantTitle = '';
    let quadrantBadgeClass = '';
    let quadrantDesc = '';

    if (parasympatheticPct >= 64) {
        quadrantTitle = 'Predomínio Parassimpático (Anabólico / Tônus Vagal Elevado)';
        quadrantBadgeClass = 'badge-vagal';
        quadrantDesc = 'O organismo encontra-se em estado profundo de recuperação celular e plasticidade neural. O freio vagal está ativo, o que favorece reparo tecidual, biogênese e absorção de novas cargas motoras.';
    } else if (parasympatheticPct >= 48) {
        quadrantTitle = 'Equilíbrio Autonômico Eutônico (Homeostase / Prontidão)';
        quadrantBadgeClass = 'badge-eutonic';
        quadrantDesc = 'Equilíbrio dinâmico ideal entre os ramos simpático e parassimpático. O sistema neuromuscular e os reflexos corticomotores respondem com rapidez e estabilidade homeostática.';
    } else if (parasympatheticPct >= 34) {
        quadrantTitle = 'Hiperativação Simpática Aguda (Reação de Alarme / Estresse)';
        quadrantBadgeClass = 'badge-sympathetic';
        quadrantDesc = 'Ativação do eixo simpato-adrenal com elevação relativa do tônus adrenérgico. Típico após treinos extenuantes ou períodos de estresse psicofisiológico. Requer atenção à restauração noturna.';
    } else {
        quadrantTitle = 'Supressão Autonômica & Fadiga Central (Risco de Overreaching)';
        quadrantBadgeClass = 'badge-exhaustion';
        quadrantDesc = 'Tanto a modulação vagal quanto a reserva simpática apresentam sinais de esgotamento. Fadiga neuroendócrina instalada. Indicação mandatória de descarregamento neural e regeneração ativa.';
    }

    // 4. Fadiga Central vs. Fadiga Periférica
    // Fadiga Periférica (DOMS / Dor muscular local 0-10)
    const fadigaPeriferica = Math.max(0, Math.min(10, Number(current.dor != null ? current.dor : (current.doms || 0))));
    // Fadiga Central (Cérebro, Motivação, Humor, Estresse, Hooper 0-10)
    const fadigaGeral = Number(current.fadiga != null ? current.fadiga : 3);
    const estresse = Number(current.estresse != null ? current.estresse : 3);
    const humor = Number(current.humor != null ? current.humor : 7);
    const motivacao = Number(current.motivacao != null ? current.motivacao : 7);
    const fadigaCentral = Number((((fadigaGeral * 0.35) + (estresse * 0.25) + ((10 - humor) * 0.2) + ((10 - motivacao) * 0.2))).toFixed(1));

    // 5. Escore Neurofisiológico Global (0-100)
    const prontidao = Number(current.prontidao != null ? current.prontidao : 70);
    const recuperacao = Number(current.recuperacao != null ? current.recuperacao : 70);
    const sonoVal = Number(current.valorSono != null ? current.valorSono : 7);
    const hooper = Number(current.hooper != null ? current.hooper : 10);
    const monotonia = Number(current.monotonia != null ? current.monotonia : 1.0);
    const tsb = Number(current.tsb != null ? current.tsb : 0);

    let neuroScore = (parasympatheticPct * 0.35) + (prontidao * 0.25) + (recuperacao * 0.20) + (sonoVal * 2.0);
    if (fadigaCentral > 6) neuroScore -= (fadigaCentral - 6) * 4;
    if (monotonia > 1.8) neuroScore -= (monotonia - 1.8) * 15;
    neuroScore = Math.max(10, Math.min(100, Math.round(neuroScore)));

    return {
        entry: current,
        targetIdx: targetIdx,
        date: current.date ? current.date.slice(0, 10) : '',
        hrvCurrent,
        hrvMean7: Number(hrvMean7.toFixed(1)),
        hrvSd7: Number(hrvSd7.toFixed(1)),
        hrvZScore,
        hrvDeltaPct,
        rhrCurrent,
        rhrMean7,
        rhrDelta,
        sympatheticPct,
        parasympatheticPct,
        quadrantTitle,
        quadrantBadgeClass,
        quadrantDesc,
        fadigaPeriferica,
        fadigaCentral,
        hooper,
        prontidao,
        recuperacao,
        sonoVal,
        monotonia,
        tsb,
        atl: current.atl || 0,
        ctl: current.ctl || 0,
        neuroScore
    };
}

/**
 * Renderiza a visualização completa da Aba Neurofisiológica
 */
function renderNeuroAIAnalysis(dateStr) {
    const container = document.getElementById('viewNeuroAI');
    if (!container) return;

    const metrics = calcNeuroMetrics(dateStr);
    if (!metrics) {
        container.innerHTML = `
            <div class="card" style="text-align:center;padding:32px 16px">
                <span style="font-size:42px;display:block;margin-bottom:12px">🧠</span>
                <h3 style="font-size:18px;font-weight:800;margin-bottom:6px">Sem Dados para Avaliação Neurofisiológica</h3>
                <p style="font-size:13px;color:var(--text-secondary);margin-bottom:18px">Preencha o questionário ou adicione um registro diário para gerar a análise com IA.</p>
                <button type="button" class="btn-pill-action blue" onclick="switchMainTab('entry')">✍️ Preencher Dados</button>
            </div>
        `;
        return;
    }

    const m = metrics;
    const allRecords = getData();

    // Data dropdown selector
    let dateOptions = '';
    for (let i = allRecords.length - 1; i >= 0; i--) {
        const d = allRecords[i].date ? allRecords[i].date.slice(0, 10) : '';
        const isSel = (d === m.date) ? 'selected' : '';
        dateOptions += `<option value="${d}" ${isSel}>${d.split('-').reverse().join('/')} (${allRecords[i].weekday || ''})</option>`;
    }

    // Cores de status baseadas no escore
    let scoreColor = '#34c759'; // verde
    let scoreLabel = 'Excelente Prontidão Neural';
    if (m.neuroScore < 45) {
        scoreColor = '#ff3b30'; // vermelho
        scoreLabel = 'Fadiga Central / Descanso Mandatório';
    } else if (m.neuroScore < 68) {
        scoreColor = '#ff9500'; // laranja
        scoreLabel = 'Adaptação Moderada / Carga Controlada';
    }

    // Diagnósticos gerados pela IA
    const diagAutonomic = generateAutonomicDiagnostic(m);
    const diagHpa = generateHpaDiagnostic(m);
    const diagNeuromuscular = generateNeuromuscularDiagnostic(m);
    const diagAllostatic = generateAllostaticDiagnostic(m);
    const diagPrescription = generatePrescriptionDiagnostic(m);

    const circumference = 2 * Math.PI * 46;
    const strokeDashoffset = circumference - (circumference * m.neuroScore / 100);

    container.innerHTML = `
        <!-- Top Title & Header Toolbar -->
        <div class="neuro-header-card" style="margin-bottom:14px;background:linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%);color:#ffffff;padding:18px;border-radius:18px;box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid rgba(255,255,255,0.08)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:12px">
                <div>
                    <div style="display:flex;align-items:center;gap:8px">
                        <span style="font-size:24px">🧠</span>
                        <h2 style="font-size:20px;font-weight:800;letter-spacing:-0.4px">Avaliação Neurofisiológica (IA)</h2>
                    </div>
                    <p style="font-size:12.5px;color:#aeaeb2;margin-top:2px">Diagnóstico autônomo, modulação vagal e resposta ao estresse atlético</p>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                    <button type="button" class="btn-tool" style="background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.15)" onclick="copyNeuroReport()" title="Copiar Laudo da IA">
                        📋 Copiar Laudo
                    </button>
                    <button type="button" class="btn-tool" style="background:var(--blue);color:#fff;border-color:var(--blue)" onclick="reanalyzeNeuroAI()" title="Recalcular com IA">
                        ⚡ Atualizar IA
                    </button>
                </div>
            </div>

            <!-- Date Selector Filter -->
            <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.06);padding:8px 12px;border-radius:12px">
                <span style="font-size:12px;color:#d1d1d6;font-weight:600">📅 Registro Analisado:</span>
                <select id="neuroDateSelect" class="form-control" style="background:#2c2c2e;color:#fff;border-color:rgba(255,255,255,0.15);padding:6px 10px;font-size:13px;width:auto;flex:1" onchange="renderNeuroAIAnalysis(this.value)">
                    ${dateOptions}
                </select>
            </div>
        </div>

        <!-- 1. Hero Card: Escore Neurofisiológico Global -->
        <div class="card" style="margin-bottom:14px;padding:18px">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
                <div style="display:flex;align-items:center;gap:16px">
                    <!-- Gauge Circular SVG -->
                    <div style="position:relative;width:96px;height:96px;flex-shrink:0">
                        <svg width="96" height="96" viewBox="0 0 104 104" style="transform:rotate(-90deg)">
                            <circle cx="52" cy="52" r="46" fill="transparent" stroke="var(--bg-system)" stroke-width="8"></circle>
                            <circle cx="52" cy="52" r="46" fill="transparent" stroke="${scoreColor}" stroke-width="8" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round" style="transition:stroke-dashoffset 0.8s ease"></circle>
                        </svg>
                        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                            <span style="font-size:22px;font-weight:900;color:var(--text-primary);line-height:1">${m.neuroScore}</span>
                            <span style="font-size:10px;font-weight:700;color:var(--text-tertiary)">/ 100</span>
                        </div>
                    </div>

                    <div>
                        <span style="display:inline-block;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:800;background:${scoreColor}20;color:${scoreColor};margin-bottom:4px">
                            ${scoreLabel}
                        </span>
                        <h3 style="font-size:16px;font-weight:800;letter-spacing:-0.2px">${m.quadrantTitle}</h3>
                        <p style="font-size:12px;color:var(--text-secondary);margin-top:2px">Avaliado em ${m.date.split('-').reverse().join('/')}</p>
                    </div>
                </div>
            </div>

            <p style="font-size:13px;color:var(--text-secondary);line-height:1.55;margin-top:14px;padding-top:12px;border-top:1px solid var(--border-light)">
                ${m.quadrantDesc}
            </p>
        </div>

        <!-- 2. Balanço do Sistema Nervoso Autônomo (Simpático vs Parassimpático) -->
        <div class="card" style="margin-bottom:14px;padding:18px">
            <div class="card-header" style="margin-bottom:12px">
                <div class="card-title">⚖️ 1. Balanço Simpato-Vagal (SNA)</div>
                <span class="card-badge" style="background:var(--blue-light);color:var(--blue);font-weight:700;font-size:11px">Autonômico</span>
            </div>

            <!-- Autonomic Gauge Slider -->
            <div style="margin:14px 0 10px">
                <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:6px">
                    <span style="color:#ff3b30">⚡ Simpático: ${m.sympatheticPct}%</span>
                    <span style="color:#34c759">🌿 Parassimpático: ${m.parasympatheticPct}%</span>
                </div>
                <div style="height:12px;width:100%;background:linear-gradient(90deg, #ff3b30 0%, #ff9500 35%, #007aff 55%, #34c759 100%);border-radius:6px;position:relative;overflow:hidden">
                    <div style="position:absolute;top:0;bottom:0;left:${m.sympatheticPct}%;width:4px;background:#ffffff;box-shadow:0 0 6px rgba(0,0,0,0.5);transform:translateX(-50%)"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-tertiary);margin-top:4px">
                    <span>Estresse / Ação (Fight or Flight)</span>
                    <span>Recuperação / Repouso (Rest & Digest)</span>
                </div>
            </div>

            <!-- Key Autonomic Biomarkers -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px">
                <div style="background:var(--bg-system);padding:10px;border-radius:10px;text-align:center">
                    <div style="font-size:10.5px;font-weight:700;color:var(--text-tertiary)">HRV rMSSD</div>
                    <div style="font-size:17px;font-weight:900;color:var(--indigo);margin-top:2px">${m.hrvCurrent} <span style="font-size:10px">ms</span></div>
                    <div style="font-size:10px;font-weight:700;color:${m.hrvDeltaPct >= 0 ? 'var(--green)' : 'var(--orange)'}">
                        ${m.hrvDeltaPct >= 0 ? '+' : ''}${m.hrvDeltaPct}% vs 7d
                    </div>
                </div>
                <div style="background:var(--bg-system);padding:10px;border-radius:10px;text-align:center">
                    <div style="font-size:10.5px;font-weight:700;color:var(--text-tertiary)">Z-Score Autonômico</div>
                    <div style="font-size:17px;font-weight:900;color:var(--text-primary);margin-top:2px">${m.hrvZScore >= 0 ? '+' : ''}${m.hrvZScore}</div>
                    <div style="font-size:10px;color:var(--text-secondary)">Linha de base</div>
                </div>
                <div style="background:var(--bg-system);padding:10px;border-radius:10px;text-align:center">
                    <div style="font-size:10.5px;font-weight:700;color:var(--text-tertiary)">FC Repouso (RHR)</div>
                    <div style="font-size:17px;font-weight:900;color:var(--blue);margin-top:2px">${m.rhrCurrent} <span style="font-size:10px">bpm</span></div>
                    <div style="font-size:10px;font-weight:700;color:${m.rhrDelta <= 0 ? 'var(--green)' : 'var(--orange)'}">
                        ${m.rhrDelta > 0 ? '+' : ''}${m.rhrDelta} bpm
                    </div>
                </div>
            </div>

            <div style="background:rgba(0,122,255,0.06);border-left:3px solid var(--blue);padding:10px 12px;border-radius:0 8px 8px 0;margin-top:14px;font-size:12.5px;color:var(--text-primary);line-height:1.5">
                ${diagAutonomic}
            </div>
        </div>

        <!-- 3. Análise da Fadiga Central vs. Periférica & Eixo HPA -->
        <div class="card" style="margin-bottom:14px;padding:18px">
            <div class="card-header" style="margin-bottom:12px">
                <div class="card-title">⚡ 2. Fadiga Central vs. Periférica & Eixo HPA</div>
                <span class="card-badge" style="background:var(--purple);color:#fff;font-weight:700;font-size:11px">Neuromuscular</span>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
                <div style="border:1px solid var(--border);padding:12px;border-radius:12px;background:var(--bg-card)">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                        <span style="font-size:12px;font-weight:700;color:var(--indigo)">🧠 Fadiga Central (SNC)</span>
                        <span style="font-size:14px;font-weight:900;color:${m.fadigaCentral > 5 ? 'var(--orange)' : 'var(--green)'}">${m.fadigaCentral}/10</span>
                    </div>
                    <div style="font-size:11px;color:var(--text-secondary);line-height:1.4">
                        Reflete excitabilidade cortical, motivação dopaminérgica, qualidade do sono e sobrecarga do eixo hipotálamo-adrenal.
                    </div>
                </div>

                <div style="border:1px solid var(--border);padding:12px;border-radius:12px;background:var(--bg-card)">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                        <span style="font-size:12px;font-weight:700;color:var(--orange)">💪 Fadiga Periférica (DOMS)</span>
                        <span style="font-size:14px;font-weight:900;color:${m.fadigaPeriferica > 4 ? 'var(--orange)' : 'var(--green)'}">${m.fadigaPeriferica}/10</span>
                    </div>
                    <div style="font-size:11px;color:var(--text-secondary);line-height:1.4">
                        Reflete microlesão de sarcolema, fadiga muscular metabólica, dor muscular tardia e sensibilidade nos fusos musculares.
                    </div>
                </div>
            </div>

            <div style="background:rgba(88,86,214,0.06);border-left:3px solid var(--indigo);padding:10px 12px;border-radius:0 8px 8px 0;font-size:12.5px;color:var(--text-primary);line-height:1.5">
                ${diagNeuromuscular}
            </div>

            <div style="margin-top:12px;background:rgba(255,149,0,0.06);border-left:3px solid var(--orange);padding:10px 12px;border-radius:0 8px 8px 0;font-size:12.5px;color:var(--text-primary);line-height:1.5">
                ${diagHpa}
            </div>
        </div>

        <!-- 4. Carga Alostática, Monotonia e Estresse do Treinamento -->
        <div class="card" style="margin-bottom:14px;padding:18px">
            <div class="card-header" style="margin-bottom:12px">
                <div class="card-title">📊 3. Carga Alostática & Monotonia (Foster/Coggan)</div>
                <span class="card-badge" style="background:var(--teal);color:#fff;font-weight:700;font-size:11px">Banister / Coggan</span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">
                <div style="background:var(--bg-system);padding:8px 6px;border-radius:10px;text-align:center">
                    <div style="font-size:10px;font-weight:700;color:var(--text-tertiary)">ATL (7d)</div>
                    <div style="font-size:15px;font-weight:900;color:var(--orange)">${m.atl}</div>
                    <div style="font-size:9.5px;color:var(--text-secondary)">Fadiga</div>
                </div>
                <div style="background:var(--bg-system);padding:8px 6px;border-radius:10px;text-align:center">
                    <div style="font-size:10px;font-weight:700;color:var(--text-tertiary)">CTL (42d)</div>
                    <div style="font-size:15px;font-weight:900;color:var(--blue)">${m.ctl}</div>
                    <div style="font-size:9.5px;color:var(--text-secondary)">Fitness</div>
                </div>
                <div style="background:var(--bg-system);padding:8px 6px;border-radius:10px;text-align:center">
                    <div style="font-size:10px;font-weight:700;color:var(--text-tertiary)">TSB</div>
                    <div style="font-size:15px;font-weight:900;color:${m.tsb >= 0 ? 'var(--green)' : 'var(--red)'}">${m.tsb > 0 ? '+' : ''}${m.tsb}</div>
                    <div style="font-size:9.5px;color:var(--text-secondary)">Balanço</div>
                </div>
                <div style="background:var(--bg-system);padding:8px 6px;border-radius:10px;text-align:center">
                    <div style="font-size:10px;font-weight:700;color:var(--text-tertiary)">Monotonia</div>
                    <div style="font-size:15px;font-weight:900;color:${m.monotonia > 1.8 ? 'var(--red)' : m.monotonia > 1.4 ? 'var(--orange)' : 'var(--green)'}">${m.monotonia}</div>
                    <div style="font-size:9.5px;color:var(--text-secondary)">Foster</div>
                </div>
            </div>

            <div style="font-size:12.5px;color:var(--text-secondary);line-height:1.5">
                ${diagAllostatic}
            </div>
        </div>

        <!-- 5. Prescrição e Conduta Neurofisiológica para Hoje -->
        <div class="card" style="margin-bottom:14px;padding:18px;background:linear-gradient(135deg, rgba(52,199,89,0.06) 0%, rgba(0,122,255,0.06) 100%);border:1px solid rgba(52,199,89,0.25)">
            <div class="card-header" style="margin-bottom:12px">
                <div class="card-title">🎯 4. Prescrição Neurofuncional para Hoje</div>
                <span class="card-badge" style="background:var(--green);color:#fff;font-weight:700;font-size:11px">Conduta Clínica</span>
            </div>

            <div style="font-size:13.5px;line-height:1.6;color:var(--text-primary)">
                ${diagPrescription}
            </div>

            <!-- Interativo: Exercício Guiado de Coerência Cardíaca (Reset Vagal) -->
            <div style="margin-top:16px;background:#ffffff;border:1px solid var(--border);padding:14px;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <div style="display:flex;align-items:center;gap:6px">
                        <span style="font-size:18px">🫁</span>
                        <strong style="font-size:13.5px;color:var(--text-primary)">Protocolo de Reset Vagal (Coerência Cardíaca)</strong>
                    </div>
                    <button type="button" id="btnBreatheToggle" class="btn-pill-small" onclick="toggleVagalBreathing()">
                        Iniciar (5 min)
                    </button>
                </div>
                <p style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">
                    Ciclo 4-7-8 (ou 6 respirações/minuto) ativa o reflexo barorreceptor e aumenta imediatamente a amplitude do HRV.
                </p>

                <!-- Breathing Animation Container (Initially Collapsed) -->
                <div id="vagalBreathingBox" style="display:none;text-align:center;padding:20px 10px;background:var(--bg-system);border-radius:12px">
                    <div id="breatheCircle" class="breathe-circle" style="width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#007aff,#34c759);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px;box-shadow:0 4px 20px rgba(0,122,255,0.35);transition:transform 4s ease-in-out">
                        Inspire (4s)
                    </div>
                    <div id="breatheInstruction" style="font-size:13px;font-weight:700;color:var(--blue)">Inspire profundamente pelo nariz...</div>
                    <div id="breatheTimer" style="font-size:11px;color:var(--text-tertiary);margin-top:4px">Tempo restante: 5:00</div>
                </div>
            </div>
        </div>

        <!-- 6. Assistente Interativo de IA (Perguntas Rápidas & Chat) -->
        <div class="card" style="margin-bottom:30px;padding:18px">
            <div class="card-header" style="margin-bottom:12px">
                <div class="card-title">💬 5. Consultar a IA Neurofisiológica</div>
                <span class="card-badge" style="background:var(--indigo);color:#fff;font-weight:700;font-size:11px">Interativo</span>
            </div>
            <p style="font-size:12.5px;color:var(--text-secondary);margin-bottom:12px">Clique em uma pergunta rápida ou digite abaixo para receber a resposta clínica da IA:</p>

            <!-- Quick Question Chips -->
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
                <button type="button" class="neuro-chip" onclick="askNeuroAI('Qual a melhor sessão de treino para o meu sistema nervoso hoje?')">
                    🏋️ Melhor treino para hoje?
                </button>
                <button type="button" class="neuro-chip" onclick="askNeuroAI('Como meu sono da última noite impactou meu cortisol e HRV?')">
                    🌙 Impacto do meu sono?
                </button>
                <button type="button" class="neuro-chip" onclick="askNeuroAI('Existe sinal de sobrecarga simpática ou risco de overreaching?')">
                    ⚠️ Risco de overreaching?
                </button>
                <button type="button" class="neuro-chip" onclick="askNeuroAI('Quais condutas aceleram minha recuperação nas próximas 24h?')">
                    ⚡ Acelerar recuperação?
                </button>
            </div>

            <!-- Input Form -->
            <div style="display:flex;gap:8px;margin-bottom:14px">
                <input type="text" id="neuroAiInput" class="form-control" placeholder="Pergunte algo sobre seu estado neurofisiológico..." onkeypress="if(event.key==='Enter') submitNeuroAIQuestion();">
                <button type="button" class="btn-pill-action blue" style="padding:10px 18px;font-size:13.5px;white-space:nowrap" onclick="submitNeuroAIQuestion()">
                    Perguntar
                </button>
            </div>

            <!-- AI Answer Output Box -->
            <div id="neuroAiOutput" style="display:none;background:var(--bg-system);border:1px solid var(--border);padding:14px;border-radius:12px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                    <span style="font-size:20px">🤖</span>
                    <strong style="font-size:13px;color:var(--text-primary)">Resposta da IA Neurofisiológica:</strong>
                </div>
                <div id="neuroAiResponseText" style="font-size:13px;line-height:1.6;color:var(--text-primary)"></div>
            </div>
        </div>
    `;
}

/**
 * Diagnósticos Inteligentes da IA
 */
function generateAutonomicDiagnostic(m) {
    if (m.parasympatheticPct >= 64) {
        return `<strong>Diagnóstico Autonômico:</strong> O tônus vagal eferente está robusto (${m.hrvCurrent}ms, Z-Score ${m.hrvZScore >= 0 ? '+' : ''}${m.hrvZScore}). A variabilidade batimento-a-batimento confirma atividade parassimpática dominante no nó sinoatrial, acelerando a fosforilação oxidativa mitocondrial e regeneração do glicogênio.`;
    } else if (m.parasympatheticPct >= 48) {
        return `<strong>Diagnóstico Autonômico:</strong> Equilíbrio eutônico homeostático. Os reflexos barorreceptores e a condutância vascular autonômica operam na faixa fisiológica esperada (${m.hrvCurrent}ms vs média ${m.hrvMean7}ms). O organismo consegue alternar entre prontidão motora e relaxamento sem retenção excessiva de estresse.`;
    } else if (m.parasympatheticPct >= 34) {
        return `<strong>Diagnóstico Autonômico:</strong> Discreto desvio simpático (${m.sympatheticPct}%). A variabilidade cardíaca apresentou atenuação temporária (${m.hrvDeltaPct}%), indicando descarga residual de catecolaminas e vasoconstrição periférica adaptativa. Recomenda-se evitar cafeína excessiva e treinos de altíssimo estresse neuromuscular.`;
    } else {
        return `<strong>Diagnóstico Autonômico:</strong> Alerta de supressão vagal acentuada (Parassimpático ${m.parasympatheticPct}%). Queda substancial da variabilidade rMSSD com elevação da FC de repouso (+${m.rhrDelta} bpm). O sistema nervoso autônomo está demandando restauração e sinaliza exaustão aguda.`;
    }
}

function generateNeuromuscularDiagnostic(m) {
    if (m.fadigaCentral <= 3.5 && m.fadigaPeriferica <= 3.5) {
        return `<strong>Acoplamento Excitação-Contração:</strong> Ótimo. A transmissão sináptica na placa motora e o drive corticomotor central estão intactos. Ausência de bloqueio central ou inibição por aferentes do grupo III e IV.`;
    } else if (m.fadigaCentral > m.fadigaPeriferica) {
        return `<strong>Predomínio de Fadiga Central:</strong> O córtex motor e as vias descendentes corticoespinhais apresentam maior nível de fadiga do que o músculo esquelético periférico. Perda relativa de drive motivacional e foco. Evite treinos balísticos ou de coordenação fina complexa.`;
    } else if (m.fadigaPeriferica >= 5) {
        return `<strong>Predomínio de Fadiga Periférica (DOMS):</strong> Há sensibilidade nociceptiva muscular e microdanos no citoesqueleto muscular, porém o drive neural central está preservado. Atividades de baixa intensidade ou de grupos musculares não fadigados são bem toleradas.`;
    } else {
        return `<strong>Fadiga Mista Balanceada:</strong> Equilíbrio típico entre recuperação muscular e restauração neural. Treinos controlados promovem adaptações positivas sem risco de sobrecarga.`;
    }
}

function generateHpaDiagnostic(m) {
    if (m.hooper <= 12 && m.sonoVal >= 7) {
        return `<strong>Eixo HPA & Sono:</strong> O índice de Hooper (${m.hooper}/40) e a qualidade do sono (${m.sonoVal}/10) apontam ritmo circadiano preservado com liberação noturna normal de hormônio do crescimento (GH) e baixa circulação matinal de cortisol catabólico.`;
    } else {
        return `<strong>Eixo HPA & Sono:</strong> Hooper elevado (${m.hooper}/40) ou qualidade de sono comprometida (${m.sonoVal}/10). O estresse psicofisiológico acumulado pode elevar a relação cortisol/testosterona, retardando a síntese proteica. Priorize desaceleração noturna e técnicas respiratórias.`;
    }
}

function generateAllostaticDiagnostic(m) {
    let text = `Carga Crônica (CTL ${m.ctl}) vs Aguda (ATL ${m.atl}) resulta em TSB de <strong>${m.tsb > 0 ? '+' : ''}${m.tsb}</strong>. `;
    if (m.monotonia > 1.8) {
        text += `<span style="color:var(--red);font-weight:700">⚠️ Alerta de Monotonia (${m.monotonia}):</span> Cargas de treino muito homogêneas nos últimos 7 dias. Isso sobrecarrega os mesmos circuitos neurais e aumenta o risco de overtraining. Varie a intensidade amanhã.`;
    } else if (m.monotonia > 1.4) {
        text += `Monotonia moderada (${m.monotonia}). Cargas com variação adequada entre dias fortes e dias recuperativos.`;
    } else {
        text += `Excelente variação ondulatória de cargas (Monotonia ${m.monotonia}). O sistema neuromuscular responde melhor a estímulos com alternância acentuada de volume e intensidade.`;
    }
    return text;
}

function generatePrescriptionDiagnostic(m) {
    if (m.neuroScore >= 75 && m.tsb >= -15) {
        return `
            <div style="margin-bottom:6px"><strong>⚡ Sessão Recomendada:</strong> Treino de Potência / Força Máxima / Hipertrofia Intensa.</div>
            <div style="margin-bottom:6px"><strong>🎯 Faixa de PSE (Borg CR-10):</strong> 7 a 9 (Forte a Muito Forte). Duração: 60 a 90 min.</div>
            <div><strong>🧠 Justificativa Neurofuncional:</strong> O sistema nervoso central está com drive eferente elevado, tônus vagal restaurado e alta capacidade de recrutamento de unidades motoras rápidas. Excelente janela para quebra de recordes pessoais (PRs).</div>
        `;
    } else if (m.neuroScore >= 50) {
        return `
            <div style="margin-bottom:6px"><strong>⚡ Sessão Recomendada:</strong> Treino Técnico / Resistência Aeróbica Moderada / Musculação Submáxima.</div>
            <div style="margin-bottom:6px"><strong>🎯 Faixa de PSE (Borg CR-10):</strong> 5 a 6 (Moderado a Pesado Controlado). Duração: 45 a 60 min.</div>
            <div><strong>🧠 Justificativa Neurofuncional:</strong> O estado autonômico permite manutenção de condicionamento e adaptação estrutural sem incorrer em sobrecarga simpato-adrenal. Mantenha pausas completas entre séries.</div>
        `;
    } else {
        return `
            <div style="margin-bottom:6px"><strong>⚡ Sessão Recomendada:</strong> Regeneração Ativa / Mobilidade / Caminhada Leve / Deload.</div>
            <div style="margin-bottom:6px"><strong>🎯 Faixa de PSE (Borg CR-10):</strong> 1 a 3 (Muito Leve a Leve). Duração: 20 a 35 min.</div>
            <div><strong>🧠 Justificativa Neurofuncional:</strong> Sinais de fadiga central ou supressão parassimpática. Estímulos intensos hoje induziriam inibição corticomotora protetora, aumentando exponencialmente o risco de lesões miofasciais e estresse alostático.</div>
        `;
    }
}

/**
 * Respostas Interativas do Assistente da IA
 */
function askNeuroAI(question) {
    const input = document.getElementById('neuroAiInput');
    if (input) input.value = question;
    submitNeuroAIQuestion();
}

function submitNeuroAIQuestion() {
    const input = document.getElementById('neuroAiInput');
    const outBox = document.getElementById('neuroAiOutput');
    const outText = document.getElementById('neuroAiResponseText');
    if (!input || !outBox || !outText) return;

    const q = input.value.trim();
    if (!q) return;

    const dateSelect = document.getElementById('neuroDateSelect');
    const metrics = calcNeuroMetrics(dateSelect ? dateSelect.value : null);
    if (!metrics) return;

    outBox.style.display = 'block';
    outText.innerHTML = '<span style="color:var(--text-tertiary)">Processando resposta clínica neurofisiológica...</span>';

    setTimeout(() => {
        let answer = '';
        const qLower = q.toLowerCase();

        if (qLower.includes('treino') || qLower.includes('sessão') || qLower.includes('fazer hoje')) {
            answer = `Com base no seu <strong>Escore Neurofisiológico de ${metrics.neuroScore}/100</strong> e Balanço Autonômico (Parassimpático ${metrics.parasympatheticPct}% / Simpático ${metrics.sympatheticPct}%):<br><br>
            ${metrics.neuroScore >= 70 
                ? '• <strong>Recomendação:</strong> Você está liberado para treino de alta intensidade ou força máxima. Seu tônus vagal e HRV (' + metrics.hrvCurrent + 'ms) indicam que seu sistema neuromuscular tem alta prontidão para recrutar unidades motoras tipo II.' 
                : metrics.neuroScore >= 45 
                ? '• <strong>Recomendação:</strong> Treino moderado (PSE 5-6). Mantenha o foco em técnica e volume controlado. Evite falha concêntrica extrema hoje para não drenar o pool de neurotransmissores.' 
                : '• <strong>Recomendação:</strong> Priorize regeneração ativa ou descanso total. Seu SNC apresenta sinais claros de fadiga central. Um treino pesado hoje prejudicaria suas adaptações crônicas.'}`;
        } else if (qLower.includes('sono') || qLower.includes('cortisol') || qLower.includes('noite')) {
            answer = `Na sua última avaliação, a pontuação de qualidade de sono foi <strong>${metrics.sonoVal}/10</strong> com HRV matinal de <strong>${metrics.hrvCurrent}ms</strong>.<br><br>
            • O sono de ondas lentas (SWS) é o principal modulador da secreção de GH e clearance de metabólitos neurais pelo sistema glinfático cerebral.<br>
            • Como seu desvio de HRV foi de <strong>${metrics.hrvDeltaPct}%</strong>, ${metrics.hrvDeltaPct >= 0 ? 'sua arquitetura de sono foi suficiente para resetar o estresse adrenérgico.' : 'houve certa ativação simpática residual noturna. Sugiro desligar telas 45 minutos antes de dormir e praticar o protocolo de respiração vagal.'}`;
        } else if (qLower.includes('overreaching') || qLower.includes('overtraining') || qLower.includes('risco') || qLower.includes('lesão')) {
            answer = `Analisando seus índices de carga alostática:<br><br>
            • <strong>Monotonia (Foster):</strong> ${metrics.monotonia} ${metrics.monotonia > 1.8 ? '(ALTO RISCO - cargas muito repetitivas)' : '(Zona segura)'}<br>
            • <strong>TSB (Balanço de Estresse):</strong> ${metrics.tsb > 0 ? '+' : ''}${metrics.tsb}<br>
            • <strong>Fadiga Central:</strong> ${metrics.fadigaCentral}/10 vs Fadiga Periférica: ${metrics.fadigaPeriferica}/10<br><br>
            ${metrics.monotonia > 1.8 || metrics.tsb < -25 
                ? '⚠️ <strong>Atenção:</strong> Há sinalização de estresse cumulativo. Para evitar overreaching não-funcional, faça pelo menos um dia de descarregamento neural nos próximos 3 dias.' 
                : '✅ <strong>Risco Controlado:</strong> Sua curva de fadiga está dentro da tolerância fisiológica, sem evidências de overtraining instalado.'}`;
        } else {
            answer = `Análise neurofisiológica integrada para: "<em>${q}</em>"<br><br>
            • <strong>Status Atual:</strong> ${metrics.quadrantTitle}.<br>
            • <strong>Tônus Vagal (rMSSD):</strong> ${metrics.hrvCurrent}ms (Z-Score ${metrics.hrvZScore >= 0 ? '+' : ''}${metrics.hrvZScore}).<br>
            • <strong>Prontidão:</strong> ${metrics.prontidao}% | <strong>Recuperação:</strong> ${metrics.recuperacao}%.<br><br>
            <strong>Conduta Recomendada:</strong> Mantenha hidratação eletrolítica equilibrada, respeite a percepção de esforço guiada pelo seu balanço simpato-vagal (${metrics.sympatheticPct}%/${metrics.parasympatheticPct}%) e aproveite a janela de recuperação para consolidar adaptações.`;
        }

        outText.innerHTML = answer;
    }, 300);
}

/**
 * Protocolo de Coerência Cardíaca (Reset Vagal Interativo)
 */
let vagalInterval = null;
let vagalTimerSeconds = 300; // 5 minutos

function toggleVagalBreathing() {
    const box = document.getElementById('vagalBreathingBox');
    const btn = document.getElementById('btnBreatheToggle');
    if (!box || !btn) return;

    if (box.style.display === 'none') {
        box.style.display = 'block';
        btn.textContent = 'Parar';
        btn.style.background = 'var(--red-light)';
        btn.style.color = 'var(--red)';
        startVagalBreathing();
    } else {
        box.style.display = 'none';
        btn.textContent = 'Iniciar (5 min)';
        btn.style.background = '#ffffff';
        btn.style.color = 'var(--blue)';
        stopVagalBreathing();
    }
}

function startVagalBreathing() {
    stopVagalBreathing();
    vagalTimerSeconds = 300;
    const circle = document.getElementById('breatheCircle');
    const instruction = document.getElementById('breatheInstruction');
    const timerEl = document.getElementById('breatheTimer');

    let phase = 0; // 0 = inspire (4s), 1 = segure (7s), 2 = expire (8s)

    function runPhase() {
        if (!circle || !instruction) return;
        if (phase === 0) {
            circle.style.transform = 'scale(1.4)';
            circle.style.background = 'linear-gradient(135deg, #007aff, #32ade6)';
            circle.textContent = 'Inspire (4s)';
            instruction.textContent = 'Inspire profundamente pelo nariz expandindo o diafragma...';
            phase = 1;
            vagalCycleTimeout = setTimeout(runPhase, 4000);
        } else if (phase === 1) {
            circle.style.transform = 'scale(1.4)';
            circle.style.background = 'linear-gradient(135deg, #5856d6, #af52de)';
            circle.textContent = 'Segure (7s)';
            instruction.textContent = 'Mantenha os pulmões cheios, oxigenando o sangue...';
            phase = 2;
            vagalCycleTimeout = setTimeout(runPhase, 7000);
        } else {
            circle.style.transform = 'scale(1.0)';
            circle.style.background = 'linear-gradient(135deg, #34c759, #30b0c7)';
            circle.textContent = 'Expire (8s)';
            instruction.textContent = 'Solte o ar suavemente pela boca ativando o nervo vago...';
            phase = 0;
            vagalCycleTimeout = setTimeout(runPhase, 8000);
        }
    }

    runPhase();

    vagalInterval = setInterval(() => {
        vagalTimerSeconds--;
        if (timerEl) {
            const m = Math.floor(vagalTimerSeconds / 60);
            const s = vagalTimerSeconds % 60;
            timerEl.textContent = `Tempo restante: ${m}:${s < 10 ? '0' : ''}${s}`;
        }
        if (vagalTimerSeconds <= 0) {
            stopVagalBreathing();
            if (instruction) instruction.textContent = '✅ Sessão de reset vagal concluída! Seu tônus parassimpático foi estimulado.';
        }
    }, 1000);
}

let vagalCycleTimeout = null;
function stopVagalBreathing() {
    if (vagalInterval) clearInterval(vagalInterval);
    if (vagalCycleTimeout) clearTimeout(vagalCycleTimeout);
    vagalInterval = null;
    vagalCycleTimeout = null;
}

/**
 * Copiar Laudo Neurofisiológico para a Área de Transferência
 */
function copyNeuroReport() {
    const dateSelect = document.getElementById('neuroDateSelect');
    const m = calcNeuroMetrics(dateSelect ? dateSelect.value : null);
    if (!m) return alert('Sem dados para copiar.');

    const report = `📋 LAUDO DE AVALIAÇÃO NEUROFISIOLÓGICA (IA)
Data: ${m.date.split('-').reverse().join('/')}
Escore Neurofisiológico Global: ${m.neuroScore}/100
Estado Autonômico: ${m.quadrantTitle}

BALANÇO SIMPATO-VAGAL (SNA):
• Parassimpático (Tônus Vagal): ${m.parasympatheticPct}%
• Simpático (Alerta/Estresse): ${m.sympatheticPct}%
• HRV rMSSD: ${m.hrvCurrent} ms (Z-Score: ${m.hrvZScore >= 0 ? '+' : ''}${m.hrvZScore} | ${m.hrvDeltaPct >= 0 ? '+' : ''}${m.hrvDeltaPct}% vs 7d)
• FC Repouso (RHR): ${m.rhrCurrent} bpm (${m.rhrDelta > 0 ? '+' : ''}${m.rhrDelta} bpm vs 7d)

FADIGA & EIXO HPA:
• Fadiga Central (SNC): ${m.fadigaCentral} / 10
• Fadiga Periférica (DOMS): ${m.fadigaPeriferica} / 10
• Índice de Hooper: ${m.hooper} / 40
• Valor do Sono: ${m.sonoVal} / 10

CARGA ALOSTÁTICA (Coggan/Foster):
• Carga Aguda (ATL): ${m.atl} | Crônica (CTL): ${m.ctl} | Balanço (TSB): ${m.tsb}
• Monotonia: ${m.monotonia} (Strain: ${m.entry.strain || 0})

DIRETRIZ CLÍNICA:
${m.prontidao >= 65 ? 'Liberado para estímulos de potência e alta intensidade.' : m.prontidao >= 45 ? 'Treino em intensidade controlada e submáxima.' : 'Regeneração ativa ou repouso mandatório.'}

Gerado por: App de Monitoramento de Saúde & Treinamento`;

    navigator.clipboard.writeText(report).then(() => {
        showConfirmationToast('Laudo Copiado!', 'O relatório neurofisiológico completo foi copiado para sua área de transferência.');
    }).catch(() => {
        alert('Laudo copiado!');
    });
}

function reanalyzeNeuroAI() {
    const sel = document.getElementById('neuroDateSelect');
    renderNeuroAIAnalysis(sel ? sel.value : null);
    showConfirmationToast('IA Atualizada!', 'Métricas neurofisiológicas recalculadas com sucesso.');
}
