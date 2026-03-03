
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const FB_PIXEL_ID = process.env.FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

// Create client only if URL is available to avoid crash on load
const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null;

function hashData(data) {
    if (!data) return null;
    return crypto.createHash('sha256').update(String(data).toLowerCase().trim()).digest('hex');
}

async function sendToFacebook(eventData) {
    try {
        const { eventName, ip, userAgent, email, name, phone, value, fbc, fbp, eventId } = eventData;
        const pixelIds = FB_PIXEL_ID ? FB_PIXEL_ID.split(',').map(id => id.trim()) : [];
        if (pixelIds.length === 0 || !FB_ACCESS_TOKEN) return { success: false, error: 'FB Config Missing' };

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
                    fn: name ? [hashData(name.split(' ')[0])] : null,
                    ph: phone ? [hashData(phone)] : null,
                    fbc: fbc || null,
                    fbp: fbp || null
                },
                custom_data: {
                    value: parseFloat(value || 27.00),
                    currency: 'BRL'
                }
            }]
        };

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

export default async function handler(req, res) {
    // Permitir CORS para o Webhook
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body;
        console.log('[SigiloPay Webhook] Recebido:', JSON.stringify(payload, null, 2));

        const eventType = payload.event || payload.type;
        const transactionId = payload.id || payload.transactionId;
        const status = payload.status;
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // 1. Log payment event to Supabase
        if (supabase) {
            await supabase.from('traffic_logs').insert({
                event_type: 'webhook_sigilopay',
                target_user: payload.client?.name || 'webhook_unknown',
                ip: userIp,
                metadata: payload
            });
        }

        // 2. Check for Paid status
        if (
            eventType === 'Transação paga' ||
            eventType === 'PAYMENT_CONFIRMED' ||
            eventType === 'paid' ||
            (status && status.toUpperCase() === 'PAID')
        ) {
            console.log('💰 Pagamento Confirmado via Webhook! Transaction:', transactionId);

            // 3. RECUPERAR TOKENS DE TRACKING (fbc, fbp, eventId)
            // Buscamos o registro de 'pix_init' que gerou esse transactionId
            if (supabase && transactionId) {
                const { data: initialLogs } = await supabase
                    .from('traffic_logs')
                    .select('*')
                    .eq('event_type', 'pix_init')
                    .contains('metadata', { transactionId: transactionId })
                    .limit(1);

                if (initialLogs && initialLogs.length > 0) {
                    const meta = initialLogs[0].metadata;
                    console.log('🚀 Enviando CAPI Purchase com metadados recuperados...');

                    // 4. ENVIAR PARA FACEBOOK CAPI
                    await sendToFacebook({
                        eventName: 'Purchase',
                        ip: userIp,
                        userAgent: req.headers['user-agent'],
                        email: meta.email || payload.client?.email,
                        name: meta.name || payload.client?.name,
                        phone: meta.phone || payload.client?.phone,
                        value: meta.amount || payload.amount,
                        fbc: meta.fbc,
                        fbp: meta.fbp,
                        eventId: meta.eventId // Deduplicação perfeita
                    });
                }
            }
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('[Webhook Error]', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
