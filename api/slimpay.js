
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, ...payload } = req.body;

    // SlimPay credentials from .env
    const PUBLIC_KEY = process.env.SLIMPAY_PUBLIC_KEY;
    const SECRET_KEY = process.env.SLIMPAY_SECRET_KEY;

    if (!PUBLIC_KEY || !SECRET_KEY) {
        console.error('[SlimPay] Error: Keys are missing in environment variables.');
        return res.status(500).json({ success: false, error: 'Chaves da API SlimPay não configuradas.' });
    }

    const BASE_URL = 'https://app.slimmpayy.com.br/api/v1/gateway';

    // Endpoint for Pix according to documentation
    const URL = `${BASE_URL}/pix/receive`;

    try {
        const cleanPhone = (payload.phone || '').replace(/\D/g, '');
        const cleanDocument = (payload.cpf || '').replace(/\D/g, '');

        if (cleanDocument.length !== 11) {
            return res.status(400).json({
                success: false,
                error: 'CPF inválido. Digite os 11 números.',
                details: { field: 'document', issue: 'length mismatch' }
            });
        }

        // Email sanitation and fallback
        const rawEmail = (payload.email || '').trim().replace(/\.@/g, '@');
        const finalEmail = (rawEmail.includes('@') && rawEmail.split('@')[0].length > 0)
            ? rawEmail
            : `anonimo_${Date.now()}@privatemail.com`;

        const finalPhone = cleanPhone.length >= 10 ? cleanPhone : '11999999999';
        const finalName = (payload.name || 'Anônimo').trim();

        const finalPayload = {
            identifier: `sp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            amount: payload.amount,
            client: {
                name: finalName,
                email: finalEmail,
                phone: finalPhone,
                document: String(cleanDocument)
            },
            products: [{
                id: 'stalkea-vip-2.0',
                name: 'Acesso VIP Stalkea 2.0',
                quantity: 1,
                price: payload.amount,
                physical: false
            }],
            metadata: {
                username: payload.username,
                source: 'stalkea-ai'
            }
        };

        console.log('[SlimPay] Sending payload:', JSON.stringify(finalPayload, null, 2));

        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-public-key': PUBLIC_KEY,
                'x-secret-key': SECRET_KEY
            },
            body: JSON.stringify(finalPayload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`[SlimPay] ${type} Error:`, data);
            return res.status(response.status).json(data);
        }

        // MAP RESPONSE TO FRONTEND EXPECTATIONS
        // According to docs, success response has 'pix' object with 'code' and 'base64'/'image'
        const qrImage = data.pix?.base64 || data.pix?.image;
        const transactionId = data.transactionId;

        // 🕵️ TRACKING PERSISTENCE (Supabase)
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

            if (supabaseUrl && supabaseKey && transactionId) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                await supabase.from('traffic_logs').insert({
                    event_type: 'pix_init',
                    target_user: payload.username || payload.name || 'pix_user',
                    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                    metadata: {
                        transactionId: transactionId,
                        gateway: 'slimpay',
                        email: finalEmail,
                        name: finalName,
                        amount: payload.amount
                    }
                });
            }
        } catch (e) {
            console.warn('[Tracking] Failed to save pix_init log:', e.message);
        }

        const mappedResponse = {
            success: true,
            id: transactionId,
            pix_qr_code: qrImage,
            pix_code: data.pix?.code,
            transactionId: transactionId,
            orderId: data.order?.id,
            original_data: data
        };

        return res.status(201).json(mappedResponse);
    } catch (error) {
        console.error('[SlimPay] Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
