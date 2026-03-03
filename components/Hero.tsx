
import React, { useState, useEffect, useRef } from 'react';
import { Lock, Key, Check, Eye, EyeOff, Facebook, ChevronDown, ChevronRight, AlertCircle, HelpCircle } from 'lucide-react';
import { TutorialModal } from './TutorialModal';

interface HeroProps {
  onStart: (username: string) => void;
  error?: string | null;
  onClearError?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, error, onClearError }) => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isEyeClosing, setIsEyeClosing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  // Refs for typing animation (Performance Optimization: 60fps via rAF)
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const text3Ref = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  const [showInteraction, setShowInteraction] = useState(true);
  const [showBadges, setShowBadges] = useState(true);

  const fullText1 = "O que seu ";
  const fullText2 = "Cônjuge";
  const fullText3 = " faz quando está no Instagram?";
  const fullDesc = "Descubra a verdade sobre qualquer pessoa, acessando o instagram dela!";

  useEffect(() => {
    if (text1Ref.current) text1Ref.current.textContent = fullText1;
    if (text2Ref.current) text2Ref.current.textContent = fullText2;
    if (text3Ref.current) text3Ref.current.textContent = fullText3;
    if (descRef.current) descRef.current.textContent = fullDesc;
    if (cursorRef.current) cursorRef.current.style.opacity = '0';
  }, []);

  // Profile Counter Logic
  const [profileCount, setProfileCount] = useState(76554);

  useEffect(() => {
    const interval = setInterval(() => {
      // Incrementa randomicamente entre 1 e 5 para parecer natural
      setProfileCount(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 2500); // A cada 2.5 segundos

    return () => clearInterval(interval);
  }, []);

  const handleStartInteraction = () => {
    setShowInput(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onStart(inputValue.replace('@', '').trim());
    }
  };

  const getFormattedDate = () => {
    const now = new Date();
    const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    const dayName = days[now.getDay()];
    const dayNum = now.getDate();
    const monthName = months[now.getMonth()];

    return `${dayName}, ${dayNum} de ${monthName}`;
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-0 pb-8 overflow-hidden">
      <div className="matrix-bg matrix-bg-1"></div>
      <div className="matrix-bg matrix-bg-2"></div>
      <div className="w-full max-w-[500px] flex flex-col items-center relative z-10">

        {/* Card Principal - Made more square and compact */}
        <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-5 pt-3 md:p-6 flex flex-col items-center shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden ring-1 ring-white/5">

          {/* CSS BACKGROUND POPUP - GRADIENT */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[40px] bg-gradient-to-b from-[#1a1a2e]/30 to-black/60">
            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
          </div>

          {/* Background Gradient for the logo area to avoid "black hole" look */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-[240px] bg-white/5 blur-[80px] rounded-full pointer-events-none z-0"></div>



          <div className="flex items-center justify-center mb-0 relative z-10 w-full">
            <img
              src="https://i.ibb.co/9m6pG513/f85d6e00-b101-4f91-9aff-0f3b3a3f1d09.png"
              alt="Stalkea.ai"
              width="288"
              height="288"
              loading="eager"
              className="w-64 h-64 md:w-72 md:h-72 object-contain drop-shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all duration-700"
              onClick={() => window.location.reload()}
            />
          </div>

          {/* Headline com Roxo Vibrante - Typewriter Effect Optimized */}
          <h1 className="text-white text-[28px] md:text-[36px] font-black text-center leading-[1.1] mb-2 -mt-12 tracking-tighter flex flex-wrap justify-center items-center content-center relative z-10">
            <span ref={text1Ref}></span>
            <span ref={text2Ref} className="relative inline-block mx-2 font-black animate-text-shine bg-clip-text text-transparent bg-gradient-to-r from-[#a855f7] via-[#d8b4fe] to-[#a855f7] bg-[length:200%_auto] drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            </span>
            <span ref={text3Ref}></span>
          </h1>

          {/* Descrição - Typewriter Effect Optimized */}
          <div className="text-gray-300 text-center text-[15px] md:text-[16px] font-medium leading-relaxed mb-6 max-w-[340px] h-fit relative z-10">
            Descubra a verdade sobre <span className="text-[#a855f7] font-bold">qualquer pessoa</span>, acessando o instagram dela!
          </div>

          {/* Form / Input / Interaction Area (Wave Reveal) */}
          <div className="w-full h-[70px] relative z-10">
            {!showInput ? (
              <button
                onClick={handleStartInteraction}
                className="w-full h-[68px] relative rounded-full font-bold text-[19px] text-white flex items-center justify-center gap-3 overflow-hidden bg-gradient-to-r from-[#6B59D8] to-[#9D4EDD]"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <div className="animate-eye-blink">
                    <Eye size={24} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="font-black text-[22px] tracking-tight uppercase">Espionar Agora</span>
                </div>
              </button>

            ) : (
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="relative group overflow-hidden rounded-full">
                  <div className="absolute inset-0 z-0 pointer-events-none bg-[#1a1a1a]">
                    <div className="absolute inset-0 bg-black/60" />
                  </div>

                  <div className="absolute left-6 inset-y-0 flex items-center text-gray-500 font-black text-[22px] opacity-80 z-10 leading-none pointer-events-none">
                    @
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: nomedapessoa"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (error && onClearError) onClearError();
                    }}
                    className="w-full h-16 bg-transparent border-2 border-[#1a1a1a] focus:border-white/50 rounded-full pl-14 pr-20 text-white font-bold text-lg placeholder:text-gray-400 outline-none shadow-inner relative z-10"
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-[#7c3aed] rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-[#1a1a1a] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)] z-20"
                  >
                    <ChevronRight size={22} strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Error Box (Ref: Screenshot) */}
          {error && (
            <div className="w-full mt-4 animate-in fade-in slide-in-from-top-2 duration-300 relative z-[50]">
              <button
                onClick={() => {
                  console.log("Opening tutorial...");
                  setShowTutorial(true);
                }}
                className="w-full bg-[#1a0f0f] border border-red-900/80 rounded-[20px] p-4 flex items-center gap-3 active:scale-[0.98] transition-all hover:bg-[#2a1212] cursor-pointer group text-left shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-red-500 font-bold text-[13px] leading-tight">
                    Erro ao buscar perfil: <span className="text-red-400">{error}</span>{' '}
                    <span className="underline text-red-500 group-hover:text-red-400 transition-colors">
                      Dúvidas? Clique aqui
                    </span>
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Botão Tutorial Permanente */}
          <div className="w-full mt-6 flex justify-center relative z-[60]">
            <button
              onClick={() => {
                console.log("Botão Tutorial clicado!");
                setShowTutorial(true);
              }}
              className="flex items-center gap-2 px-6 py-2.5 text-white/80 hover:text-white transition-all active:scale-95 group cursor-pointer"
            >
              <HelpCircle size={18} className="text-[#a855f7] group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <span className="text-sm font-bold tracking-wide animate-pulse">Tutorial</span>
            </button>
          </div>

          {/* Badges Inferiores Estilo Imagem (Wave Reveal) */}
          {/* Badges Inferiores Ultra-Minimalistas (Ref: Image 2) */}
          <div className="flex flex-row justify-center items-center gap-5 md:gap-8 mt-6">
            <BadgeMinimal
              icon={<Lock size={15} className="text-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
              text="100% Anônimo"
            />
            <BadgeMinimal
              icon={<Key size={15} className="text-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
              text="Sem Senha"
            />
            <BadgeMinimal
              icon={<Check size={15} className="text-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
              text="Teste Agora"
            />
          </div>
        </div>

        <div className="mt-4 text-center opacity-80">
          <p className="text-[#a855f7] font-black text-[13px] md:text-[14px] drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
            +{profileCount.toLocaleString('pt-BR')} <span className="text-gray-500 font-bold">perfis analisados hoje ({getFormattedDate()})</span>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 opacity-60">
          <span className="text-gray-500 text-xs font-medium">from</span>
          <div className="flex items-center gap-1">
            <svg width="20" height="12" viewBox="0 0 512 311" fill="none">
              <path d="M376.25 0C330.25 0 291.75 24.75 265.5 62.5C253.25 41.75 239.25 24 221.5 13.25C203.75 2.5 182.75 0 159.25 0C116.75 0 80.5 18 51.25 52.25C17.25 92.25 0 146.75 0 213.25C0 246 6.5 271.75 19.5 290.5C32.5 309.25 51.25 311 64.75 311C86.25 311 109.25 298.5 126.75 273C140.5 252.75 152.25 223.75 162 186L175.75 140C183.5 114 192.25 93.75 202 79.25C211.75 64.75 223.25 57.5 236.5 57.5C249.75 57.5 260.5 64.25 268.75 77.75C277 91.25 281.25 110 281.25 134C281.25 159 276.5 180.75 267 199.25C262.25 171.5 252.25 149.25 237 132.5C221.75 115.75 203.75 107.25 183 107.25C159 107.25 137.5 119.25 118.5 143.25C99.5 167.25 90 197.75 90 234.75C90 259.75 96.25 280.25 108.75 296.25C101.25 302 93.75 304.75 86.25 304.75C78.75 304.75 72.5 300.75 67.5 292.75C62.5 284.75 60 272.5 60 256C60 222 66.25 190.75 78.75 162.25C91.25 133.75 108.25 111.5 129.75 95.5C151.25 79.5 175.25 71.5 201.75 71.5C221.75 71.5 238.75 78.25 252.75 91.75C266.75 105.25 277.25 124.25 284.25 148.75C291.25 173.25 294.75 201.5 294.75 233.5C294.75 265.5 289.5 293 279 316C306.5 284.25 324.75 255.5 333.75 229.75C337 240.25 339.75 252.75 342 267.25C350.5 239.75 367.25 213.25 392.25 187.75C417.25 162.25 443.75 149.5 471.75 149.5C488.75 149.5 502.75 155.25 513.75 166.75C494.75 155.75 475.75 150.25 456.75 150.25C429.75 150.25 404.75 163.5 381.75 190C358.75 216.5 347.25 245.75 347.25 277.75C347.25 289.75 351.5 299.25 360 306.25C368.5 313.25 379.75 316.75 393.75 316.75C415.75 316.75 437 307.5 457.5 289C478 270.5 493.75 247 504.75 218.5C493.75 260.5 474.25 294 446.25 319C418.25 344 387.25 356.5 353.25 356.5C322.25 356.5 297.75 346.25 279.75 325.75C261.75 305.25 252.75 277.5 252.75 242.5V233.5" fill="url(#meta-gradient)" />
              <defs>
                <linearGradient id="meta-gradient" x1="0" y1="156" x2="512" y2="156" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0081FB" />
                  <stop offset="0.5" stopColor="#A055FF" />
                  <stop offset="1" stopColor="#FF0080" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-gray-400 text-sm font-semibold">Meta</span>
          </div>
        </div>


      </div>

      <style>{`
        /* BACKGROUND MATRIX */
        .matrix-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .matrix-bg-1 {
          background-image:
            repeating-linear-gradient(to right, rgba(168,85,247,0.08) 0px, rgba(168,85,247,0.08) 1px, transparent 1px, transparent 10px),
            repeating-linear-gradient(to bottom, rgba(168,85,247,0.12) 0px, rgba(168,85,247,0.12) 2px, transparent 2px, transparent 20px);
          background-size: auto, 100% 22px;
          background-position: 0 0, 0 0;
          opacity: 0.28;
        }
        .matrix-bg-2 {
          background-image:
            repeating-linear-gradient(to right, rgba(168,85,247,0.04) 0px, rgba(168,85,247,0.04) 1px, transparent 1px, transparent 12px),
            repeating-linear-gradient(to bottom, rgba(168,85,247,0.10) 0px, rgba(168,85,247,0.10) 1px, transparent 1px, transparent 26px);
          background-size: auto, 100% 26px;
          background-position: 0 0, 0 0;
          opacity: 0.20;
          mix-blend-mode: lighten;
        }
        

        /* EFEITO DE TEXTO ONDA BRILHANTE */
        @keyframes shine-text-wave {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .animate-text-shine {
          background: linear-gradient(
            90deg, 
            #a855f7 0%, 
            #d8b4fe 25%, 
            #ffffff 50%, 
            #d8b4fe 75%, 
            #a855f7 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine-text-wave 3s linear infinite;
        }

        /* OUTRAS ANIMACOES */
        @keyframes button-glow {
          0%, 100% { 
            box-shadow: 0 10px 30px rgba(124, 58, 237, 0.4); 
            transform: scale(1);
            filter: brightness(1);
          }
          50% { 
            box-shadow: 0 10px 50px rgba(124, 58, 237, 0.7); 
            transform: scale(1.02);
            filter: brightness(1.15);
          }
        }

        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-20deg); }
          30% { transform: translateX(150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          70%, 100% { transform: scale(1.4); opacity: 0; }
        }

        @keyframes blink {
          0%, 85%, 100% { transform: scaleY(1); opacity: 1; }
          90% { transform: scaleY(0.05); opacity: 0.5; }
          95% { transform: scaleY(1); opacity: 1; }
        }

        @keyframes eye-close {
          0% { transform: scaleY(1) rotate(0deg); }
          30% { transform: scaleY(0.3) rotate(-5deg); }
          60% { transform: scaleY(0.05) rotate(0deg); }
          80% { transform: scaleY(0.02) rotate(5deg); opacity: 0.8; }
          100% { transform: scaleY(0) rotate(0deg); opacity: 0; }
        }

        .animate-eye-close {
          animation: eye-close 0.6s ease-out forwards;
        }

        .animate-eye-blink {
          animation: blink 3s infinite ease-in-out;
        }

        .animate-button-glow {
          animation: button-glow 2.5s infinite ease-in-out;
        }

        .animate-shine-fast {
          animation: shine-fast 0.8s ease-in-out forwards;
        }

        @keyframes shine-fast {
          0% { transform: translateX(-150%) skewX(-30deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(150%) skewX(-30deg); opacity: 0; }
        }


        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .shimmer-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer-wave 2.5s ease-in-out infinite;
        }

        @keyframes shimmer-wave {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        @keyframes input-reveal {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-input-reveal {
          animation: input-reveal 0.4s ease-out forwards;
        }

        
      `}</style>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </section>
  );
};

const BadgeMinimal = ({ icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-2 group cursor-default">
    <div className="shrink-0 transition-transform group-hover:scale-110">
      {icon}
    </div>
    <span className="text-white font-bold text-[13px] md:text-[15px] tracking-tight">
      {text}
    </span>
  </div>
);
