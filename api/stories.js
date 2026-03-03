// Stalkea.ai OFFICIAL API ONLY - Stories
// Endpoint: tipo=busca_completa (Para Stories)
const OFFICIAL_API_BASE = 'https://stalkeiai-production.up.railway.app/api/instagram.php';
const MEDIA_PROXY = 'https://images.weserv.nl/?url=';

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

async function fetchOfficialStories(username) {
    const cleanUsername = username.replace('@', '').split('?')[0].split('&')[0].trim().toLowerCase();
    // API 2: Busca Completa (Stories estão incluídos aqui)
    const url = `${OFFICIAL_API_BASE}?tipo=busca_completa&username=${cleanUsername}&is_private=false`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://stalkea.ai/',
                'Origin': 'https://stalkea.ai'
            }
        });
        clearTimeout(timeout);

        if (response.ok) {
            const data = await response.json();
            // Tenta achar stories em vários campos possíveis
            const storyData = data.story || data.stories || data.feed_stories;

            const stories = processStoriesData(storyData, cleanUsername);
            if (stories) return { success: true, feed_stories_data: stories, source: 'official-busca-completa' };
        }
    } catch (e) {
        // Ignore
    }

    return null;
}

function processStoriesData(storyData, username) {
    if (!storyData) return null;

    let storiesList = [];
    if (storyData.items && Array.isArray(storyData.items)) {
        storiesList = storyData.items;
    } else if (Array.isArray(storyData)) {
        storiesList = storyData;
    }

    if (storiesList.length > 0) {
        return storiesList.map(s => ({
            id: s.id || `story-${Date.now()}-${Math.random()}`,
            username: username,
            img: proxyUrl(s.image_url || s.display_url || s.thumbnail_url),
            videoUrl: (s.is_video || s.video_url) ? proxyUrl(s.video_url) : null,
            is_video: !!(s.video_url || s.is_video),
            taken_at: s.taken_at || Date.now() / 1000
        }));
    }
    return null;
}

const memoryCache = new Map();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { username } = req.query;

    if (!username) return res.status(400).json({ success: false, error: 'Username required' });
    const target = username.replace('@', '').split('?')[0].split('&')[0].trim().toLowerCase();

    // 1. Memória
    if (memoryCache.has(target)) {
        return res.status(200).json({
            success: true,
            feed_stories_data: memoryCache.get(target),
            source: 'cache-memory'
        });
    }

    // 2. API Oficial (Busca Completa)
    const data = await fetchOfficialStories(target);

    if (data && data.success) {
        memoryCache.set(target, data.feed_stories_data);
        return res.status(200).json(data);
    } else {
        return res.status(200).json({
            success: true,
            feed_stories_data: [],
            source: 'empty-fallback'
        });
    }
}


