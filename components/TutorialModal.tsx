
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Bell, MoreVertical, ArrowLeft } from 'lucide-react';

interface TutorialModalProps {
    onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
    const [step, setStep] = useState(0);

    const stepsCount = 4;

    const nextStep = () => {
        if (step < stepsCount - 1) setStep(step + 1);
        else onClose();
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-[420px] bg-[#0c0c0c] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,1)] relative flex flex-col">

                {/* Close Button removed as requested */}


                {/* Modal Content */}
                <div className="flex-1 p-8 pb-4 flex flex-col items-center justify-center min-h-[460px]">

                    {step === 0 && (
                        <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                            <div className="mb-8">
                                <img
                                    src="https://i.ibb.co/9m6pG513/f85d6e00-b101-4f91-9aff-0f3b3a3f1d09.png"
                                    alt="Stalkea.ai"
                                    width="96"
                                    height="96"
                                    loading="lazy"
                                    className="w-24 h-24 object-contain"
                                />
                            </div>
                            <h2 className="text-[32px] font-black leading-tight mb-4 tracking-tight">
                                <span className="animate-text-shimmer bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">Tutorial rápido....</span>
                            </h2>
                            <p className="text-gray-400 text-lg font-medium max-w-[280px]">
                                Veja como pegar o nome de usuário do seu cônjuge corretamente....
                            </p>
                        </div>
                    )}

                    {step >= 1 && (
                        <div className="w-full h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                            {/* Instagram Header Mockup */}
                            <div className="bg-[#0c0c0c] w-full pt-4 px-2">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-6">
                                        <ArrowLeft size={24} className="text-white" />
                                        <div className="relative">
                                            <span className="text-white font-bold text-xl tracking-tight">stalkea.ai</span>
                                            {step === 2 && (
                                                <div className="absolute -inset-x-4 -inset-y-2 border-2 border-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <Bell size={24} className="text-white" />
                                        <MoreVertical size={24} className="text-white" />
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 mb-8">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
                                            <div className="w-full h-full rounded-full bg-black p-1">
                                                <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                                                    <img src="https://i.ibb.co/9m6pG513/f85d6e00-b101-4f91-9aff-0f3b3a3f1d09.png" width="40" height="40" loading="lazy" className="w-10 h-10 object-contain" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 pt-2">
                                        <div className="relative inline-block">
                                            <h3 className="text-white font-bold text-lg mb-4">Stalkea.ai Tecnologia</h3>
                                            {step === 3 && (
                                                <div className="absolute -inset-x-3 -inset-y-1 border-2 border-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <p className="text-white font-bold text-base leading-none">24</p>
                                                <p className="text-white/60 text-[11px] font-medium mt-1">posts</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-bold text-base leading-none">3.583</p>
                                                <p className="text-white/60 text-[11px] font-medium mt-1">seguidores</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-bold text-base leading-none">85</p>
                                                <p className="text-white/60 text-[11px] font-medium mt-1">seguindo</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step Instructions */}
                                <div className="mt-8">
                                    {step === 1 && (
                                        <p className="text-white font-medium text-lg leading-relaxed">
                                            <span className="animate-text-shimmer text-purple-500 font-bold">1º passo:</span> Abra o aplicativo do seu instagram e entre no perfil do seu cônjuge....
                                        </p>
                                    )}
                                    {step === 2 && (
                                        <p className="text-white font-medium text-lg leading-relaxed">
                                            <span className="animate-text-shimmer text-purple-500 font-bold">2º passo:</span> Pegue o nome de usuário que vai aparecer no topo do perfil do seu cônjuge, ao lado da setinha de voltar....
                                        </p>
                                    )}
                                    {step === 3 && (
                                        <p className="text-white font-medium text-lg leading-relaxed">
                                            <span className="text-red-500 font-bold italic">Atenção:</span> Não confunda com o nome do perfil, não é esse nome que usamos no Stalkeia.ai!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Navigation */}
                <div className="p-8 pt-0 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {[...Array(stepsCount)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'w-1.5 bg-white/10'}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {step > 0 && (
                            <button
                                onClick={prevStep}
                                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <button
                            onClick={nextStep}
                            className="h-12 px-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all animate-pulse-button"
                        >
                            {step === stepsCount - 1 ? 'Entendi' : 'Próximo'}
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <style>{`
                  @keyframes text-shimmer {
                    0% { background-position: 200% center; }
                    100% { background-position: -200% center; }
                  }
                  .animate-text-shimmer {
                    background: linear-gradient(to right, #a855f7, #ffffff, #6366f1, #a855f7);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: text-shimmer 3s linear infinite;
                    display: inline-block;
                  }
                  @keyframes pulse-button {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(168,85,247,0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(168,85,247,0.6); }
                  }
                  .animate-pulse-button {
                    animation: pulse-button 2s infinite ease-in-out;
                  }
                `}</style>
            </div>
        </div>
    );
};
