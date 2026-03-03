// Stalkea.ai OFFICIAL API ONLY - Unified Posts & Suggestions
// Endpoint: tipo=busca_completa (Para Feed, Stories e Sugestões)
const OFFICIAL_API_BASE = 'https://stalkeiai-production.up.railway.app/api/instagram.php';
const MEDIA_PROXY = 'https://images.weserv.nl/?url=';

const USER_AGENTS = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 12; Pixel 6 Build/SD1A.210817.036) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.104 Mobile Safari/537.36'
];
const getRandomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

function proxyUrl(url) {
    if (!url) return '';

    // 1. Limpar proxy antigo quebrado se existir (proxt-insta)
    let finalUrl = url;
    if (url.includes('proxt-insta.projetinho-solo.workers.dev/?url=')) {
        const parts = url.split('?url=');
        if (parts.length > 1) {
            finalUrl = decodeURIComponent(parts[1]);
        }
    }

    // 2. Evitar proxy duplo ou desnecessário
    if (finalUrl.includes('weserv.nl') || finalUrl.includes('data:image')) return finalUrl;
    if (finalUrl.includes('unavatar.io') || finalUrl.includes('ui-avatars.com')) return finalUrl;

    // 3. Aplicar Weserv.nl com otimização agressiva
    const cleanAddress = finalUrl.replace(/^https?:\/\//, '');
    return `${MEDIA_PROXY}${encodeURIComponent(cleanAddress)}&w=600&q=65&output=webp&il`;
}

async function fetchOfficialData(username) {
    const cleanUsername = username.replace('@', '').split('?')[0].split('&')[0].trim().toLowerCase();
    // API 2: Busca Completa (Posts, Sugestões, Conteúdo Rico)
    const url = `${OFFICIAL_API_BASE}?tipo=busca_completa&username=${cleanUsername}&is_private=false`;

    try {
        // console.log(`[API] Fetching main user: ${cleanUsername} from ${url}`);
        // 1. PRIMEIRA REQUISIÇÃO (Busca Alvo)
        const response = await fetch(url, {
            headers: {
                'User-Agent': getRandomUA(),
                'Referer': 'https://stalkea.ai/',
                'Origin': 'https://stalkea.ai',
                'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
            }
        });

        if (!response.ok) {
            console.error(`[API] Error fetching ${cleanUsername}: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();

        // 1. Extrair Sugestões e Perfis Relacionados
        const rawSuggestions = [
            ...(data.lista_perfis_publicos || []),
            ...(data._chaining_results || [])
        ];
        const uniqueSuggestions = Array.from(new Map(rawSuggestions.map(item => [item.username, item])).values());

        const suggestions = uniqueSuggestions.map(profile => ({
            username: profile.username,
            full_name: profile.full_name || profile.username,
            profile_pic_url: proxyUrl(profile.profile_pic_url),
            is_verified: profile.is_verified || false
        }));

        // 2. Mapear Posts do ALVO
        let targetPosts = (data.posts || []).map(item => mapPostItem(item)).filter(Boolean);

        // --- LÓGICA DE FEED HÍBRIDO (Mantida para riqueza de conteúdo) ---
        let relatedPosts = [];

        // Se temos perfis públicos relacionados, pegamos os 3 primeiros (Principal + 2 Próximos)
        if (data.lista_perfis_publicos && data.lista_perfis_publicos.length > 0) {
            const relatedUsers = data.lista_perfis_publicos.slice(0, 3).map(u => u.username);

            // Faz requisições em paralelo para todos eles
            const relatedPromises = relatedUsers.map(async (relatedUser) => {
                try {
                    const relatedUrl = `${OFFICIAL_API_BASE}?tipo=busca_completa&username=${relatedUser}&is_private=false`;
                    const relatedRes = await fetch(relatedUrl, {
                        headers: {
                            'User-Agent': getRandomUA(),
                            'Referer': 'https://stalkea.ai/',
                            'Origin': 'https://stalkea.ai'
                        }
                    });

                    if (relatedRes.ok) {
                        const relatedData = await relatedRes.json();
                        if (relatedData.posts && relatedData.posts.length > 0) {
                            return relatedData.posts.map(item => mapPostItem(item)).filter(Boolean);
                        }
                    }
                } catch (err) {
                    // Ignore error
                }
                return [];
            });

            const results = await Promise.all(relatedPromises);
            // Junta tudo num array só
            relatedPosts = results.flat();
        }

        // Combinar e Embaralhar
        const allPosts = [...targetPosts, ...relatedPosts];
        const shuffledPosts = shuffleArray(allPosts);

        return {
            success: true,
            posts: shuffledPosts, // Feed misturado
            suggestions: suggestions,
            username: cleanUsername,
            profile_pic: proxyUrl(data.perfil_buscado?.profile_pic_url),
            biography: data.perfil_buscado?.biography || "",
            follower_count: data.perfil_buscado?.follower_count || 0,
            following_count: data.perfil_buscado?.following_count || 0,
            full_name: data.perfil_buscado?.full_name || cleanUsername,
            source: 'stalkea-official-railway-hybrid'
        };
    } catch (e) {
        return null;
    }
}

// Helper para mapear posts de forma consistente
function mapPostItem(item) {
    const p = item.post;
    if (!p) return null;

    // Garantir authorPic
    let authorPic = null;
    if (item.de_usuario && item.de_usuario.profile_pic_url) {
        authorPic = proxyUrl(item.de_usuario.profile_pic_url);
    } else if (p.profile_pic) {
        authorPic = proxyUrl(p.profile_pic);
    }

    // Extract caption safely
    let captionText = "";
    if (p.caption) {
        if (typeof p.caption === 'string') captionText = p.caption;
        else if (p.caption.text) captionText = p.caption.text;
    } else if (p.edge_media_to_caption && p.edge_media_to_caption.edges && p.edge_media_to_caption.edges.length > 0) {
        captionText = p.edge_media_to_caption.edges[0].node.text;
    }

    return {
        de_usuario: item.de_usuario ? {
            username: item.de_usuario.username,
            profile_pic_url: authorPic
        } : null,
        post: {
            ...p,
            image_url: proxyUrl(p.image_url),
            video_url: p.is_video ? proxyUrl(p.video_url) : null,
            caption: captionText,
            profile_pic: authorPic
        }
    };
}

// Fisher-Yates Shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

import fs from 'fs';
import path from 'path';

const memoryCache = new Map();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { username } = req.query;

    if (!username) return res.status(400).json({ success: false, error: 'Username missing' });
    const target = username.replace('@', '').split('?')[0].split('&')[0].trim().toLowerCase();

    // 1. Memory Cache
    if (memoryCache.has(target)) {
        return res.status(200).json(memoryCache.get(target));
    }

    // 2. Fetch Data (API 2 Only)
    const data = await fetchOfficialData(target);

    if (data) {
        memoryCache.set(target, data);
        return res.status(200).json(data);
    } else {
        return res.status(200).json({
            success: true,
            posts: [],
            suggestions: [],
            username: username,
            message: 'Sem dados da API oficial'
        });
    }
}


