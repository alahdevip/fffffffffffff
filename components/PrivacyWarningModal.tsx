
import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, RefreshCw, Lock, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PrivacyWarningModalProps {
    targetUsername: string;
    payerName: string;
    price: number;
    onContinue: () => void;
    onEvent?: (data: any) => void;
}

export const PrivacyWarningModal: React.FC<PrivacyWarningModalProps> = ({ targetUsername, payerName, price, onContinue, onEvent }) => {
    const [status, setStatus] = useState<'info' | 'generating' | 'payment'>('info');
    const [pixData, setPixData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [disclosureTime, setDisclosureTime] = useState(180); // Inicia com 3 minutos (180s)
    const [finalPayerName, setFinalPayerName] = useState(payerName);

    useEffect(() => {
        const stored = localStorage.getItem('stalkea_payer_name');
        if (stored && stored !== 'usuário') setFinalPayerName(stored);
    }, []);

    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const handleCreateProtectionPix = async () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setLoading(true);
        setStatus('generating');
        try {
            const savedName = localStorage.getItem('stalkea_payer_name') || 'Usuario';
            const finalName = savedName.split(' ').length < 2 ? `${savedName} Stalkea` : savedName;
            const safeCpf = Math.random() > 0.5 ? '36535467538' : '43087094072';

            // Fix: Use relative path to avoid port mismatch issues locally/production
            const apiUrl = '/api/sigilopay';

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'pix',
                    username: targetUsername,
                    amount: price,
                    description: `Proteção de Identidade e Bloqueio de Alerta - Stalkea.ai`,
                    name: finalName,
                    email: `user_${Date.now()}@privatemail.com`,
                    cpf: safeCpf
                })
            });
            const data = await res.json();
            if (data.success) {
                setPixData(data);
                setStatus('payment');
                if (onEvent) onEvent({
                    eventName: 'AddPaymentInfo',
                    value: price,
                    name: savedName,
                    cpf: safeCpf
                });
            } else {
                alert(`Erro ao gerar PIX: ${data.error || 'Verifique sua conexão ou chave de API'}`);
                setStatus('info');
            }
        } catch (e) {
            console.error(e);
            setStatus('info');
        } finally {
            setLoading(false);
        }
    };

    const copyPix = () => {
        if (pixData?.pix_code) {
            navigator.clipboard.writeText(pixData.pix_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        if (pixData?.id && status === 'payment') {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/check-pix?id=${pixData.id}`);
                    const data = await res.json();
                    if (data.success && (data.status === 'completed' || data.status === 'paid')) {
                        clearInterval(interval);
                        localStorage.setItem('stalkea_paid_privacy', 'true');
                        if (onEvent) onEvent({ eventName: 'Purchase', value: price });
                        onContinue();
                    }
                } catch (e) { }
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [pixData, status, onContinue, onEvent, price]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDisclosureTime(prev => {
                if (prev <= 0) return 180;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 1.0;
        audio.loop = true;
        audioRef.current = audio;
        let hasPlayed = false;

        const playAudio = () => {
            if (hasPlayed) return;
            hasPlayed = true;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => { hasPlayed = false; });
            }
            window.removeEventListener('click', playAudio);
        };

        window.addEventListener('click', playAudio);
        return () => {
            audio.pause();
            window.removeEventListener('click', playAudio);
        };
    }, []);

    const formatShortTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-md px-4 font-sans animate-fade-in">
            <div className="relative w-full max-w-[380px] bg-[#0A0A0A] border border-red-500/30 rounded-2xl p-5 shadow-[0_0_50px_rgba(239,68,68,0.1)] overflow-hidden animate-bounce-in pulse-container">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[60px] bg-red-600/20 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-4">
                    <div className="text-center relative py-2 overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,red,red_10px,transparent_10px,transparent_20px)] animate-[pulse_2s_infinite]"></div>
                        <div className="relative z-10">
                            <div className="flex justify-center mb-3">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></div>
                                    <div className="w-14 h-14 rounded-full bg-black border-2 border-red-600 flex items-center justify-center">
                                        <ShieldAlert className="w-7 h-7 text-red-500 animate-[pulse_0.5s_infinite]" strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-white leading-none tracking-tighter uppercase relative inline-block">
                                <span className="absolute -inset-1 blur-sm text-red-600 opacity-50 animate-pulse">AVISO DE SEGURANÇA!</span>
                                <span className="relative z-10 drop-shadow-xl">AVISO DE <span className="text-red-500 animate-[pulse_0.2s_infinite]">SEGURANÇA!</span></span>
                            </h2>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center space-y-2">
                        <p className="text-gray-300 text-[11px] leading-snug">
                            <span className="text-white font-bold">{finalPayerName !== 'usuário' ? finalPayerName : 'usuário'}</span>, para seu <span className="text-white font-bold">anonimato</span>, detectamos que o Instagram informará que seus dados estão vinculados ao acesso de <span className="text-red-400 font-bold">@{targetUsername}</span>.
                        </p>
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-left">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-[10px] text-red-100 font-bold leading-tight">
                                <span className="text-red-500 uppercase animate-pulse">IDENTIDADE EXPOSTA:</span> O seu completo nome aparecerá no log do alvo.
                            </p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 pt-1">
                            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                                <span className="text-[8px] text-red-500 uppercase font-black tracking-tighter">caso não ative será enviado em:</span>
                                <span className="text-xs font-mono font-black text-red-500 tabular-nums">{formatShortTime(disclosureTime)}</span>
                            </div>
                            <span className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mt-0.5 animate-pulse">"O INSTAGRAM NOTIFICARÁ @{targetUsername}"</span>
                        </div>
                    </div>

                    {status === 'info' && (
                        <div className="relative overflow-hidden rounded-xl p-[1px] shadow-lg group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-xl"></div>
                            <div className="relative bg-[#0F0F0F] rounded-[11px] p-4 pt-8">
                                <div className="absolute top-0 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-b-lg border-x border-b border-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                                    <span className="text-[7px] font-black text-white uppercase tracking-widest flex items-center gap-1"><Lock size={8} /> Protocolo de Sigilo</span>
                                </div>
                                <div className="absolute top-3 left-3 bg-white text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Proteção</div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-500/30 flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                                        <ShieldCheck className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-white leading-none tracking-tight mb-1">Proteção de Identidade</h3>
                                        <p className="text-red-300 text-[10px] font-semibold leading-tight">Ocultar <span className="text-white">"Anônimo"</span> do alvo</p>
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-300 leading-relaxed mb-4 bg-black/30 p-3 rounded-lg border border-white/5">
                                    <span className="text-white font-bold">@{targetUsername}</span> não verá seu nome real. Seus dados serão <span className="text-red-300 font-semibold">criptografados</span> e substituídos por hash anônimo.
                                </p>
                                <button onClick={handleCreateProtectionPix} disabled={loading} className="w-full group/btn relative overflow-hidden rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-[length:200%_100%] animate-[gradient_2s_ease_infinite]"></div>
                                    <div className="relative py-3.5 px-4 flex flex-col items-center justify-center text-center leading-none gap-1">
                                        <span className="text-[14px] font-black text-white uppercase flex items-center gap-2"><Lock className="w-4 h-4" strokeWidth={3} /> {loading ? 'ATIVANDO...' : 'ATIVAR CRIPTOGRAFIA'}</span>
                                        <span className="text-[10px] text-red-100 font-bold italic tracking-wide">100% Anônimo • Sem Rastros</span>
                                    </div>
                                </button>
                                <p className="text-center text-[9px] text-gray-500 mt-3 flex items-center justify-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-purple-500" />
                                    <span>Proteção ativa por <span className="text-white font-bold">30 dias</span></span>
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'generating' && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center space-y-3">
                            <RefreshCw className="w-8 h-8 text-white mx-auto animate-spin" />
                            <p className="text-white font-bold text-xs">Gerando Criptografia...</p>
                        </div>
                    )}

                    {status === 'payment' && pixData?.pix_code && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center space-y-3 animate-fade-in">
                            <div className="bg-white p-2 rounded-xl inline-block mx-auto">
                                <QRCodeSVG value={pixData.pix_code} size={128} level={"M"} includeMargin={true} />
                            </div>
                            <button onClick={copyPix} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-2">
                                {copied ? <Check className="w-3 h-3 text-purple-500" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'COPIADO!' : 'COPIAR CHAVE PIX'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes bounce-in { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes pulse-intense {
                    0% { transform: scale(1); box-shadow: 0 0 50px rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); }
                    50% { transform: scale(1.02); box-shadow: 0 0 70px rgba(239, 68, 68, 0.3); border-color: rgba(239, 68, 68, 0.6); }
                    100% { transform: scale(1); box-shadow: 0 0 50px rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .pulse-container { animation: pulse-intense 2s ease-in-out infinite; will-change: transform, box-shadow, border-color; }
            `}</style>
        </div>
    );
};
