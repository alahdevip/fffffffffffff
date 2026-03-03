import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, CheckCircle, QrCode, CreditCard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface StalkeaPayCheckoutProps {
    onClose: () => void;
    username: string;
    amount: number;
    onPaymentSuccess?: (payerName?: string) => void;
    onEvent?: (data: any) => void;
}

export const StalkeaPayCheckout: React.FC<StalkeaPayCheckoutProps> = ({ onClose, username, amount, onPaymentSuccess, onEvent }) => {
    const [loading, setLoading] = useState(false);

    // Pix State
    const [pixData, setPixData] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const [status, setStatus] = useState<'form' | 'processing' | 'success'>('form');
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'expired'>('pending');

    // Common Form Fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');

    // Force Price Update on Mount (Sync with Global Config)
    const [dynamicAmount, setDynamicAmount] = useState(amount);

    // Payment Method Selection
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');

    // Credit Card State (REMOVED - Redirect Flow)
    const [installments, setInstallments] = useState(1);

    useEffect(() => {
        setDynamicAmount(amount);
    }, [amount]);

    useEffect(() => {
        const trap = () => {
            // Prevent navigating back to CTA
            window.history.pushState(null, '', window.location.href);
        };
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', trap);
        const preventKeys = (e: KeyboardEvent) => {
            // Se o usuário estiver digitando em um input, NÃO bloquear o Backspace
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

            if (isInput && e.key === 'Backspace') {
                return;
            }

            // Block Alt+Left and Backspace navigation on some browsers
            if ((e.altKey && e.key === 'ArrowLeft') || e.key === 'Backspace') {
                e.preventDefault();
                e.stopPropagation();
                trap();
            }
        };
        window.addEventListener('keydown', preventKeys, true);
        return () => {
            window.removeEventListener('popstate', trap);
            window.removeEventListener('keydown', preventKeys, true);
        };
    }, []);

    // Testimonials Logic
    const [testimonialStep, setTestimonialStep] = useState(0);
    const testimonials = [
        {
            name: 'Luquinhas_ff',
            time: '3h atrás',
            text: 'top demais !!! consegui ver tudo o que eu queria sem ninguem saber . recomendo',
            img: 'https://i.pinimg.com/736x/85/56/9e/85569ef6d28e4497a56fb12f7ab36f7e.jpg'
        },
        {
            name: 'Beatriz.souza',
            time: '3h atrás',
            text: 'amei a praticidade, na mesma hora ja consegui ver tudo, super recomendo',
            img: 'https://i.pinimg.com/736x/d3/e4/9b/d3e49bec46d4c38a295ecd24cf0ecebe.jpg'
        },
        {
            name: 'Mariana_oliveira',
            time: '5h atrás',
            text: 'gente é verdade mesmo, liberou na hora, muito rapido',
            img: 'https://i.pinimg.com/736x/97/53/89/9753899b2380012bffaa9d298631033c.jpg'
        },
        {
            name: 'Fernando_lima',
            time: '4h atrás',
            text: 'pode confiar, liberou instantaneo, muito rapido',
            img: 'https://i.pinimg.com/736x/ff/8a/33/ff8a3356234e5e94596d33ee0d2e4c6d.jpg'
        },
        {
            name: 'Camila.martins',
            time: '1h atrás',
            text: 'muito bom, ja desbloqueou, sem enrolacao. nota 10',
            img: 'https://i.pinimg.com/736x/e1/2a/4a/e12a4a7fab8543740c091559e54e9101.jpg'
        },
        {
            name: 'Larissa_silva',
            time: '4h atrás',
            text: 'surreal de rapido, ja liberou o acesso completo, to passada',
            img: 'https://i.pinimg.com/736x/ae/47/13/ae47130f1307a562ef0bbe02d31e1209.jpg'
        },
        {
            name: 'Amanda.costa',
            time: '2h atrás',
            text: 'melhor investimento, ja to usando, liberou na hora',
            img: 'https://i.pinimg.com/736x/ac/27/d8/ac27d8d33c19a0f4d0fc90f1139c27a7.jpg'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTestimonialStep(prev => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Touch / Swipe Logic
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            setTestimonialStep((prev) => (prev + 1) % testimonials.length);
        }
        if (isRightSwipe) {
            setTestimonialStep((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
        }

        // Reset
        setTouchStart(null);
        setTouchEnd(null);
    };

    // 🕵️ TRACKING AVANÇADO (Form Abandonment & Lead Parcial)
    const handleBlur = (field: string, value: string) => {
        if (value && value.length > 3 && onEvent) {
            // Envia evento silencioso para o Supabase (Lead Parcial)
            onEvent({
                eventName: 'form_partial_lead',
                field,
                value, // Salva o dado digitado (Lead)
                step: 'checkout_form'
            });
        }
    };

    // Restore pending PIX on mount to prevent loss on reload
    useEffect(() => {
        const savedPix = localStorage.getItem('stalkea_pending_pix');
        if (savedPix) {
            try {
                const parsed = JSON.parse(savedPix);
                // Check if it's not too old (e.g., 1 hour)
                const created = parsed.timestamp || 0;
                if (Date.now() - created < 3600000) {
                    setPixData(parsed.data);
                    setStatus('processing'); // Show QR code screen directly
                    if (parsed.data.name) setName(parsed.data.name);
                } else {
                    localStorage.removeItem('stalkea_pending_pix');
                }
            } catch (e) {
                localStorage.removeItem('stalkea_pending_pix');
            }
        }
    }, []);

    // Polling for Pix status
    useEffect(() => {
        if (!pixData || status === 'success') return;

        const interval = setInterval(async () => {
            try {
                const transactionId = pixData.id || pixData.txid || pixData.transactionId;
                if (!transactionId) return;

                const res = await fetch(`/api/check-pix?id=${transactionId}`);
                const data = await res.json();

                if (data.status === 'completed' || data.status === 'paid') {
                    // 🛡️ PERSISTÊNCIA RELAMPAGO: Salva no banco no milissegundo que pagou
                    // Isso garante que se ele der F5 ou fechar a aba agora, ele já cai no Privacy Check
                    fetch('/api/track-ip', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: localStorage.getItem('stalkea_current_user'),
                            step: 'privacy_check',
                            payment_verified: true
                        })
                    }).catch(() => { });

                    // Persistence local immediate
                    localStorage.setItem('stalkea_payment1_verified', 'true');
                    localStorage.removeItem('stalkea_pending_pix');
                    if (name) localStorage.setItem('stalkea_payer_name', name);

                    setPaymentStatus('completed');
                    setStatus('success');
                    clearInterval(interval);

                    // Delay redirect to show success message
                    setTimeout(() => {
                        if (onEvent) {
                            onEvent({
                                eventName: 'Purchase',
                                value: dynamicAmount,
                                currency: 'BRL',
                                email: email,
                                name: name,
                                cpf: cpf
                            });
                        }
                        if (onPaymentSuccess) onPaymentSuccess(name);
                    }, 2000);
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [pixData, status, name, dynamicAmount]);

    const handleCardPayment = () => {
        // Redirecionamento simples para o checkout externo
        window.location.href = 'https://go.ironpayapp.com.br/irfgp2vv8n';
    };

    const handlePaymentSubmit = () => {
        if (paymentMethod === 'pix') {
            handlePixPayment();
        } else {
            handleCardPayment();
        }
    };

    const handlePixPayment = async () => {
        setLoading(true);
        setStatus('processing');

        try {
            // 🛡️ Fallback de CPF para garantir aprovação (User Request)
            const cleanCpf = cpf.replace(/\D/g, '');
            const fallbackCpfs = ['23228843831', '43001674431', '23790941956', '36535467538', '43087094072'];

            // Função simples para validar se não é uma sequência repetida (comum em CPFs falsos)
            const isInvalidSequence = (s: string) => /^(.)\1+$/.test(s);

            const isValidLength = cleanCpf.length === 11;
            const isLogical = isValidLength && !isInvalidSequence(cleanCpf);

            // Se for inválido ou sequência repetida, usa um do backup para não travar a venda
            const safeCpf = isLogical ? cleanCpf : fallbackCpfs[Math.floor(Math.random() * fallbackCpfs.length)];

            // 🔄 SWITCHED TO SIGILOPAY (User Request)
            const gatewayEndpoint = '/api/sigilopay';
            const fbc = document.cookie.split('; ').find(row => row.startsWith('_fbc='))?.split('=')[1];
            const fbp = document.cookie.split('; ').find(row => row.startsWith('_fbp='))?.split('=')[1];
            const eventId = `evt_init_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const res = await fetch(gatewayEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'pix',
                    username,
                    amount: dynamicAmount,
                    name,
                    email,
                    cpf: safeCpf,
                    description: `Stalkea Acesso - ${name}`,
                    fbc,
                    fbp,
                    eventId
                })
            });
            const data = await res.json();

            if (!res.ok) {
                // Trata erro retornado pela API (400, 422, 500)
                throw new Error(data.message || data.error || 'Erro desconhecido no gateway');
            }

            if (data.pix_qr_code || data.pix_code) {
                setPixData(data);

                // 💾 Save pending PIX to prevent loss on reload
                localStorage.setItem('stalkea_pending_pix', JSON.stringify({
                    timestamp: Date.now(),
                    data: { ...data, name, email, cpf, eventId } // Save user data and eventId
                }));

                // Só dispara evento se sucesso
                if (onEvent) {
                    try {
                        onEvent({
                            eventName: 'InitiateCheckout',
                            value: dynamicAmount,
                            method: 'pix',
                            name,
                            email,
                            cpf,
                            eventId // Pass the same eventId for matching
                        });
                    } catch (e) { console.warn("Analytics Error", e); }
                }
            } else {
                throw new Error('Falha ao gerar Pix: Resposta incompleta do gateway');
            }
        } catch (err: any) {
            console.error("Erro no Checkout:", err);
            // Log Payment Error to Supabase
            if (onEvent) {
                onEvent({
                    eventName: 'payment_error',
                    error: err.message || 'Erro desconhecido',
                    step: 'checkout_payment'
                });
            }
            setStatus('form');
            // Mostra o erro real para o usuário corrigir (ex: CPF inválido)
            alert(`Não foi possível gerar o Pix:\n${err.message || err}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#F4F4F4] overflow-y-auto no-scrollbar max-w-[500px] mx-auto z-[200] pb-10">
            <div className="w-full max-w-md mx-auto space-y-4">

                {/* Back Button removed */}

                {/* Banner */}
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <img
                        src="https://perfectpay-files.s3.us-east-2.amazonaws.com/app/img/plan/PPPBCKOS/pplqqmin7thirdimagepathrelatorio_1_mes_1.png"
                        className="w-full h-auto"
                        alt="Acesso Imediato"
                    />
                </div>

                {/* Product Summary Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center shrink-0 shadow-md">
                        <img
                            src="https://i.ibb.co/dw6fj3rT/pplqqmin7imagepathlogo-vert-fundo-preto.png"
                            className="w-10 h-auto object-contain"
                            width="40"
                            height="40"
                            loading="lazy"
                            alt="Logo"
                        />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-medium">Você está adquirindo</div>
                        <div className="font-bold text-gray-900 text-lg leading-tight">Acesso ao perfil @{username.length > 12 ? username.substring(0, 12) + '...' : username}</div>
                        <div className="text-blue-600 font-bold text-xl mt-1">R$ {amount.toFixed(2).replace('.', ',')}</div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-blue-600/30">1</div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">Dados cadastrais</h3>
                            <p className="text-gray-500 text-sm mt-0.5">Complete os dados de cadastro</p>
                        </div>
                    </div>

                    {status === 'form' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={() => handleBlur('name', name)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    placeholder="Digite seu nome completo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    E-mail <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => {
                                        handleBlur('email', email);
                                        localStorage.setItem('stalkea_user_email', email);
                                    }}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    placeholder="Digite seu e-mail"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CPF <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={cpf}
                                    onChange={(e) => {
                                        let value = e.target.value;

                                        // Remove todos os caracteres não numéricos
                                        let numbers = value.replace(/\D/g, '');

                                        // Limita a 11 dígitos
                                        if (numbers.length > 11) numbers = numbers.slice(0, 11);

                                        // Aplica a máscara apenas se houver números suficientes
                                        if (numbers.length > 9) {
                                            value = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                                        } else if (numbers.length > 6) {
                                            value = numbers.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
                                        } else if (numbers.length > 3) {
                                            value = numbers.replace(/(\d{3})(\d{3})/, '$1.$2');
                                        } else {
                                            value = numbers;
                                        }

                                        setCpf(value);
                                    }}
                                    onBlur={() => {
                                        handleBlur('cpf', cpf);
                                        localStorage.setItem('stalkea_user_cpf', cpf.replace(/\D/g, ''));
                                    }}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 shrink-0" />
                            <span>Seus dados estão seguros e protegidos.</span>
                        </div>
                    )}
                </div>

                {/* Payment Card / Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-blue-600/30">2</div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">Pagamento</h3>
                            <p className="text-gray-500 text-sm mt-0.5">Finalize sua compra com segurança</p>
                        </div>
                    </div>

                    {status === 'form' && (
                        <div className="flex flex-col gap-4">
                            {/* Seletor de Método de Pagamento */}
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <button
                                    onClick={() => setPaymentMethod('pix')}
                                    className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${paymentMethod === 'pix' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                >
                                    <img src="https://app.ironpayapp.com.br/assets/pix-21b9f5c7.jpg" className="w-5 h-5 object-contain" alt="Pix" />
                                    <span className="font-bold text-sm">Pix</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('credit_card')}
                                    className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${paymentMethod === 'credit_card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                >
                                    <CreditCard className="w-5 h-5" />
                                    <span className="font-bold text-sm">Cartão</span>
                                </button>
                            </div>

                            {/* Conteúdo Explicativo para Cartão (Sem Form) */}
                            {paymentMethod === 'credit_card' && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in text-center">
                                    <div className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide">
                                        Aprovação Imediata
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">
                                        Acesso imediato! Pagamento via cartão de crédito com aprovação instantânea.
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                                        <ShieldCheck className="w-3 h-3 text-green-600" />
                                        Ambiente 100% Seguro
                                    </div>
                                </div>
                            )}

                            {/* Conteúdo Explicativo para Pix */}
                            {paymentMethod === 'pix' && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 animate-fade-in">
                                    <div className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide">
                                        Aprovação Imediata
                                    </div>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                            <span>Liberação imediata!</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                            <span>É simples, só usar o aplicativo de seu banco para pagar PIX.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                            <span>Super seguro. O pagamento PIX foi desenvolvido pelo Banco Central para facilitar pagamentos.</span>
                                        </li>
                                    </ul>
                                </div>
                            )}

                            <button
                                onClick={handlePaymentSubmit}
                                disabled={loading || !name || !email || cpf.length < 14}
                                className="w-full py-4 px-6 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 mt-2"
                            >
                                {loading ? 'Processando...' : (paymentMethod === 'pix' ? 'ADQUIRIR ACESSO COMPLETO' : 'IR PARA PAGAMENTO SEGURO')}
                            </button>

                            <div className="flex items-center justify-center gap-2">
                                {paymentMethod === 'pix' ? (
                                    <>
                                        <img src="https://app.ironpayapp.com.br/assets/pix-21b9f5c7.jpg" className="h-5 w-auto object-contain" alt="Pix" />
                                        <span className="text-xs font-semibold text-gray-500">Pagamento instantâneo via Pix</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-semibold text-gray-500">Pagamento processado externamente</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {status === 'processing' && loading && (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <h3 className="text-lg font-bold text-gray-900">Gerando Pix...</h3>
                            <p className="text-gray-500 text-sm">Aguarde um momento</p>
                        </div>
                    )}

                    {status === 'processing' && pixData && pixData.pix_code && (
                        <div className="text-center space-y-6 pt-2">
                            <div className="bg-gray-50 p-4 rounded-xl inline-block border border-gray-200">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixData.pix_code)}`}
                                    alt="QR Code Pix"
                                    className="w-48 h-48 object-contain mix-blend-multiply"
                                    onError={(e) => {
                                        if (pixData.pix_qr_code) e.currentTarget.src = pixData.pix_qr_code;
                                    }}
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Código Pix (Copia e Cola)</div>
                                <div className="flex items-center gap-2">
                                    <input
                                        readOnly
                                        value={pixData.pix_code}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-mono text-xs outline-none"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(pixData.pix_code);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                        title="Copiar"
                                    >
                                        {copied ? <CheckCircle size={20} /> : <div className="font-bold text-xs whitespace-nowrap px-1">COPIAR</div>}
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-100">
                                Após o pagamento, o acesso será liberado automaticamente.
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h3>
                            <p className="text-gray-500">Redirecionando para o seu acesso...</p>
                        </div>
                    )}
                </div>

                {/* Testimonials Section */}
                <div
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden select-none cursor-grab active:cursor-grabbing touch-pan-y"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">
                            Veja o que falam as pessoas que usam o <span className="text-blue-600">Stalkea.ai</span>
                        </h2>
                    </div>

                    <div className="relative min-h-[140px] transition-all duration-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600 shrink-0 shadow-sm">
                                <img
                                    src={testimonials[testimonialStep].img}
                                    className="w-full h-full object-cover"
                                    alt="User"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-900 text-sm">{testimonials[testimonialStep].name}</p>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs">{testimonials[testimonialStep].time}</p>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed pl-1 italic">
                            "{testimonials[testimonialStep].text}"
                        </p>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-1.5 mt-4">
                        {testimonials.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === testimonialStep ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>



                {/* Footer Security */}
                <div className="text-center pt-4 pb-8">
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-medium">
                        <ShieldCheck size={14} />
                        <span>Pagamento 100% Seguro</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
