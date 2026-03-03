import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Default Settings
const DEFAULT_CONFIG = {
    prices: {
        main: 37.00,
        upsell1: 16.00,
        upsell2: 12.00
    },
    copy: {
        main_title: "VIP Stalkea",
        main_description: "Acesso Completo 2.0",
        upsell1_title: "Privacy Bolt",
        upsell2_title: "Ghost Mode"
    },
    active_gateway: 'sigilopay', // 'sigilopay', 'pixgo' or 'syncpay'
    banned_ips: []
};

// Lazy Initialize Supabase
function getSupabase() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }
    return createClient(supabaseUrl, supabaseKey);
}

// Helper for local fallback
const CONFIG_PATH = path.resolve(process.cwd(), 'global_settings.json');
function getLocalConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const localData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            return { ...DEFAULT_CONFIG, ...localData };
        }
    } catch (e) { }
    return DEFAULT_CONFIG;
}

async function loadConfig() {
    const supabase = getSupabase();
    if (!supabase) {
        console.warn("⚠️ Supabase NULL: Usando Config Local (Variavéis de ambiente não carregadas na inicialização)");
        return getLocalConfig();
    }

    try {
        console.log("📡 API: Buscando Configurações (Redundância Ativada)...");

        // Busca nas duas tabelas para garantir
        const [resConfigs, resSettings] = await Promise.all([
            supabase.from('configs').select('*').eq('id', 'prices').maybeSingle(),
            supabase.from('project_settings').select('*').limit(1).maybeSingle()
        ]);

        let finalPrices = { ...DEFAULT_CONFIG.prices };
        let finalCopy = { ...DEFAULT_CONFIG.copy };
        let finalBanned = [...DEFAULT_CONFIG.banned_ips];
        let finalGateway = DEFAULT_CONFIG.active_gateway;

        // Prioridade 1: Tabela 'project_settings' (mais comum no seu banco de dados principal)
        if (resSettings.data) {
            const d = resSettings.data;
            if (d.prices) finalPrices = { ...finalPrices, ...d.prices };
            if (d.copy) finalCopy = { ...finalCopy, ...d.copy };
            if (d.banned_ips) finalBanned = d.banned_ips;
            if (d.pixels?.active_gateway) finalGateway = d.pixels.active_gateway;
            console.log("✅ Dados carregados de 'project_settings'");
        }

        // Prioridade 2 (Sobrescreve se mais recente): Tabela 'configs'
        if (resConfigs.data && resConfigs.data.value) {
            const v = resConfigs.data.value;
            if (v.prices) {
                finalPrices.main = v.prices.main || finalPrices.main;
                finalPrices.upsell1 = v.prices.privacy || v.prices.upsell1 || finalPrices.upsell1;
                finalPrices.upsell2 = v.prices.priority || v.prices.upsell2 || finalPrices.upsell2;
            }
            if (v.copy) finalCopy = { ...finalCopy, ...v.copy };
            if (v.banned_ips) finalBanned = v.banned_ips;
            if (v.active_gateway) finalGateway = v.active_gateway;
            console.log("✅ Dados mesclados com 'configs'");
        }

        return {
            prices: finalPrices,
            copy: finalCopy,
            banned_ips: finalBanned,
            active_gateway: finalGateway
        };

    } catch (e) {
        console.error("❌ Erro ao carregar Config:", e);
        return getLocalConfig();
    }
}

async function saveConfig(newConfig) {
    const supabase = getSupabase();

    // Identifica o que está sendo salvo
    const cleanPrices = {
        main: Number(newConfig.prices.main) || 27,
        upsell1: Number(newConfig.prices.upsell1) || 16,
        upsell2: Number(newConfig.prices.upsell2) || 12
    };

    const finalConfig = {
        prices: cleanPrices,
        copy: newConfig.copy || DEFAULT_CONFIG.copy,
        banned_ips: newConfig.banned_ips || [],
        active_gateway: newConfig.active_gateway || 'syncpay'
    };

    // --- FALLBACK LOCAL (SEMPRE SALVA LOCALMENTE TAMBÉM) ---
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(finalConfig, null, 2));
        console.log("📂 API: Configuração salva no arquivo local com sucesso.");
    } catch (err) {
        console.error("❌ Erro ao salvar arquivo local:", err.message);
    }

    if (!supabase) {
        console.warn("⚠️ Sem Supabase: Alteração salva apenas LOCALMENTE.");
        return;
    }

    try {
        console.log("🚀 API: Iniciando Sincronização com Supabase...");

        // 1. Tabela 'configs' (Formato JSONB)
        const valueToConfigs = {
            ...finalConfig,
            prices: {
                main: cleanPrices.main,
                privacy: cleanPrices.upsell1,
                priority: cleanPrices.upsell2
            }
        };

        const { error: err1 } = await supabase
            .from('configs')
            .upsert({ id: 'prices', value: valueToConfigs });

        if (err1) {
            console.error("❌ Erro na tabela 'configs':", err1.message);
        } else {
            console.log("✅ Tabela 'configs' atualizada.");
        }

        // 2. Tabela 'project_settings' (Formato Colunas)
        // Tentamos descobrir o ID ou usamos 'global'
        const { data: rows } = await supabase.from('project_settings').select('id').limit(1);
        const targetId = rows?.[0]?.id || 'global';

        const dataToProjectSettings = {
            id: targetId,
            prices: cleanPrices,
            copy: finalConfig.copy,
            banned_ips: finalConfig.banned_ips,
            pixels: { active_gateway: finalConfig.active_gateway }
        };

        const { error: err2 } = await supabase
            .from('project_settings')
            .upsert(dataToProjectSettings); // Usar upsert para garantir criação se não existir

        if (err2) {
            console.error(`❌ Erro na tabela 'project_settings' (${targetId}):`, err2.message);
        } else {
            console.log("✅ Tabela 'project_settings' atualizada.");
        }

        if (!err1 || !err2) {
            console.log("💎 API: Sincronização com Banco de Dados concluída!");
        }

    } catch (e) {
        console.error("❌ API: Erro Crítico no saveConfig:", e);
    }
}

export default async function handler(req, res) {
    // Prevent browser and edge caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

    // Await the config load
    const config = await loadConfig();

    // Check if the requester is banned
    if (config.banned_ips.includes(clientIp)) {
        return res.status(403).json({ banned: true });
    }

    // --- GET: FETCH CONFIG ---
    if (req.method === 'GET') {
        return res.status(200).json(config);
    }

    // --- POST: UPDATE CONFIG or BAN IP ---
    if (req.method === 'POST') {
        const { action, data, ipToBan } = req.body;

        if (action === 'update_settings') {
            const newConfig = { ...config, ...data };
            await saveConfig(newConfig);
            // Retorna o config recém-salvo para confirmar o sucesso
            return res.status(200).json({ success: true, config: newConfig });
        }

        if (action === 'ban_ip') {
            if (ipToBan && !config.banned_ips.includes(ipToBan)) {
                config.banned_ips.push(ipToBan);
                await saveConfig(config); // Await save
                return res.status(200).json({ success: true, message: `IP ${ipToBan} banned` });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).end();
}
