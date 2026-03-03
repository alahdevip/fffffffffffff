import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
let createClient = null;
try {
    const m = await import('@vercel/kv');
    createClient = m.createClient;
} catch (e) {}

// CONFIGURAÇÃO FACEBOOK
const FB_PIXEL_ID = process.env.FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

// CONFIGURAÇÃO STORAGE
const LOGS_PATH = path.resolve(process.cwd(), 'admin_logs.json');
const isVercel = process.env.VERCEL === '1';

// Inicializar KV (Vercel)
let kv = null;
if (process.env.KV_REST_API_URL) {
    kv = createClient({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
    });
}

// Cache em memória para warm starts
if (!global.adminLogsCache) {
    global.adminLogsCache = null;
}

function hashData(data) {
    if (!data) return null;
    return crypto.createHash('sha256').update(String(data).toLowerCase().trim()).digest('hex');
}

async function sendToFacebook(eventData) {
    try {
        const { eventName, ip, userAgent, email, phone, externalId, value, fbc, fbp, eventId } = eventData;

        // Suporte a múltiplos Pixels (separados por vírgula no .env)
        const pixelIds = FB_PIXEL_ID ? FB_PIXEL_ID.split(',').map(id => id.trim()) : [];
        if (pixelIds.length === 0) return { success: false, error: 'No Pixel ID configured' };

        const payload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eventId,
                action_source: 'website',
                event_source_url: 'https://stalkea.ai',
                user_data: {
                    client_ip_address: ip,
                    client_user_agent: userAgent,
                    em: email ? [hashData(email)] : null,
                    ph: phone ? [hashData(phone)] : null,
                    external_id: externalId ? [hashData(externalId)] : null,
                    fbc: fbc || null,
                    fbp: fbp || null
                }
            }]
        };

        if (value || eventName === 'Purchase') {
            payload.data[0].custom_data = {
                value: parseFloat(value || 37.00),
                currency: 'BRL'
            };
        }

        const reports = pixelIds.map(async (pixelId) => {
            const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${FB_ACCESS_TOKEN}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return response.json();
        });

        const results = await Promise.all(reports);
        return { success: true, results };
    } catch (error) {
        return { error: error.message };
    }
}

// Função auxiliar para ler logs (KV > Memória > Arquivo)
async function getLogs() {
    // 1. KV
    try {
        if (kv) {
            const data = await kv.get('admin_logs');
            if (data) {
                global.adminLogsCache = data;
                return data;
            }
        }
    } catch (e) { }

    // 2. Memória
    if (global.adminLogsCache) return global.adminLogsCache;

    // 3. Arquivo Local
    try {
        if (fs.existsSync(LOGS_PATH)) {
            const data = JSON.parse(fs.readFileSync(LOGS_PATH, 'utf8'));
            global.adminLogsCache = data;
            return data;
        }
    } catch (e) { }

    return [];
}

// Função auxiliar para salvar logs
async function saveLogs(logs) {
    global.adminLogsCache = logs;

    // KV
    try {
        if (kv) await kv.set('admin_logs', logs);
    } catch (e) { }

    // Arquivo Local
    try {
        fs.writeFileSync(LOGS_PATH, JSON.stringify(logs, null, 2));
    } catch (e) { }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

    // --- GET: RETORNAR LOGS ---
    if (req.method === 'GET') {
        const logs = await getLogs();
        return res.status(200).json(logs.reverse().slice(0, 500)); // Retorna últimos 500 logs
    }

    // --- POST: REGISTRAR ATIVIDADE ---
    if (req.method === 'POST') {
        const { step, targetUsername, paymentVerified, userEmail, userPhone, userName, eventName, value, fbc, fbp, cartUpdate } = req.body;
        const userAgent = req.headers['user-agent'];

        // 1. Carregar Logs Atuais
        let currentLogs = await getLogs();

        const existingIdx = currentLogs.findIndex(l => l.ip === clientIp);
        let user = existingIdx > -1 ? currentLogs[existingIdx] : {
            ip: clientIp,
            firstSeen: new Date().toISOString(),
            cart: { main: false, upsell1: false, upsell2: false },
            checkout: {}
        };

        // 2. Atualizar Dados Básicos
        user.step = step || user.step || 'home';
        if (targetUsername) user.target = targetUsername;
        user.lastSeen = new Date().toISOString();
        user.ua = userAgent;

        // Atualizar dados de contato se disponíveis
        if (userEmail) user.checkout.email = userEmail;
        if (userPhone) user.checkout.cpf = userPhone; // Mapeando userPhone do front para CPF/Phone no log
        if (userName) user.checkout.name = userName;

        // 3. Lógica de Vendas
        if (eventName === 'Purchase' || paymentVerified) {
            const amount = parseFloat(value);
            if (!isNaN(amount)) {
                if (amount >= 30) user.cart.main = true;
                if (amount > 13 && amount < 25) user.cart.upsell1 = true;
                if (amount > 5 && amount <= 13) user.cart.upsell2 = true;
            } else if (eventName === 'Purchase') {
                 // Fallback se não vier valor mas for compra confirmada
                 user.cart.main = true;
            }
        }

        if (cartUpdate) {
            user.cart = { ...user.cart, ...cartUpdate };
        }

        // 4. Salvar e Reordenar (colocar usuário ativo no topo se quiser, ou manter ordem cronológica de criação)
        if (existingIdx > -1) {
            currentLogs[existingIdx] = user;
        } else {
            currentLogs.push(user);
        }

        // Limitar tamanho do log para não estourar memória/KV (Manter últimos 2000)
        if (currentLogs.length > 2000) {
            currentLogs = currentLogs.slice(-2000);
        }

        await saveLogs(currentLogs);

        // 5. Facebook CAPI
        if (eventName) {
            // Não aguarda o CAPI para responder ao cliente (fire and forget)
            sendToFacebook({
                eventName,
                ip: clientIp,
                userAgent,
                email: userEmail || user.checkout.email,
                phone: userPhone || user.checkout.cpf,
                externalId: clientIp,
                value,
                fbc,
                fbp,
                eventId: req.body.eventId // Recebe do front
            }).catch(err => console.error("CAPI Error", err));
        }

        return res.status(200).json({ success: true, ip: clientIp });
    }

    return res.status(405).end();
}
