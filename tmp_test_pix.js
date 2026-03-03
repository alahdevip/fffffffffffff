
async function testSlimPay() {
    const payload = {
        type: 'pix',
        amount: 12.00,
        name: 'Teste Pedro',
        email: 'teste@slimpay.com.br',
        cpf: '36535467538',
        username: 'eu.wlysilva'
    };

    const PUBLIC_KEY = 'pedroweslley672_h4vkm3a0cky7c1pz';
    const SECRET_KEY = 'hh1isnrqowlj9cttoekp5wm6rwswilag0ygnln5pb8uh42x4z1xusmta52ekgz0b';

    console.log('--- TESTANDO SLIMPAY (12 REAIS) ---');

    try {
        const response = await fetch('https://app.slimmpayy.com.br/api/v1/gateway/pix/receive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-public-key': PUBLIC_KEY,
                'x-secret-key': SECRET_KEY
            },
            body: JSON.stringify({
                identifier: `test_${Date.now()}`,
                amount: payload.amount,
                client: {
                    name: payload.name,
                    email: payload.email,
                    phone: '(11) 99999-9999',
                    document: payload.cpf
                },
                products: [{
                    id: 'test-12',
                    name: 'Teste de 12 Reais',
                    quantity: 1,
                    price: payload.amount
                }]
            })
        });

        const data = await response.json();
        console.log('RESPOSTA SLIMPAY:', JSON.stringify(data, null, 2));

        if (data.status === 'OK' && data.pix?.code) {
            console.log('\n--- ✅ SUCESSO! ---');
            console.log('\nCÓDIGO PIX COPIA E COLA:\n');
            console.log(data.pix.code);
            console.log('\n--- 🕵️ DADOS ADICIONAIS ---');
            console.log('ID DA TRANSAÇÃO:', data.transactionId);
        } else {
            console.log('\n--- ❌ FALHA NA API ---');
            console.log('Erro:', data.message || data.errorDescription || 'Desconhecido');
        }
    } catch (error) {
        console.error('ERRO CRÍTICO NO TESTE:', error.message);
    }
}

testSlimPay();
