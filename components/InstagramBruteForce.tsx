import React, { useState, useEffect, useRef } from 'react';
import { Logger } from '../src/utils/logger';
import { CheckCircle2, ChevronRight, AlertCircle, Lock, ShieldCheck } from 'lucide-react';

interface InstagramBruteForceProps {
  username: string;
  onComplete: () => void;
  isDataReady?: boolean;
}

const PASSWORDS_TO_TRY = [
  'senha123', 'admin', '123456', 'qwerty', 'stalkea', 'bypass_v6', 'root', 'password', '123123', 'login',
  'insta2024', 'segredo', 'acesso', 'master', 'godmode', 'hack_it', 'p@ssword', '000000', '111111', '12345678',
  'user123', 'qwertyuiop', 'iloveyou', 'letmein1', 'secret', 'dragon', 'monkey', 'football', 'shadow', 'superman',
  '987654321', 'batman', 'killer', 'stalke_ai_god', 'access_granted'
];

export const InstagramBruteForce: React.FC<InstagramBruteForceProps> = ({ username, onComplete, isDataReady }) => {
  const [password, setPassword] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showMetadata, setShowMetadata] = useState(true);
  const [simulationStarted, setSimulationStarted] = useState(false);

  const dataReadyRef = useRef(isDataReady);

  useEffect(() => {
    dataReadyRef.current = isDataReady;
  }, [isDataReady]);



  useEffect(() => {
    // Sequência 10s Total:
    // 0-1s: Splash screen
    // 1-2s: Metadata phase
    // 2-10s: Brute force attempts (8 seconds)
    const sequence = async () => {
      // Splash (0.5 second)
      await new Promise(r => setTimeout(r, 500));
      Logger.flow('Iniciando extração de metadados do alvo...');
      setShowSplash(false);

      // Metadata Phase (0.5 second)
      await new Promise(r => setTimeout(r, 500));
      setShowMetadata(false);

      // Auto start brute force
      await new Promise(r => setTimeout(r, 50));
      Logger.security(`🔥 ALVO IDENTIFICADO: ${username}. Iniciando Bypass Engine v6.1...`);
      setSimulationStarted(true);
    };

    sequence();
  }, []);

  // Simplified Auto-Login Simulation (No Brute Force Console)
  useEffect(() => {
    if (!simulationStarted || showSplash || showMetadata || isFinished) return;

    const performAutoLogin = async () => {
      for (let i = 0; i < PASSWORDS_TO_TRY.length; i++) {
        setAttemptIndex(i);
        const currentPass = PASSWORDS_TO_TRY[i];

        // Reset for next attempt
        setCurrentText('');
        setErrorVisible(false);
        await new Promise(r => setTimeout(r, 20));

        // Typing effect (ULTRA FAST)
        setIsTyping(true);
        for (let j = 0; j <= currentPass.length; j++) {
          setCurrentText(currentPass.slice(0, j));
          await new Promise(r => setTimeout(r, 5));
        }
        setIsTyping(false);

        // Validation delay (FAST)
        await new Promise(r => setTimeout(r, 40));

        // If not the last one, show error and continue
        if (i < PASSWORDS_TO_TRY.length - 1) {
          setErrorVisible(true);
          await new Promise(r => setTimeout(r, 80));
        } else {
          // Last attempt - wait for background data
          let checks = 0;
          while (!dataReadyRef.current && checks < 60) {
            await new Promise(r => setTimeout(r, 200));
            checks++;
          }
          setIsFinished(true);
          Logger.success('SENHA ENCONTRADA! Tokens de acesso gerados com sucesso.');
          Logger.flow('Redirecionando para o Feed Restrito...');
        }
      }
    };

    performAutoLogin();
  }, [simulationStarted, showSplash, showMetadata]);

  // AUTO-NAVIGATE TO FEED
  useEffect(() => {
    if (isFinished) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFinished, onComplete]);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-between py-10 animate-fade-in font-sans">
        <div className="flex-1 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-20 h-20">
            <defs>
              <linearGradient id="ig-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#405DE6" />
                <stop offset="50%" stopColor="#833AB4" />
                <stop offset="100%" stopColor="#E1306C" />
              </linearGradient>
            </defs>
            <path fill="url(#ig-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-80">
          <span className="text-[#555] text-[13px] font-sans tracking-tight">from</span>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-4 flex items-center justify-center">
              <svg viewBox="0 0 36 24" fill="url(#meta-gradient)" className="w-full h-full">
                <defs>
                  <linearGradient id="meta-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0064e0" />
                    <stop offset="50%" stopColor="#d6249f" />
                    <stop offset="100%" stopColor="#e0294e" />
                  </linearGradient>
                </defs>
                <path d="M24.253 17.585c-1.341 0-2.434-.694-3.159-1.874l-2.008-3.296-1.127-1.854c-.661-1.084-1.284-2.106-2.385-2.106-1.196 0-1.742 1.059-1.742 2.502v5.992H9V10.95c0-3.328 2.37-5.59 5.578-5.59 2.559 0 4.09 1.483 5.025 3.018l.848 1.392.835-1.392C22.213 6.843 23.753 5.36 26.312 5.36c3.208 0 5.579 2.261 5.579 5.589v6.635h-4.832v-5.992c0-1.443-.546-2.502-1.742-2.502-1.102 0-1.725 1.022-2.386 2.106l-1.126 1.854-1.996 3.284c-.722 1.171-1.815 2.25-3.555 1.25z" fill="#D6249F" />
                <path d="M23.167 6.42L18 14.896 12.833 6.42A4.978 4.978 0 0 0 8.56 3.8C4.162 3.8 1.48 7.35 1.48 11.95c0 4.6 2.682 8.15 7.08 8.15 1.838 0 3.323-.746 4.272-1.928L18 11.232l5.168 6.94c.95 1.182 2.434 1.928 4.272 1.928 4.4 0 7.08-3.55 7.08-8.15 0-4.6-2.68-8.15-7.08-8.15a4.978 4.978 0 0 0-4.273 2.62z" fill="url(#meta-gradient)" />
              </svg>
            </div>
            <span className="text-white text-[15px] font-sans font-bold tracking-tight">Meta</span>
          </div>
        </div>
      </div>
    );
  }

  if (showMetadata) {
    return (
      <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center animate-fade-in font-sans">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-white text-2xl font-bold tracking-tight">Extraindo metadados</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-fade-in overflow-hidden font-sans">

      {/* 📱 INSTAGRAM LOGIN */}
      <div className="w-full h-full max-w-[450px] flex flex-col items-center justify-between py-6 relative bg-black">

        {/* Instagram Error Banner - Mobile Style */}
        <div className={`absolute top-0 left-0 right-0 bg-[#D0021B] text-white text-[14px] py-3 px-4 text-center transition-all duration-500 z-[250] ${errorVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          A senha que você inseriu está incorreta.
        </div>

        <div className="w-full max-w-[350px] flex flex-col items-center justify-center flex-1 px-4">

          {/* Instagram Text Logo */}
          <div className="mb-10 animate-scale-up-fade">
            <img
              src="/instagram-logo.svg"
              alt="Instagram"
              className="w-[175px] invert"
            />
          </div>

          {/* Login Form */}
          <div className="w-full space-y-2.5 mb-4">
            {/* Username Field */}
            <div className="w-full bg-[#121212] border border-[#363636] rounded-[3px] h-[38px] flex items-center px-3 relative group focus-within:border-[#A8A8A8]">
              <span className="text-[#A8A8A8] text-[10px] absolute top-[2px] left-[11px] pointer-events-none transition-all">
                Telefone, nome de usuário ou email
              </span>
              <input
                type="text"
                value={username}
                readOnly
                className="w-full bg-transparent border-none outline-none text-[12px] text-white pt-3 pb-0"
              />
            </div>

            {/* Password Field */}
            <div className="w-full bg-[#121212] border border-[#363636] rounded-[3px] h-[38px] flex items-center px-3 relative overflow-hidden group focus-within:border-[#A8A8A8]">
              <span className="text-[#A8A8A8] text-[10px] absolute top-[2px] left-[11px] pointer-events-none transition-all">
                Senha
              </span>
              <div className="flex items-center gap-1 w-full pt-3 pb-0">
                <span className="text-[20px] tracking-widest font-sans leading-none text-white mt-0.5">
                  {currentText.length > 0 ? '•'.repeat(currentText.length) : ''}
                </span>
                {isTyping && <div className="w-[1.5px] h-4 bg-[#0095f6] animate-cursor-blink mt-0.5" />}
              </div>

              {/* Hacker Status Text - Preserved as requested ("informações roxas do lado") */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-purple-500 font-bold animate-pulse">BRUTE-FORCE</span>
                  <div className="w-1 h-1 bg-purple-500 rounded-full animate-ping" />
                </div>
              </div>

            </div>

            {/* Brute Force Console - "Informações roxas do lado" */}
            <div className="w-full bg-[#7c3aed]/5 border border-[#7c3aed]/20 rounded-[8px] p-3 mb-2 font-mono text-[10px] animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full animate-pulse" />
                  <span className="text-[#a855f7] font-bold text-[9px] tracking-tight uppercase">Bypass Engine v6.1</span>
                </div>
                <span className="text-[#a855f7]/60 text-[8px]">{Math.round(((attemptIndex + 1) / PASSWORDS_TO_TRY.length) * 100)}% Complete</span>
              </div>

              <div className="space-y-1 h-[42px] overflow-hidden relative">
                <div
                  className="flex flex-col gap-1 transition-all duration-500"
                  style={{ transform: `translateY(-${Math.max(0, (attemptIndex - 2) * 14)}px)` }}
                >
                  {PASSWORDS_TO_TRY.map((p, i) => (
                    <div key={i} className={`flex items-center gap-2 ${i === attemptIndex ? 'text-white font-bold' : i < attemptIndex ? 'text-green-500/40' : 'text-[#7c3aed]/20'}`}>
                      <span className="w-2">{i === attemptIndex ? '→' : i < attemptIndex ? '✓' : '○'}</span>
                      <span className="truncate">TRYING_HASH: {p.slice(0, 2)}*******</span>
                      {i === attemptIndex && (
                        <span className="ml-auto text-[#a855f7] animate-pulse text-[8px] font-bold">BRUTING...</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-[2px] bg-white/5 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-[#7c3aed] transition-all duration-500"
                  style={{ width: `${((attemptIndex + 1) / PASSWORDS_TO_TRY.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={isFinished ? onComplete : undefined}
              className={`w-full font-bold h-[32px] rounded-[8px] text-[14px] transition-all flex items-center justify-center gap-2 mt-2
                ${isFinished
                  ? 'bg-[#0095f6] text-white hover:bg-[#1877f2] active:opacity-70 shadow-[0_4px_15px_rgba(0,149,246,0.3)]'
                  : 'bg-[#0095f6] text-white opacity-70 cursor-default'}`}
            >
              {isFinished ? 'Prosseguir' : 'Autenticando...'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-[1px] bg-[#262626]"></div>
              <span className="text-[13px] font-bold text-[#A8A8A8] uppercase">OU</span>
              <div className="flex-1 h-[1px] bg-[#262626]"></div>
            </div>

            {/* Facebook Login */}
            <div className="flex items-center justify-center gap-2 cursor-pointer">
              <div className="w-[16px] h-[16px]">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Facebook_logo_%28square%29.png"
                  alt="Facebook"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[#0095f6] font-bold text-[14px]">
                Entrar com o Facebook
              </span>
            </div>

            {/* Forgot Password */}
            <div className="text-center mt-3">
              <span className="text-[#e0f1ff] text-[12px] cursor-pointer">
                Esqueceu a senha?
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4 w-full px-8">
          <div className="w-full max-w-[350px] py-4 flex items-center justify-center gap-1">
            <span className="text-[14px] text-white">Não tem uma conta?</span>
            <span className="text-[14px] text-[#0095f6] font-bold cursor-pointer">Cadastre-se</span>
          </div>

          <div className="flex flex-col items-center gap-4 mt-4 opacity-60">
            <span className="text-[#A8A8A8] text-[12px]">from</span>
            <div className="flex items-center gap-1.5 grayscale opacity-70">
              <span className="text-white text-[14px] font-bold tracking-tight">Meta</span>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor-blink {
          animation: cursor-blink 0.8s step-end infinite;
        }

        @keyframes scale-up-fade {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up-fade {
          animation: scale-up-fade 0.6s ease-out forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
