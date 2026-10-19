/* ===================================================================
   supabase.js — Supabase Client & Real-time Cloud Sync
   Connected to project: https://abzlmflktdjujtcdxwpg.supabase.co
   =================================================================== */

const DEFAULT_SB_URL = 'https://abzlmflktdjujtcdxwpg.supabase.co';
const DEFAULT_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiemxtZmxrdGRqdWp0Y2R4d3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDIzOTMsImV4cCI6MjEwODAxODM5M30.re0GkhJcYVnwoIl7g-8VpiT5WM6cQ8TEYvrs8YOoL-w';
const DEFAULT_SB_TABLE = 'training_logs';

const SUPABASE_CONFIG = {
    url: localStorage.getItem('syn_sb_url') || DEFAULT_SB_URL,
    anonKey: localStorage.getItem('syn_sb_key') || DEFAULT_SB_KEY,
    table: localStorage.getItem('syn_sb_table') || DEFAULT_SB_TABLE
};

let sbClient = null;
let sbSyncStatus = 'idle'; // 'idle' | 'connected' | 'error' | 'syncing'

function initSupabase() {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && typeof supabase !== 'undefined') {
        try {
            sbClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            console.log('✅ Supabase conectado com sucesso ao projeto:', SUPABASE_CONFIG.url);
            sbSyncStatus = 'connected';
            syncFromSupabase();
        } catch (e) {
            sbSyncStatus = 'error';
            console.error('Supabase initialization error:', e);
        }
    }
}

function isSupabaseConnected() {
    return sbClient !== null && Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
}

/**
 * Fetch records from Supabase and populate Dashboard with 100% real cloud data
 */
async function syncFromSupabase() {
    if (!sbClient) return;
    try {
        sbSyncStatus = 'syncing';
        
        let { data, error } = await sbClient
            .from(SUPABASE_CONFIG.table)
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            sbSyncStatus = 'error';
            console.warn(`[Supabase] Erro ao consultar tabela [${SUPABASE_CONFIG.table}]:`, error.message);
            return;
        }

        sbSyncStatus = 'connected';
        if (data && data.length > 0) {
            console.log(`[Supabase] ✅ Carregados ${data.length} registros reais da nuvem (tabela: ${SUPABASE_CONFIG.table})`);
            processSupabaseData(data);
        } else {
            console.log(`[Supabase] Conectado. Tabela [${SUPABASE_CONFIG.table}] pronta para receber registros.`);
        }
    } catch (err) {
        sbSyncStatus = 'error';
        console.error('Supabase sync exception:', err);
    }
}

/**
 * Normaliza os dados remotos para o formato padrão do aplicativo
 */
function processSupabaseData(remoteRows) {
    if (!remoteRows || !remoteRows.length) return;

    const formatted = remoteRows.map(function (r) {
        const sq = Number(r.sonoq != null ? r.sonoq : (r.sonoQ != null ? r.sonoQ : 7));
        const sh = Number(r.sonoh != null ? r.sonoh : (r.sonoH != null ? r.sonoH : 7.5));
        const p = Number(r.prs != null ? r.prs : 7);
        const d = Number(r.dor != null ? r.dor : 0);

        return {
            id: r.id,
            date: r.date || new Date().toISOString().slice(0, 10),
            weekday: r.weekday || '',
            pse: Number(r.pse) || 0,
            dur: Number(r.dur || r.duration) || 0,
            tss: Number(r.tss) || 0,
            trimp: Number(r.trimp) || 0,
            hrv: Number(r.hrv) || 75,
            fcmedia: Number(r.fcmedia || r.avg_hr || r.fc_media) || 140,
            rhr: Number(r.rhr || r.resting_hr || r.fc_repouso) || 48,
            sonoQ: sq,
            sensacao: p,
            sonoWatch: Math.round(sq * 10),
            sonoH: sh,
            valorSono: Number(((sq + p) / 2).toFixed(1)),
            fadiga: Number(r.fadiga != null ? r.fadiga : 3),
            estresse: Number(r.estresse != null ? r.estresse : 3),
            doms: Number(r.doms != null ? r.doms : 2),
            humor: Number(r.humor != null ? r.humor : 7),
            tqr: Number(r.tqr != null ? r.tqr : 9),
            prs: p,
            psr: p,
            dor: d,
            dorLocal: r.dor_local || r.dorLocal || (d > 0 ? 'Geral' : 'Nenhuma dor'),
            motivacao: Number(r.motivacao != null ? r.motivacao : 8),
            hooper: Number(r.hooper != null ? r.hooper : 10),
            atl: Number(r.atl) || 0,
            ctl: Number(r.ctl) || 40,
            tsb: Number(r.tsb) || 0,
            monotonia: Number(r.monotonia) || 1.0,
            prontidao: Number(r.prontidao) || 70,
            recuperacao: Number(r.recuperacao) || 70,
            wkType: r.workout_type || r.workoutType || r.wkType || 'Musculação / Força',
            notes: r.notes || ''
        };
    });

    // Sort chronologically
    formatted.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    // Recalcular cargas acumuladas e salvar
    if (typeof recalcTrainingLoads === 'function') {
        const recalculated = recalcTrainingLoads(formatted);
        localStorage.setItem(SK.DATA, JSON.stringify(recalculated));
    } else {
        localStorage.setItem(SK.DATA, JSON.stringify(formatted));
    }

    if (typeof refreshAll === 'function') refreshAll();
}

