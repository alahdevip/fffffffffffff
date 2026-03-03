
import React from 'react';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { ProfileData } from '../App';

interface ConfirmationCardProps {
  profile: ProfileData;
  onConfirm: () => void;
  onBack: () => void;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({ profile, onConfirm, onBack }) => {
  return (
    <div className="w-full max-w-[420px] flex flex-col items-center select-none mx-auto px-4 py-6 relative animate-fade-in">

      {/* Container Principal - Simples e limpo */}
      <div className="w-full bg-black rounded-3xl border border-white/[0.08] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">

        {/* Título com Brilho Animado */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-[26px] font-bold text-[#7c3aed] mb-2 relative inline-block shimmer-text">
            Confirme o Instagram
          </h2>
          <p className="text-white/70 text-[15px]">
            Você deseja espionar o perfil<br />
            <span className="text-white font-semibold">@{profile.username}</span>?
          </p>
        </div>

        {/* Layout Instagram: Avatar + Stats lado a lado */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center gap-6 mb-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-[1.5px] border-white/10 shrink-0">
              {(() => {
                const getProxiedUrl = (url: string) => {
                  if (!url) return `https://unavatar.io/instagram/${profile.username}`;

                  // 1. Limpar proxy antigo quebrado se existir (proxt-insta)
                  let finalUrl = url;
                  if (url.includes('proxt-insta.projetinho-solo.workers.dev/?url=')) {
                    const parts = url.split('?url=');
                    if (parts.length > 1) {
                      finalUrl = decodeURIComponent(parts[1]);
                    }
                  }

                  // 2. Evitar proxy duplo ou desnecessário
                  if (finalUrl.includes('weserv.nl') || finalUrl.includes('data:image')) return finalUrl;
                  if (finalUrl.includes('unavatar.io') || finalUrl.includes('ui-avatars.com')) return finalUrl;

                  // 3. Aplicar Weserv.nl com otimização progressiva
                  const cleanUrl = finalUrl.replace(/^https?:\/\//, '');
                  return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=200&h=200&fit=cover&q=65&il`;
                };
                return (
                  <img
                    src={getProxiedUrl(profile.profilePic)}
                    className="w-full h-full object-cover"
                    alt="Profile"
                    onError={(e) => {
                      e.currentTarget.src = `https://unavatar.io/instagram/${profile.username}`;
                      // Se mesmo unavatar falhar, bota um avatar generico colorido
                      e.currentTarget.onerror = () => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${profile.username}&background=random&color=fff`;
                      };
                    }}
                  />
                );
              })()}
            </div>

            {/* Stats horizontais */}
            <div className="flex gap-3 flex-1 justify-around">
              <div className="text-center">
                <div className="text-white font-bold text-base leading-none mb-1">{profile.posts || '0'}</div>
                <div className="text-white/40 text-[10px]">posts</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-base leading-none mb-1">{profile.followers || '0'}</div>
                <div className="text-white/40 text-[10px]">seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-base leading-none mb-1">{profile.following || '0'}</div>
                <div className="text-white/40 text-[10px]">seguindo</div>
              </div>
            </div>
          </div>

          {/* Bio/Username */}
          <div className="text-left space-y-0.5 relative">
            <p className="text-white/90 font-medium text-sm leading-tight whitespace-pre-wrap">
              {profile.bio || profile.name}
            </p>
          </div>
        </div>

        {/* Warning Box - Mais compacto */}
        <div className="bg-[#1a0808] border border-[#3d1414] rounded-xl p-3.5 mb-6 relative z-10">
          <div className="flex gap-2.5 items-start">
            <AlertTriangle className="text-[#ff4d4d] shrink-0 mt-0.5" size={18} />
            <p className="text-[#ff4d4d] text-[10.5px] leading-snug font-medium">
              <span className="font-bold">Aviso:</span> Limite de apenas 1 pesquisa por dispositivo, certifique-se que digitou o usuário corretamente.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2.5 relative z-10">
          <button
            onClick={onBack}
            className="flex-1 h-[52px] rounded-xl border border-white/15 text-white font-semibold text-[15px] hover:bg-white/5 active:scale-[0.97] transition-all"
          >
            Corrigir @
          </button>

          <button
            onClick={onConfirm}
            className="flex-[1.6] h-[52px] rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all shadow-[0_8px_24px_rgba(124,58,237,0.4)] relative overflow-hidden group animate-pulse-slow"
          >
            {/* CSS BACKGROUND BUTTON */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600">
            </div>
            <span className="relative z-10 flex items-center gap-1.5 font-black text-[18px] uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-text-shine">Confirmar <ChevronRight size={22} strokeWidth={3} className="text-white" /></span>
          </button>
        </div>

      </div>

      <style>{`
        /* EFEITO DE TEXTO ONDA BRILHANTE */
        @keyframes shine-text-wave {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .animate-text-shine {
          background: linear-gradient(
            90deg, 
            #ffffff 0%, 
            #e9d5ff 25%, 
            #ffffff 50%, 
            #e9d5ff 75%, 
            #ffffff 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine-text-wave 3s linear infinite;
        }

        @keyframes fade-in {
           from { opacity: 0; transform: translateY(15px); }
           to { opacity: 1; transform: translateY(0); }
         }
         
         @keyframes pulse-slow {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(124, 58, 237, 0); }
            50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(124, 58, 237, 0.5); }
         }

         .animate-pulse-slow {
            animation: pulse-slow 3s infinite ease-in-out;
         }

         .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #7c3aed 0%, #a78bfa 25%, #7c3aed 50%, #a78bfa 75%, #7c3aed 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s ease-in-out infinite;
        }
        .shimmer-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer-wave 2s ease-in-out infinite;
        }
        @keyframes shimmer-wave {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};
