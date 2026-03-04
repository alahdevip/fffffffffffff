import { Logger } from './logger';

// Client-side Instagram API handler
// Replaces api/posts.js to avoid Vercel IP blocking/Rate limiting
// Uses the user's browser (and a proxy) to fetch data

const OFFICIAL_API_BASE = '/api/instagram';
const MEDIA_PROXY = 'https://images.weserv.nl/?url=';

// Lista negra de usuários que devem ser ignorados (spam/bots)
const BLACKLIST_USERS = [
    'bilalmohammad9',
    'dianwl8k',
    'zohidmureed',
    'yaqoob.ayub',
    'auto_posters1',
    'na.thaly76',
    'belendorseydf',
    'johnnygentryfj',
    'tommyortizdf'
];

const getProxiedUrl = (url: string) => {
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

    // 3. Aplicar Weserv.nl com otimização agressiva para velocidade
    const cleanUrl = finalUrl.replace(/^https?:\/\//, '');
    // w=600 (suficiente para mobile), q=65 (balanceado), il (interlaced para carregar progressivo)
    return `${MEDIA_PROXY}${encodeURIComponent(cleanUrl)}&w=600&q=65&output=webp&il`;
};

// Helper to fetch via proxy to avoid CORS and Vercel IP blocks
const fetchViaProxy = async (targetUrl: string, timeoutOverride?: number) => {
    // Agora o proxy é interno (/api/instagram), então não precisamos de proxies externos
    // para a chamada principal da API.

    // Timeout helper (Aumentado para 35s para dar tempo ao servidor Railway/IG de responder)
    const fetchWithTimeout = async (url: string, options: any = {}, timeout = 35000) => {
        const controller = new AbortController();
        const id = setTimeout(() => {
            Logger.warn(`[Timeout] A requisição para ${url.substring(0, 50)}... demorou mais de ${timeout / 1000}s e foi cancelada.`);
            controller.abort();
        }, timeout);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    };

    try {
        Logger.api(`Tentando conexão via Proxy Local: ${targetUrl}`);
        const res = await fetchWithTimeout(targetUrl, {}, timeoutOverride);
        if (res.ok) return await res.json();
        throw new Error(`Local Proxy error: ${res.status}`);
    } catch (e) {
        Logger.error('Fetch via Local Proxy failed.', e);
        throw e;
    }
};

function mapPostItem(item: any) {
    // Tenta detectar se o item já é o post (formato flat) ou se está envelopado
    let p = item.post || item;
    let authorData = item.de_usuario || item.owner || item.user;

    // Validação mínima para considerar um post
    // Se não tiver ID/PK, mas tiver image_url, tentamos aproveitar como post genérico
    if (!p) return null;

    // Robustez: Se não tem ID mas parece um post válido visualmente
    if ((!p.id && !p.pk) && !p.image_url && !p.display_url) return null;

    // Garantir authorPic
    let authorPic = null;
    if (authorData && authorData.profile_pic_url) {
        authorPic = getProxiedUrl(authorData.profile_pic_url);
    } else if (p.profile_pic) {
        authorPic = getProxiedUrl(p.profile_pic);
    } else if (p.owner && p.owner.profile_pic_url) {
        authorPic = getProxiedUrl(p.owner.profile_pic_url);
    }

    // Extract caption safely
    let captionText = "";
    if (p.caption) {
        if (typeof p.caption === 'string') captionText = p.caption;
        else if (p.caption.text) captionText = p.caption.text;
    } else if (p.edge_media_to_caption && p.edge_media_to_caption.edges && p.edge_media_to_caption.edges.length > 0) {
        captionText = p.edge_media_to_caption.edges[0].node.text;
    }

    // Video Optimization: Select optimal quality (prefer ~640px width)
    let isVideo = p.is_video || p.media_type === 2 || (p.video_versions && p.video_versions.length > 0);
    let finalVideoUrl = p.video_url || p.video_resource_url;
    let videoCandidates = p.video_versions;

    // Check Carousel for video if not found on root
    if (!isVideo && p.carousel_media && Array.isArray(p.carousel_media) && p.carousel_media.length > 0) {
        const firstMedia = p.carousel_media[0];
        if (firstMedia.media_type === 2 || (firstMedia.video_versions && firstMedia.video_versions.length > 0)) {
            isVideo = true;
            videoCandidates = firstMedia.video_versions;
            finalVideoUrl = firstMedia.video_url || firstMedia.video_resource_url || finalVideoUrl;
        }
    }

    if (isVideo && videoCandidates && Array.isArray(videoCandidates) && videoCandidates.length > 0) {
        // Sort by width (ascending)
        const sorted = [...videoCandidates].sort((a: any, b: any) => a.width - b.width);
        // Pick closest to 640px (Mobile Friendly)
        const optimal = sorted.find((v: any) => v.width >= 640) || sorted[sorted.length - 1];
        if (optimal && (optimal.url || optimal.video_url)) finalVideoUrl = optimal.url || optimal.video_url;
    }

    // Normalização final
    return {
        de_usuario: authorData ? {
            username: authorData.username,
            profile_pic_url: authorPic
        } : {
            username: p.username || 'instagram',
            profile_pic_url: authorPic
        },
        post: {
            ...p,
            id: p.id || p.pk || `local-${Math.random()}`, // Garante ID
            is_video: isVideo,
            image_url: getProxiedUrl(p.image_url || p.display_url),
            video_url: isVideo ? finalVideoUrl : null,
            caption: captionText,
            profile_pic: authorPic,
            username: authorData?.username || p.username
        }
    };
}

// 🔥 GERADOR DE FEED DE FALLBACK (PRE-MONTADO) 🔥
const generateFallbackFeed = (username: string) => {
    // Lista A: Usuários para Stories (Sugestões)
    const storyUsers = ['marcos_souza', 'ju_ferreira', 'gabriel_costa', 'ana.clara', 'lucas_santos', 'bia_mendes', 'pedro_henrique', 'sofia_alves', 'rafa_oliveira', 'carol_lima'];

    // Lista B: Usuários para Posts (TOTALMENTE DIFERENTES dos stories)
    const postUsers = ['thiago_silva', 'mariana_costa', 'felipe_santos', 'julia_oliveira', 'bruno_pereira', 'camila_rodrigues', 'gustavo_almeida', 'larissa_ferreira', 'rodrigo_lima', 'patricia_gomes', 'fernanda_s', 'diego_m'];

    // Stories/Sugestões
    const suggestions = storyUsers.map(u => ({
        username: u,
        full_name: u.replace('_', ' ').replace('.', ' '),
        profile_pic_url: `https://ui-avatars.com/api/?name=${u}&background=random&color=fff`,
        is_verified: false
    }));

    // Posts (Censurados/Restritos)
    // Definimos image_url como null para ativar o layout "Conteúdo restrito" no frontend
    const posts = Array.from({ length: 12 }).map((_, i) => ({
        post: {
            id: `fallback-${i}`,
            image_url: null,
            video_url: null,
            caption: "...",
            likes: Math.floor(Math.random() * 850000) + 150000,
            comments: Math.floor(Math.random() * 25000) + 5000,
            timestamp: Date.now() - (i * 3600000),
            is_video: false,
            isPrivate: false,
            isCensored: false, // Força todos os posts reais a serem visíveis no feed principal
            profile_pic: null,
            username: postUsers[i % postUsers.length]
        },
        de_usuario: {
            username: postUsers[i % postUsers.length],
            profile_pic_url: null
        }
    }));

    return {
        success: true, // Retorna sucesso para o App.tsx renderizar o feed
        posts: posts,
        suggestions: suggestions,
        stories: { feed_stories_data: suggestions },
        username: username,
        profile_pic: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`,
        biography: "Perfil Privado • 🔒",
        follower_count: Math.floor(Math.random() * 2000) + 100,
        following_count: Math.floor(Math.random() * 500) + 50,
        full_name: username,
        source: 'fallback-mode'
    };
};

export const fetchInstagramFeed = async (username: string) => {
    // 🛡️ API TOGGLE CHECK (Dev Control)
    if (localStorage.getItem('stalkea_api_feed_enabled') === 'false') {
        Logger.api('🚫 API Feed desativada pelo usuário (Dev Panel). Retornando FEED PRE-MONTADO.');
        return generateFallbackFeed(username);
    }

    const cleanUsername = username.replace('@', '').split('?')[0].split('&')[0].trim().toLowerCase();

    // 1. TENTATIVA SERVIDOR PHP (RAILWAY) - BUSCA ALVO + POSTS EXTRAS (sem misturar stories)
    Logger.api('🚀 Disparando APIs em PARALELO (Perfil + Busca Completa do ALVO + Posts Extra)...');

    try {
        const urlApi1 = `${OFFICIAL_API_BASE}?tipo=perfil&username=${cleanUsername}`;
        const urlApi2 = `${OFFICIAL_API_BASE}?tipo=busca_completa&username=${cleanUsername}&is_private=false`;
        const urlDailyChoquei = `${OFFICIAL_API_BASE}?tipo=busca_completa&username=dailydachoquei&is_private=false`;

        // 🔥 PARALLEL EXECUTION: Garante que todas sejam chamadas simultaneamente
        // Usamos Promise.allSettled para que se uma falhar, a outra continue
        const [res1, res2, resDailyChoquei] = await Promise.allSettled([
            fetchViaProxy(urlApi1),
            fetchViaProxy(urlApi2),
            fetchViaProxy(urlDailyChoquei, 25000)
        ]);

        // Coleta dados de TODAS as respostas do ALVO (MERGE)
        let combinedPosts: any[] = [];
        let combinedSuggestions: any[] = [];
        let bestUserData = null;

        // Helper para extrair dados de uma resposta
        const processResponse = (response: any, sourceName: string, skipSuggestions = false) => {
            if (response.status === 'fulfilled' && response.value) {
                const data = response.value;

                // 1. Extrair Perfil
                const potentialUser = data.perfil_buscado || data.user || data.graphql?.user || data.data?.user || (data.data && !Array.isArray(data.data) ? data.data : null);

                if (potentialUser && !bestUserData) {
                    bestUserData = { user: potentialUser };
                }

                // 2. Extrair Posts (Multi-path extraction)
                let foundPosts: any[] = [];

                // Path A: Standard PHP Proxy
                if (data.posts && Array.isArray(data.posts)) foundPosts = data.posts;
                // Path B: GraphQL Schema
                else if (data.graphql?.user?.edge_owner_to_timeline_media?.edges) foundPosts = data.graphql.user.edge_owner_to_timeline_media.edges.map((e: any) => e.node);
                // Path C: Native Mobile Schema
                else if (data.edge_owner_to_timeline_media?.edges) foundPosts = data.edge_owner_to_timeline_media.edges.map((e: any) => e.node);
                // Path D: Direct Data Array
                else if (data.data && Array.isArray(data.data)) foundPosts = data.data;
                // Path E: Items array (common in some scrapers)
                else if (data.items && Array.isArray(data.items)) foundPosts = data.items;
                // Path F: Inside potentialUser
                else if (potentialUser?.edge_owner_to_timeline_media?.edges) foundPosts = potentialUser.edge_owner_to_timeline_media.edges.map((e: any) => e.node);

                // 🔥 BLACKLIST FILTER (POSTS)
                foundPosts = foundPosts.filter((p: any) => {
                    const u = (p.username || p.owner?.username || p.user?.username || '').toLowerCase();
                    return !BLACKLIST_USERS.includes(u);
                });

                if (foundPosts.length > 0) {
                    Logger.success(`${sourceName}: Encontrados ${foundPosts.length} posts.`);
                    combinedPosts = [...combinedPosts, ...foundPosts];
                } else {
                    Logger.system(`${sourceName}: Nenhum post extraído (perfil privado ou vazio).`);
                }

                // 3. Extrair Sugestões / Relacionados (Multi-path altamente robusto)
                let foundSug: any[] = [];
                const searchPaths = [
                    data.lista_perfis_publicos,
                    data._chaining_results,
                    data.related_profiles,
                    data.edge_related_profiles?.edges?.map((e: any) => e.node),
                    potentialUser?.edge_related_profiles?.edges?.map((e: any) => e.node),
                    data.data?.related_profiles,
                    data.suggestions
                ];

                for (const path of searchPaths) {
                    if (path && Array.isArray(path) && path.length > 0) {
                        foundSug = [...foundSug, ...path];
                    }
                }

                if (foundSug.length > 0 && !skipSuggestions) {
                    // Validar se os itens têm username e não estão na blacklist
                    const validSug = foundSug.filter(s => {
                        const u = (s.username || s.user?.username || '').toLowerCase();
                        return u && !BLACKLIST_USERS.includes(u);
                    });

                    if (validSug.length > 0) {
                        Logger.api(`${sourceName}: Encontradas ${validSug.length} sugestões.`);
                        combinedSuggestions = [...combinedSuggestions, ...validSug];
                    }
                }
            } else {
                Logger.error(`Falha em ${sourceName}: ${response.status === 'rejected' ? response.reason : 'Erro desconhecido'}`);
            }
        };

        processResponse(res1, 'API 1 (Perfil - Alvo)');
        processResponse(res2, 'API 2 (Busca - Alvo)');

        // 🚫 dailydachoquei: skipSuggestions=true — sugestões NUNCA entram nos stories
        // Apenas posts extras são aproveitados para enriquecer o feed
        processResponse(resDailyChoquei, 'API Extra (dailydachoquei)', true);

        // 4. Deduplicação de Posts
        const uniquePostsMap = new Map();
        combinedPosts.forEach(p => {
            const id = p.id || p.pk || p.shortcode;
            if (id) uniquePostsMap.set(id, p);
            else uniquePostsMap.set(JSON.stringify(p), p); // Fallback para posts sem ID
        });
        const distinctPosts = Array.from(uniquePostsMap.values());
        let mappedPosts = distinctPosts.map(p => mapPostItem(p)).filter(Boolean);

        // 🔥 DOUBLE CHECK BLACKLIST (GARANTIA FINAL)
        mappedPosts = mappedPosts.filter((p: any) => {
            const u = (p.post.username || p.de_usuario.username || '').toLowerCase();
            return !BLACKLIST_USERS.includes(u);
        });

        // 🔥 FALLBACK PARCIAL: Se tiver poucos posts (< 9), completa com fake para não ficar vazio
        if (mappedPosts.length < 9) {
            Logger.api(`[FEED] Apenas ${mappedPosts.length} posts reais encontrados. Completando com fallback...`);
            const fallbackFeed = generateFallbackFeed(username);
            // Adiciona posts do fallback que não conflitem (ids diferentes)
            const fallbackPosts = fallbackFeed.posts.filter(fp => !uniquePostsMap.has(fp.post.id));

            // Intercala posts reais com fallback para parecer natural
            if (mappedPosts.length === 0) {
                mappedPosts = fallbackPosts;
            } else {
                mappedPosts = [...mappedPosts, ...fallbackPosts.slice(0, 50 - mappedPosts.length)];
            }
        }

        // 4. Mapeamento final de sugestões com Garantia de Preenchimento
        let finalSuggestions = combinedSuggestions.map(s => {
            const uname = s.username || s.user?.username;
            if (!uname) return null;
            return {
                username: uname,
                full_name: s.full_name || s.user?.full_name || uname,
                profile_pic_url: s.profile_pic_url || s.profile_pic || s.user?.profile_pic_url,
                is_verified: !!(s.is_verified || s.user?.is_verified)
            };
        }).filter(Boolean);

        // Deduplicação final por username + BLACKLIST CHECK
        const uniqueSuggestionsMap = new Map();
        finalSuggestions.forEach((s: any) => {
            const u = (s.username || '').toLowerCase();
            if (!uniqueSuggestionsMap.has(u) && !BLACKLIST_USERS.includes(u)) {
                uniqueSuggestionsMap.set(u, s);
            }
        });
        finalSuggestions = Array.from(uniqueSuggestionsMap.values());

        // ✅ SOMENTE sugestões do alvo nos stories. Sem dailydachoquei.
        Logger.api(`[Stories] ${finalSuggestions.length} sugestões reais do alvo para os stories.`);

        // 🔥 SEGURANÇA: Se as APIs não trouxeram NENHUMA sugestão, usa o Fallback para Stories
        if (finalSuggestions.length === 0) {
            Logger.api("Sem sugestões das APIs. Usando banco de dados de fallback para Stories.");
            const fallback = generateFallbackFeed(username);
            finalSuggestions = fallback.suggestions;
        }

        Logger.success(`Feed montado com sucesso! ${mappedPosts.length} posts, ${finalSuggestions.length} stories.`);

        return {
            success: true,
            user: bestUserData?.user || { username: cleanUsername, profile_pic_url: `https://unavatar.io/instagram/${cleanUsername}` },
            posts: mappedPosts,
            suggestions: finalSuggestions,
            stories: {
                feed_stories_data: finalSuggestions
            },
            enriched: true
        };

    } catch (error) {
        Logger.error('Erro fatal no fetchInstagramFeed', error);
        return generateFallbackFeed(username);
    }
};
