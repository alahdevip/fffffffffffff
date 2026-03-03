
export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, error: 'Payment ID is required' });
    }

    // SIGILOPAY - Primary gateway
    const PUBLIC_KEY = process.env.SIGILOPAY_PUBLIC_KEY;
    const SECRET_KEY = process.env.SIGILOPAY_SECRET_KEY;

    const BASE_URL = 'https://app.sigilopay.com.br/api/v1/gateway';

    if (PUBLIC_KEY && SECRET_KEY) {
        try {
            // Correct endpoint for status check: GET /gateway/transactions?id={id}
            const statusUrl = `${BASE_URL}/transactions?id=${id}`;

            const response = await fetch(statusUrl, {
                method: 'GET',
                headers: {
                    'x-public-key': PUBLIC_KEY,
                    'x-secret-key': SECRET_KEY,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Status mapping based on API response
                // SlimPay/SigiloPay expected statuses: PENDING, COMPLETED, PAID, FAILED, REFUNDED, CHARGED_BACK
                const status = (data.status || '').toUpperCase();
                const isPaid = status === 'COMPLETED' || status === 'PAID';

                return res.status(200).json({
                    success: true,
                    status: isPaid ? 'completed' : 'pending',
                    gateway: 'sigilopay',
                    data: data
                });
            } else {
                console.warn(`[Gateway Check] Request failed: ${response.status} ${response.statusText}`);

                // Fallback attempt: Try path param just in case
                if (response.status === 404) {
                    const fallbackUrl = `${BASE_URL}/transactions/${id}`;
                    const fallbackResponse = await fetch(fallbackUrl, {
                        method: 'GET',
                        headers: {
                            'x-public-key': PUBLIC_KEY,
                            'x-secret-key': SECRET_KEY
                        }
                    });

                    if (fallbackResponse.ok) {
                        const data = await fallbackResponse.json();
                        const status = (data.status || '').toUpperCase();
                        const isPaid = status === 'COMPLETED' || status === 'PAID';
                        return res.status(200).json({
                            success: true,
                            status: isPaid ? 'completed' : 'pending',
                            gateway: 'sigilopay',
                            data: data
                        });
                    }
                }
            }
        } catch (e) {
            console.error("[Gateway Check] Error:", e.message);
        }
    }

    // Default response if neither found
    return res.status(200).json({
        success: false,
        status: 'pending',
        error: 'Transaction not found or gateway keys missing'
    });
}
