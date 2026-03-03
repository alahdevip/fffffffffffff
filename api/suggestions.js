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

  // 3. Aplicar Weserv.nl com otimização
  const cleanAddress = finalUrl.replace(/^https?:\/\//, '');
  return `${MEDIA_PROXY}${encodeURIComponent(cleanAddress)}&w=600&q=80&output=webp`;
}

async function fetchFromInstagram(username) {
  const clean = username.replace('@', '').split('?')[0].split('&')[0].trim().toLowerCase();

  // Attempt 1: Official web profile info (may include facepile and related profiles)
  try {
    const resp = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${clean}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept': '*/*',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `https://www.instagram.com/${clean}/`
      }
    });
    if (resp.ok) {
      const json = await resp.json();
      const user = json?.data?.user;
      if (user) {
        const facepile = Array.isArray(user.profile_context_facepile_users) ? user.profile_context_facepile_users.map(u => ({
          username: u.username,
          full_name: u.full_name || u.username,
          profile_pic_url: proxyUrl(u.profile_pic_url),
          is_verified: !!u.is_verified
        })) : [];

        const relatedEdges = user.edge_related_profiles?.edges || [];
        const related = Array.isArray(relatedEdges) ? relatedEdges.map(e => ({
          username: e?.node?.username,
          full_name: e?.node?.full_name || e?.node?.username,
          profile_pic_url: proxyUrl(e?.node?.profile_pic_url),
          is_verified: !!e?.node?.is_verified
        })).filter(s => s.username) : [];

        const combined = [...facepile, ...related];
        if (combined.length > 0) {
          return combined;
        }
      }
    }
  } catch (e) { }

  // Attempt 2: Parse HTML for embedded JSON
  try {
    const res = await fetch(`https://www.instagram.com/${clean}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://www.instagram.com/'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const decode = s => (s || '').replace(/\\u0026/g, '&').replace(/\\\//g, '/');

      const addMatch = html.match(/__additionalDataLoaded\(.*?,\s*(\{[\s\S]*?\})\s*\)\s*;<\/script>/);
      if (addMatch && addMatch[1]) {
        try {
          const addJson = JSON.parse(addMatch[1]);
          const gUser = addJson?.graphql?.user;
          const edges = gUser?.edge_related_profiles?.edges || [];
          const related = edges.map(e => ({
            username: e?.node?.username,
            full_name: e?.node?.full_name || e?.node?.username,
            profile_pic_url: proxyUrl(decode(e?.node?.profile_pic_url)),
            is_verified: !!e?.node?.is_verified
          })).filter(s => s.username);
          if (related.length > 0) return related;
        } catch { }
      }

      const fpMatch = html.match(/"profile_context_facepile_users":\[(.*?)\]/);
      if (fpMatch && fpMatch[1]) {
        const content = `[${fpMatch[1]}]`;
        const arr = JSON.parse(content);
        const facepile = arr.map(u => ({
          username: u.username,
          full_name: u.full_name || u.username,
          profile_pic_url: proxyUrl(decode(u.profile_pic_url)),
          is_verified: !!u.is_verified
        })).filter(s => s.username);
        if (facepile.length > 0) return facepile;
      }

      const relMatch = html.match(/"edge_related_profiles":\{"edges":\[(.*?)\]\}/);
      if (relMatch && relMatch[1]) {
        const edges = JSON.parse(`[${relMatch[1]}]`);
        const related = edges.map(e => ({
          username: e?.node?.username,
          full_name: e?.node?.full_name || e?.node?.username,
          profile_pic_url: proxyUrl(decode(e?.node?.profile_pic_url)),
          is_verified: !!e?.node?.is_verified
        })).filter(s => s.username);
        if (related.length > 0) return related;
      }
    }
  } catch (e) { }

  // Attempt 3: Picuki HTML - extract similar/suggested profile links from profile page
  try {
    const picuki = await fetch(`https://www.picuki.com/profile/${clean}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36' }
    });
    if (picuki.ok) {
      const html = await picuki.text();
      const users = new Set();
      let suggestions = [];

      const linkRegex = /href="\/(?:profile|u)\/([A-Za-z0-9_.]+)"/g;
      let m;
      while ((m = linkRegex.exec(html)) !== null && suggestions.length < 25) {
        const u = (m[1] || '').toLowerCase();
        if (u && u !== clean && !users.has(u)) {
          users.add(u);
          suggestions.push({ username: u });
        }
      }

      // Enriquecer com foto de perfil real (sem unavatar)
      const enrich = async (u) => {
        try {
          const r = await fetch(`https://www.instagram.com/${u}/`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          });
          if (!r.ok) return null;
          const h = await r.text();
          const m = h.match(/"profile_pic_url_hd":"([^"']+)"/);
          const n = h.match(/"full_name":"([^"']*)"/);
          const pic = m ? proxyUrl(m[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&')) : '';
          return {
            username: u,
            full_name: n ? n[1] || u : u,
            profile_pic_url: pic,
            is_verified: h.includes('is_verified')
          };
        } catch { return null; }
      };

      const limit = suggestions.slice(0, 20);
      const enriched = [];
      for (const item of limit) {
        const e = await enrich(item.username);
        if (e) enriched.push(e);
      }

      if (enriched.length > 0) return enriched;
    }
  } catch (e) { }

  return [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { username = '' } = req.query;
    const suggestionsFromTarget = await fetchFromInstagram(username);

    if (suggestionsFromTarget.length > 0) {
      return res.status(200).json({
        success: true,
        suggestions: suggestionsFromTarget,
        posts: [],
        source: 'instagram-facepile'
      });
    }

    return res.status(200).json({ success: true, suggestions: [], posts: [], source: 'independent-system' });
  } catch (error) {
    console.error('Suggestions Error:', error);
    return res.status(200).json({ success: true, suggestions: [], posts: [], source: 'fallback' });
  }
}
