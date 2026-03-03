import { createClient } from '@supabase/supabase-js';

// 🔒 SISTEMA DE BLOQUEIO POR IP - 100% SUPABASE
// Não usa mais arquivo local, tudo salvo no banco de dados

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Captura o IP (Prioridade para o enviado pelo front-end via ipify, depois detecção automática)
    const clientIp = req.query.ip || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

    console.log(`[IP-TRACK] ${req.method} - IP Identificado: ${clientIp}`);

    // Inicializar Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('[IP-TRACK] ERRO: Supabase não configurado!');
        return res.status(500).json({ success: false, error: 'Supabase não configurado' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🚀 RECURSO DE RESET (Zerar IP)
    if (req.query.reset === 'true') {
        try {
            const { error } = await supabase
                .from('ip_blocks')
                .delete()
                .eq('ip', clientIp);

            if (error) throw error;

            console.log(`[IP-TRACK] IP ${clientIp} resetado com sucesso no Supabase!`);
            return res.status(200).json({ success: true, message: 'IP Resetado com sucesso!', ip: clientIp });
        } catch (e) {
            console.error('[IP-TRACK] Erro ao resetar IP:', e);
            return res.status(500).json({ success: false, error: 'Erro ao resetar IP' });
        }
    }

    // 2. Lógica de registro/atualização (POST)
    if (req.method === 'POST') {
        const { username, durationMinutes = 10, cta_stage, cta_remaining, cta_end, step, payment_verified } = req.body;

        try {
            // Verificar se IP já existe no banco
            const { data: existingData, error: fetchError } = await supabase
                .from('ip_blocks')
                .select('*')
                .eq('ip', clientIp)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found (ok)
                throw fetchError;
            }

            // 🔒 BLOQUEIO PERMANENTE: Se o IP já tem um username registrado, não permite mudar
            if (existingData && existingData.username && existingData.username !== username && username) {
                console.log(`🚫 TENTATIVA DE TROCAR @: IP ${clientIp} tentou mudar de "${existingData.username}" para "${username}"`);

                // Registra a tentativa bloqueada
                await supabase.from('traffic_logs').insert({
                    event_type: 'blocked_attempt',
                    ip: clientIp,
                    target_user: username,
                    device: req.headers['user-agent'],
                    metadata: {
                        original_username: existingData.username,
                        attempted_username: username,
                        blocked_at: new Date().toISOString()
                    }
                });

                return res.status(403).json({
                    success: false,
                    blocked: true,
                    username: existingData.username,
                    message: `Este IP já está vinculado a @${existingData.username}`
                });
            }

            if (existingData?.is_permanent) {
                return res.status(200).json({ success: true, blocked: true });
            }

            const expiry = new Date(Date.now() + (durationMinutes * 60 * 1000)).toISOString();

            // 🔒 Se duração é muito longa (> 1 ano), marca como permanente imediatamente
            const isPermanentBlock = durationMinutes > 525600; // 1 ano em minutos

            const ipData = {
                ip: clientIp,
                username: username || existingData?.username,
                expiry: expiry,
                is_permanent: isPermanentBlock || existingData?.is_permanent || false,
                cta_stage: typeof cta_stage === 'number' ? cta_stage : (existingData?.cta_stage ?? 0),
                cta_remaining: typeof cta_remaining === 'number' ? cta_remaining : (existingData?.cta_remaining ?? 0),
                cta_end: typeof cta_end === 'number' ? cta_end : (existingData?.cta_end ?? null),
                step: step || existingData?.step || 'home',
                payment_verified: typeof payment_verified === 'boolean' ? payment_verified : (existingData?.payment_verified ?? false),
                device: req.headers['user-agent'],
                updated_at: new Date().toISOString()
            };

            // Upsert (insert ou update)
            const { error: upsertError } = await supabase
                .from('ip_blocks')
                .upsert(ipData, { onConflict: 'ip' });

            if (upsertError) throw upsertError;

            // Log da ação
            await supabase.from('traffic_logs').insert({
                event_type: 'ip_registered',
                ip: clientIp,
                target_user: username || 'visitante',
                device: req.headers['user-agent'],
                metadata: {
                    stage: ipData.cta_stage,
                    remaining: ipData.cta_remaining,
                    end: ipData.cta_end,
                    step: ipData.step,
                    path: req.headers['referer'] || '',
                    is_permanent: isPermanentBlock
                }
            });

            console.log(`[IP-TRACK] IP ${clientIp} registrado para @${username} (Etapa: ${ipData.step})`);

            return res.status(200).json({
                success: true,
                blocked: false,
                username: ipData.username,
                step: ipData.step,
                payment_verified: ipData.payment_verified,
                cta: {
                    stage: ipData.cta_stage,
                    remaining: ipData.cta_remaining,
                    end: ipData.cta_end
                }
            });
        } catch (e) {
            console.error('[IP-TRACK] Erro ao registrar IP:', e);
            return res.status(500).json({ success: false, error: 'Erro ao registrar IP' });
        }
    }

    // 3. Lógica de verificação (GET)
    if (req.method === 'GET') {
        try {
            const { data: userData, error } = await supabase
                .from('ip_blocks')
                .select('*')
                .eq('ip', clientIp)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            console.log(`[IP-TRACK] Verificando IP ${clientIp}:`, userData ? `Vinculado a @${userData.username}` : 'Não registrado');

            if (userData) {
                const isExpired = new Date(userData.expiry) < new Date();

                if (isExpired || userData.is_permanent) {
                    // Marca como permanente se expirou
                    if (!userData.is_permanent) {
                        await supabase
                            .from('ip_blocks')
                            .update({ is_permanent: true })
                            .eq('ip', clientIp);
                    }

                    console.log(`[IP-TRACK] IP ${clientIp} BLOQUEADO para @${userData.username}`);

                    return res.status(200).json({
                        success: true,
                        blocked: true,
                        username: userData.username,
                        step: userData.step,
                        payment_verified: userData.payment_verified,
                        message: 'Acesso expirado para este dispositivo.',
                        cta: {
                            stage: userData.cta_stage ?? 0,
                            remaining: userData.cta_remaining ?? 0,
                            end: userData.cta_end ?? null
                        }
                    });
                }

                // Sessão ativa
                return res.status(200).json({
                    success: true,
                    blocked: false,
                    username: userData.username,
                    step: userData.step,
                    payment_verified: userData.payment_verified,
                    cta: {
                        stage: userData.cta_stage ?? 0,
                        remaining: userData.cta_remaining ?? 0,
                        end: userData.cta_end ?? null
                    }
                });
            }

            return res.status(200).json({
                success: true,
                blocked: false,
                cta: null
            });
        } catch (e) {
            console.error('[IP-TRACK] Erro ao verificar IP:', e);
            return res.status(500).json({ success: false, error: 'Erro ao verificar IP' });
        }
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}

