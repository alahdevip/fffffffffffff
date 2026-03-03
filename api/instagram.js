const OFFICIAL_API_BASE = 'https://stalkea.ai/api/instagram.php';

export default async function handler(req, res) {
    // Configurar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 🔄 RETRY LOGIC (3 Tentativas)
    for (let attempt = 1; attempt <= 3; attempt++) {
        let targetUrl = '';
        try {
            const controller = new AbortController();
            // Timeout: 15s, 25s, 35s
            const timeoutDuration = 5000 + (attempt * 10000);
            const timeout = setTimeout(() => controller.abort(), timeoutDuration);

            // Repassa todos os parâmetros da query string
            const queryParams = new URLSearchParams(req.query).toString();
            targetUrl = `${OFFICIAL_API_BASE}?${queryParams}`;

            console.log(`[SpoofingProxy] Fetching: ${targetUrl} (Attempt ${attempt}/3)`);

            const response = await fetch(targetUrl, {
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
                // Se for 404, não tenta de novo (usuário não existe)
                if (response.status === 404) return res.status(404).json({ success: false, error: 'Not Found' });
                throw new Error(`Upstream API Error: ${response.status}`);
            }

            const data = await response.json();
            return res.status(200).json(data);

        } catch (error) {
            console.warn(`[InstagramProxy] Attempt ${attempt} failed:`, error.message);
            if (attempt === 3) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal Proxy Error (All attempts failed)',
                    details: error.message,
                    targetUrl: targetUrl // temporary debug
                });
            }
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
        }
    }

    return res.status(500).json({
        success: false,
        error: 'Internal Proxy Error (All attempts failed)'
    });
}
