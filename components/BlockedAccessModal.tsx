import React from 'react';

interface BlockedAccessModalProps {
    onGoToVip: () => void;
}

export const BlockedAccessModal: React.FC<BlockedAccessModalProps> = ({ onGoToVip }) => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in px-4 font-sans">

            {/* Main Modal Container */}
            <div className="relative w-full max-w-[420px] bg-[#101010] border border-white/10 rounded-2xl p-5 shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden animate-bounce-in">

                {/* Gray Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2b2b2b] to-[#0f0f0f]"></div>
                    <div className="absolute top-0 left-0 right-0 h-24 bg-white/5"></div>
                </div>

                <div className="relative z-10 text-center">
                    {/* Imagem de bloqueio personalizada */}
                    <div className="flex justify-center mb-4 pt-2">
                        <img
                            src="https://stalkea-seguro.online/images/logo-vert-transparente.png"
                            alt="Stalkea.ai"
                            className="w-[120px] h-auto drop-shadow-[0_0_20px_rgba(167,139,250,0.4)]"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="mb-6">
                        <h2 className="text-[24px] font-black text-white mb-2 leading-tight tracking-tighter uppercase">
                            Acesso <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 animate-gradient-text">BLOQUEADO!</span>
                        </h2>
                        <p className="text-gray-400 text-xs leading-relaxed font-medium px-4">
                            Seu tempo de teste expirou. Para continuar visualizando este perfil, você precisa do <span className="text-white font-bold">Acesso Completo</span>.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="grid grid-cols-2 gap-3 text-left relative z-10">
                            {[
                                { t: 'Busca Ilimitada', i: '∞' },
                                { t: 'Stories Ocultos', i: '📸' },
                                { t: 'GPS Real Time', i: '📍' },
                                { t: 'Espiar DMs', i: '💬' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 animate-slide-right" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[8px] text-purple-400 shrink-0">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] text-gray-200 font-bold tracking-tight leading-tight">{item.t}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 🚀 Ultra-Premium Action Button */}
                    <button
                        onClick={onGoToVip}
                        className="relative w-full group py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(124,58,237,0.3)] active:scale-95"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.3),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <span className="relative z-10 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                            LIBERAÇÃO IMEDIATA
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce-x">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </span>
                    </button>

                    {/* Footer Trust Bar - Slimmer */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-4 opacity-30">
                        <div className="flex items-center gap-1 text-[8px] text-white font-black uppercase tracking-widest">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            SECURE
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-white font-black uppercase tracking-widest">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                            DADOS CRIPTOGRAFADOS
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes bounce-in { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 0.9; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes slide-right { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes wave-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes gradient-text { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
                
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .animate-slide-right { animation: slide-right 0.5s ease-out forwards; }
                .animate-wave-slow { animation: wave-slow 20s linear infinite; }
                .animate-wave-fast { animation: wave-slow 12s linear infinite reverse; }
                .animate-gradient-text { background-size: 200% auto; animation: gradient-text 3s linear infinite; }
                .animate-bounce-x { animation: bounce-x 1s infinite; }
            `}</style>
        </div>
    );
};