/**
 * Salva ou atualiza um registro no Supabase
 */
async function pushEntryToSupabase(entry) {
    if (!sbClient) {
        console.warn('Supabase client não inicializado.');
        return;
    }
    try {
        const payload = {
            date: entry.date ? entry.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            sonoq: Number(entry.sonoQ != null ? entry.sonoQ : (entry.sonoq != null ? entry.sonoq : 7)),
            sonoh: Number(entry.sonoH != null ? entry.sonoH : (entry.sonoh != null ? entry.sonoh : 7.5)),
            fadiga: Number(entry.fadiga != null ? entry.fadiga : 3),
            estresse: Number(entry.estresse != null ? entry.estresse : 3),
            doms: Number(entry.doms != null ? entry.doms : 2),
            humor: Number(entry.humor != null ? entry.humor : 7),
            tqr: Number(entry.tqr != null ? entry.tqr : 9),
            prs: Number(entry.prs != null ? entry.prs : 7),
            dor: Number(entry.dor != null ? entry.dor : 0),
            motivacao: Number(entry.motivacao != null ? entry.motivacao : 8),
            hooper: Number(entry.hooper != null ? entry.hooper : 10),
            hrv: Number(entry.hrv != null ? entry.hrv : 75),
            rhr: Number(entry.rhr != null ? entry.rhr : 48),
            fcmedia: Number(entry.fcmedia != null ? entry.fcmedia : 140),
            pse: Number(entry.pse != null ? entry.pse : 0),
            dur: Number(entry.dur != null ? entry.dur : 0),
            trimp: Number(entry.trimp != null ? entry.trimp : 0),
            tss: Number(entry.tss != null ? entry.tss : 0),
            atl: Number(entry.atl != null ? entry.atl : 0),
            ctl: Number(entry.ctl != null ? entry.ctl : 0),
            tsb: Number(entry.tsb != null ? entry.tsb : 0),
            monotonia: Number(entry.monotonia != null ? entry.monotonia : 1.0),
            prontidao: Number(entry.prontidao != null ? entry.prontidao : 70),
            recuperacao: Number(entry.recuperacao != null ? entry.recuperacao : 70),
            workout_type: entry.wkType || entry.workoutType || entry.workout_type || '',
            notes: entry.notes || '',
            updated_at: new Date().toISOString()
        };

        const { error } = await sbClient.from(SUPABASE_CONFIG.table).upsert(payload, { onConflict: 'date' });
        if (error) {
            console.error('[Supabase] Erro ao salvar:', error.message);
        } else {
            console.log('✅ [Supabase] Registro sincronizado na nuvem com sucesso:', payload.date);
        }
    } catch (err) {
        console.error('[Supabase] Erro de rede ou push:', err);
    }
}

// Alias para compatibilidade
const syncToSupabase = pushEntryToSupabase;

/**
 * Exclui registro do Supabase pela data
 */
async function deleteFromSupabase(dateStr) {
    if (!sbClient) return;
    try {
        const targetDate = dateStr.slice(0, 10);
        const { error } = await sbClient.from(SUPABASE_CONFIG.table).delete().eq('date', targetDate);
        if (error) console.error('[Supabase] Erro ao excluir:', error.message);
        else console.log('✅ [Supabase] Registro excluído da nuvem:', targetDate);
    } catch (err) {
        console.error('[Supabase] Erro ao excluir:', err);
    }
}

/**
 * Save Supabase Credentials & Re-test
 */
function saveSupabaseConfig(url, key, table) {
    SUPABASE_CONFIG.url = url.trim();
    SUPABASE_CONFIG.anonKey = key.trim();
    SUPABASE_CONFIG.table = (table && table.trim()) ? table.trim() : DEFAULT_SB_TABLE;

    localStorage.setItem('syn_sb_url', SUPABASE_CONFIG.url);
    localStorage.setItem('syn_sb_key', SUPABASE_CONFIG.anonKey);
    localStorage.setItem('syn_sb_table', SUPABASE_CONFIG.table);

    initSupabase();
}
