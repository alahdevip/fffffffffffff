const PUBLIC_KEY = 'alah7771_asld3o7c4xecaqwa';
const SECRET_KEY = 'nxi5p1kozg5tedoj1a5btpx8s5tdyqcwkcqtwvq3tliavfc1yyuhwc44lwk616m5';

async function testSigiloPay() {
    const payload = {
        identifier: `test_sigilo_${Date.now()}`,
        amount: 11.00,
        client: {
            name: 'Teste Pedro Sigilo',
            email: 'teste_sigilo@privatemail.com',
            phone: '(11) 99999-9999',
            document: '36535467538'
        },
        metadata: {
            test: "sim"
        }
    };

    console.log('--- TESTANDO SIGILOPAY (11 REAIS) ---');
    console.log('URL: https://app.sigilopay.com.br/api/v1/gateway/pix/receive');

    try {
        const response = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/receive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-public-key': PUBLIC_KEY,
                'x-secret-key': SECRET_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.status === 201) {
            console.log('\n--- ✅ SUCESSO (201 Created) ---');
            console.log('Transaction ID:', data.transactionId);
            console.log('Status:', data.status);
            console.log('\nCÓDIGO PIX COPIA E COLA:\n');
            console.log(data.pix.code);
            console.log('\nURL DO QR CODE:', data.pix.image);
        } else {
            console.log(`\n--- ❌ FALHA (Status: ${response.status}) ---`);
            console.log('Resposta:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('\n--- ❌ ERRO AO EXECUTAR FETCH ---');
        console.error(error.message);
    }
}

testSigiloPay();
