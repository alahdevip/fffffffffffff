
// Stalkea.ai V2 API Integration - CLEAN & UNIFIED
const OFFICIAL_API_BASE = 'https://stalkea.ai/api/instagram.php';

const MEDIA_PROXY = 'https://images.weserv.nl/?url=';

function proxyUrl(url) {
    if (!url) return '';
    let finalUrl = url;
    if (url.includes('proxt-insta.projetinho-solo.workers.dev/?url=')) {
        const parts = url.split('?url=');
        if (parts.length > 1) finalUrl = decodeURIComponent(parts[1]);
    }
    if (finalUrl.includes('weserv.nl') || finalUrl.includes('data:image')) return finalUrl;
    if (finalUrl.includes('unavatar.io') || finalUrl.includes('ui-avatars.com')) return finalUrl;
    const cleanAddress = finalUrl.replace(/^https?:\/\//, '');
    return `${MEDIA_PROXY}${encodeURIComponent(cleanAddress)}&w=400&q=65&output=webp&il`;
}

const cleanUser = (u) => u.replace('@', '').split('?')[0].split('&')[0].trim().toLowerCase();

async function fetchOfficialProfile(username) {
    const target = cleanUser(username);
    const url = `${OFFICIAL_API_BASE}?tipo=perfil&username=${target}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutDuration = 5000 + (attempt * 5000);
            const timeout = setTimeout(() => controller.abort(), timeoutDuration);

            console.log(`[ProfileSpoofing] Buscando perfil: ${target} (Tentativa ${attempt}/3)`);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
                    'Referer': 'https://stalkea.ai/',
                    'Origin': 'https://stalkea.ai',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR,pt;q=0.8',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin'
                }
            });
            clearTimeout(timeout);

            if (!response.ok) {
                console.error(`[API 2] Erro HTTP: ${response.status}`);
                // Se for 404 real, não adianta tentar de novo
                if (response.status === 404) return null;
                throw new Error(`HTTP Error ${response.status}`);
            }

            const data = await response.json();

            // Validation: Check if critical fields exist
            if (data && (data.username || data.follower_count !== undefined)) {
                console.log(`[API 2] SUCESSO na tentativa ${attempt} para ${target}`);
                return {
                    username: data.username || target,
                    full_name: data.full_name || target,
                    biography: data.biography || '',
                    profile_pic_url: proxyUrl(data.profile_pic_url),
                    followers: formatCount(data.follower_count),
                    following: formatCount(data.following_count),
                    posts: formatCount(data.media_count),
                    is_verified: data.is_verified || false,
                    is_private: data.is_private || false,
                    source: 'official-v2-railway'
                };
            }
            throw new Error("Dados inválidos ou incompletos");

        } catch (e) {
            console.warn(`[API 2] Falha na tentativa ${attempt}: ${e.message}`);
            // Espera 2s antes de tentar de novo (Backoff)
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
        }
    }
    return null;
}

// Cache em memória (Lambda Persistence)
const memoryCache = new Map();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { username } = req.query;

    if (!username) return res.status(400).json({ success: false, error: 'Username required' });
    const target = cleanUser(username);

    // 1. Tentar Cache em Memória (Rápido e funciona na Vercel)
    if (memoryCache.has(target)) {
        return res.status(200).json({ success: true, data: memoryCache.get(target) });
    }

    // 2. Buscar Dados Reais na API Oficial
    const data = await fetchOfficialProfile(target);

    if (data) {
        // Salvar em Memória
        memoryCache.set(target, data);
        return res.status(200).json({ success: true, data });
    } else {
        return res.status(404).json({
            success: false,
            message: 'Perfil não encontrado ou sistema instável.'
        });
    }
}

function formatCount(num) {
    if (!num) return '0';
    if (typeof num === 'string') return num;
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
}
