import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Logger } from '../src/utils/logger';

import {
  Lock,
  ShieldAlert,
  Users,
  Activity,
  ShieldCheck,
  LockIcon,
  ChevronRight,
  Key,
  Check,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ExternalLink,
  X,
  Star
} from 'lucide-react';

// Official Instagram Icons
// Official Instagram Icons - Memoized for 60FPS performance
const Icons = {
  Home: React.memo(({ filled }: { filled?: boolean }) => (
    <svg aria-label="Home" color={filled ? "white" : "white"} fill={filled ? "white" : "white"} height="24" role="img" viewBox="0 0 24 24" width="24">
      {filled ? (
        <path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a1 1 0 0 0-1-1h-2.004a1 1 0 0 0-1 1V22a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V12.486a1 1 0 0 1 .296-.707l7.974-7.973a1.001 1.001 0 0 1 1.414 0l7.974 7.973a1 1 0 0 1 .296.707V22a1 1 0 0 1-1 1z"></path>
      ) : (
        <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
      )}
    </svg>
  )),
  Search: React.memo(({ filled }: { filled?: boolean }) => (
    <svg aria-label="Search" color={filled ? "white" : "white"} fill={filled ? "white" : "white"} height="24" role="img" viewBox="0 0 24 24" width="24">
      <path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "3" : "2"}></path>
      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "3" : "2"} x1="16.511" x2="22" y1="16.511" y2="22"></line>
    </svg>
  )),
  Add: React.memo(({ filled }: { filled?: boolean }) => (
    <svg aria-label="New Post" color="white" fill="white" height="24" role="img" viewBox="0 0 24 24" width="24">
      <path d="M2 12v3.45c0 2.849.698 4.005 1.606 4.944.94.909 2.098 1.608 4.946 1.608h6.896c2.848 0 4.006-.7 4.946-1.608C21.302 19.455 22 18.3 22 15.45V8.552c0-2.849-.698-4.006-1.606-4.945C19.454 2.7 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.547 2 5.703 2 8.552z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "3" : "2"}></path>
      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "3" : "2"} x1="6.545" x2="17.455" y1="12.001" y2="12.001"></line>
      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "3" : "2"} x1="12.003" x2="12.003" y1="6.545" y2="17.455"></line>
    </svg>
  )),
  Reels: React.memo(({ filled }: { filled?: boolean }) => (
    <svg aria-label="Reels" color="white" fill="white" height="24" role="img" viewBox="0 0 24 24" width="24">
      <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth={filled ? "2.5" : "2"} x1="2.049" x2="21.95" y1="7.002" y2="7.002"></line>
      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "2.5" : "2"} x1="13.504" x2="16.362" y1="2.001" y2="7.002"></line>
      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "2.5" : "2"} x1="7.207" x2="10.002" y1="2.11" y2="7.002"></line>
      <path d="M2 12.001v3.449c0 2.849.698 4.006 1.606 4.945.94.908 2.098 1.607 4.946 1.607h6.896c2.848 0 4.006-.699 4.946-1.607.908-.939 1.606-2.096 1.606-4.945V8.552c0-2.848-.698-4.006-1.606-4.945C19.454 2.699 18.296 2.001 15.448 2.001H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.546 2 5.704 2 8.552z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={filled ? "2.5" : "2"}></path>
      <path d="M9.763 17.664a.908.908 0 0 1-.454-.787V11.63a.909.909 0 0 1 1.364-.788l4.545 2.624a.909.909 0 0 1 0 1.575l-4.545 2.624a.91.91 0 0 1-.91 0Z" fillRule="evenodd" fill={filled ? "white" : "none"}></path>
    </svg>
  )),
  Messenger: React.memo(() => (
    <MessageCircle size={24} color="white" strokeWidth={2} />
  )),
  Heart: React.memo(({ filled }: { filled?: boolean }) => (
    <svg aria-label={filled ? "Unlike" : "Like"} height="24" role="img" viewBox="0 0 24 24" width="24">
      {filled ? (
        <path
          d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.712.304 1.087.304s.749-.101 1.087-.304C19.224 16.746 23 12.235 23 7.66 23 3.736 20.245 1.5 17.037 1.5c-1.85 0-3.473.844-4.537 2.304C11.437 2.344 9.813 1.5 7.963 1.5 4.755 1.5 2 3.736 2 7.66z"
          fill="#ff3040"
        />
      ) : (
        <path
          d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.077 2.5 12.189 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.25.339.496.703.757 1.151.722-.533 1.151-.818 1.536-1.076a5.4 5.4 0 0 1 3.616-1.016z"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )),
  Comment: React.memo(() => (
    <svg aria-label="Comment" color="white" fill="white" height="24" role="img" viewBox="0 0 24 24" width="24">
      <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
  )),
  Share: React.memo(() => (
    <svg aria-label="Share Post" color="white" fill="white" height="24" role="img" viewBox="0 0 24 24" width="24">
      <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="2" y2="10.083"></line>
      <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
    </svg>
  )),
  Bookmark: React.memo(() => (
    <svg aria-label="Save" color="white" fill="white" height="24" role="img" viewBox="0 0 24 24" width="24">
      <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
    </svg>
  )),
  More: React.memo(() => (
    <svg aria-label="More options" color="white" fill="white" height="24" role="img" viewBox="0 0 24 24" width="24">
      <circle cx="12" cy="12" r="1.5"></circle>
      <circle cx="6" cy="12" r="1.5"></circle>
      <circle cx="18" cy="12" r="1.5"></circle>
    </svg>
  )),
  Verified: React.memo(() => (
    <img
      src="https://img.icons8.com/?size=48&id=2sZ0sdlG9kWP&format=png"
      alt="Verificado"
      className="ml-1 shrink-0 w-[14px] h-[14px] object-contain align-middle inline-block"
      loading="lazy"
    />
  )),
  Plus: React.memo(() => (
    <svg aria-label="Plus" color="white" fill="white" height="14" role="img" viewBox="0 0 24 24" width="14">
      <path d="M24 10.5h-9v-9a1.5 1.5 0 0 0-3 0v9h-9a1.5 1.5 0 0 0 0 3h9v9a1.5 1.5 0 0 0 3 0v-9h9a1.5 1.5 0 0 0 0-3Z" fill="white"></path>
    </svg>
  )),
  Repost: React.memo(() => (
    <svg aria-label="Repost" color="white" fill="white" height="24" role="img" viewBox="0 0 24 24" width="24">
      <path d="M19.95 7.15a1 1 0 0 0-1.41 0L17 8.69V6a5 5 0 0 0-5-5H4a1 1 0 0 0 0 2h8a3 3 0 0 1 3 3v2.69l-1.54-1.54a1 1 0 0 0-1.41 1.41l3.25 3.25a1 1 0 0 0 1.41 0l3.25-3.25a1 1 0 0 0-.01-1.41ZM4.05 16.85a1 1 0 0 0 1.41 0L7 15.31V18a5 5 0 0 0 5 5h8a1 1 0 0 0 0-2h-8a3 3 0 0 1-3-3v-2.69l1.54 1.54a1 1 0 0 0 1.41-1.41l-3.25-3.25a1 1 0 0 0-1.41 0l-3.25 3.25a1 1 0 0 0 .01 1.41Z" fill="white"></path>
    </svg>
  )),
  Camera: React.memo(() => (
    <svg aria-label="Camera" color="white" fill="white" height="32" role="img" viewBox="0 0 24 24" width="32">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="white" />
      <circle cx="12" cy="12" r="5" fill="white" />
    </svg>
  )),
};

interface VideoPlayerProps {
  poster?: string;
  preload?: "none" | "metadata" | "auto";
}

const VideoPlayer: React.FC<VideoPlayerProps & { src?: string }> = React.memo(({ src, poster, preload = "metadata" }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [showMuteIcon, setShowMuteIcon] = React.useState(false);
  const [hasError, setHasError] = React.useState(src === "BROKEN_VIDEO" || !src);

  React.useEffect(() => {
    if (src) {
      Logger.api(`[VideoPlayer] Inicializando vídeo: ${src.substring(0, 50)}...`);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!hasError) {
              videoRef.current?.play().catch((err) => {
                Logger.error("[VideoPlayer] Erro no autoplay:", err);
              });
              setIsPlaying(true);
            }
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
            setMuted(true); // Mute when out of view
          }
        });
      },
      { threshold: 0.3 } // Even lower for better response
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [hasError]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasError) return;

    // User requested: click only toggles audio (and ensures playback)
    if (videoRef.current) {
      if (videoRef.current.paused) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => { });
        }
        setIsPlaying(true);
      } else {
        // Optional: pause on click? User said "click only toggles audio".
        // But logic below just toggles mute.
        // If we want to pause, we should do it here.
        // Keeping original behavior: click toggles mute, but ensures play if paused.
      }
    }
    setMuted(!muted);
    setShowMuteIcon(true);
    setTimeout(() => setShowMuteIcon(false), 1000);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasError) return;
    setMuted(!muted);
    setShowMuteIcon(true);
    setTimeout(() => setShowMuteIcon(false), 1000);
  };

  return (
    <div className="relative w-full h-full cursor-pointer bg-black overflow-hidden" onClick={togglePlay}>
      {!hasError ? (
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          poster={poster}
          playsInline
          autoPlay
          loop
          muted={muted}
          preload={preload}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm opacity-50 scale-110"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      {/* Removed Video Indicator per USER request */}

      {/* Play/Pause Overlay Icon */}
      {!isPlaying && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/40 p-5 rounded-full backdrop-blur-sm scale-110">
            <svg fill="white" height="40" viewBox="0 0 24 24" width="40"><path d="M5.888 22.5a.346.346 0 0 1-.177-.044A.335.335 0 0 1 5.55 22.16V1.84a.336.336 0 0 1 .515-.296l12.112 10.16a.335.335 0 0 1 0 .592L6.065 22.456a.334.334 0 0 1-.177.044z"></path></svg>
          </div>
        </div>
      )}

      {/* Lock Overlay for Error/Unplayable Videos */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 gap-3">
          <Lock size={36} className="text-white" strokeWidth={2} />
          <span className="text-white font-semibold text-[15px] tracking-wide drop-shadow-lg">Conteúdo Exclusivo</span>
        </div>
      )}

      {/* Small sound indicator at bottom-right (like IG) */}
      {!hasError && (
        <div
          className="absolute bottom-3 right-3 bg-[#262626]/80 p-1.5 rounded-full z-10 flex items-center justify-center w-7 h-7"
          onClick={toggleMute}
        >
          {muted ? (
            <svg aria-label="Som desativado" color="white" fill="white" height="12" role="img" viewBox="0 0 48 48" width="12">
              <path d="M1.5 13.3c-.8 0-1.5.7-1.5 1.5v18.4c0 .8.7 1.5 1.5 1.5h8.7l12.9 12.9c.9.9 2.5.3 2.5-1v-9.8c0-.4-.2-.8-.4-1.1l-22-22c-.3-.3-.7-.4-1.1-.4h-.6zm46.8 31.4-5.5-5.5C44.9 36.6 48 31.4 48 24c0-11.4-7.2-17.4-7.2-17.4-.6-.6-1.6-.6-2.2 0L37.2 8c-.6.6-.6 1.6 0 2.2 0 0 5.7 5 5.7 13.8 0 5.4-2.1 9.3-3.8 11.6L35.5 32c1.1-1.7 2.3-4.4 2.3-8 0-6.8-4.1-10.3-4.1-10.3-.6-.6-1.6-.6-2.2 0l-1.4 1.4c-.6.6-.6 1.6 0 2.2 0 0 2.6 2 2.6 6.7 0 1.8-.4 3.2-.9 4.3L25.5 22V1.4c0-1.3-1.6-1.9-2.5-1L13.5 10 3.3-.2c-.6-.6-1.5-.6-2.1 0L-.2 1.2c-.6.6-.6 1.5 0 2.1l48.5 48.5c.6.6 1.5.6 2.1 0l1.4-1.4c.6-.6.6-1.6 0-2.2z"></path>
            </svg>
          ) : (
            <svg aria-label="Som ativado" color="white" fill="white" height="12" role="img" viewBox="0 0 24 24" width="12">
              <path d="M14.016 2.016a1 1 0 0 0-1.032.062l-6.046 3.934H3.016A1.003 1.003 0 0 0 2.01 7.022v9.956a1.003 1.003 0 0 0 1.006 1.01h3.922l6.046 3.934a1.003 1.003 0 0 0 1.547-.842V2.92a1.003 1.003 0 0 0-.515-.904ZM18.016 6.016a1 1 0 1 0-1.414 1.414 6.96 6.96 0 0 1 0 9.14 1 1 0 1 0 1.414 1.414 8.96 8.96 0 0 0 0-11.968Zm2.828-2.828a1 1 0 1 0-1.414 1.414 10.96 10.96 0 0 1 0 14.796 1 1 0 1 0 1.414 1.414 12.96 12.96 0 0 0 0-17.624Z"></path>
            </svg>
          )}
        </div>
      )}

      {/* Mute/Unmute Overlay Icon */}
      {/* Removed center overlay icon as requested */}
    </div>
  );
});

interface InstagramFeedCloneProps {
  username: string;
  profile: any;
  initialFeedData?: any;
  onNext: () => void;
  onEvent?: (extra?: any) => void;
}

const FIXED_POSTS_DATA = [
  {
    id: 'fixed-post-metropoles',
    username: 'metropoles',
    img: 'https://imgur.com/Kmi9qX6.jpg',
    authorPic: 'https://imgur.com/aX9eqii.jpg',
    caption: 'Centenas de voos foram cancelados em todo o mundo, e milhares de passageiros ficaram retidos em aeroportos em razão dos ataques com mísseis no Oriente Médio, no fim de semana. Os b0mbarde1os provocaram caos em terminais internacionais.\n\nApenas neste domingo (1º/3), pelo menos 2.800 voos foram cancelados. O espaço aéreo foi fechado em países estratégicos como Israel, Catar, Síria, Irã, Iraque, Kuwait, Bahrein, Omã e Emirados Árabes Unidos.\n\nOs ataques, atribuídos ao Irã, foram lançados em resposta à ofensiva militar realizada por Estados Unidos e Israel no sábado (28/2). Analistas do setor alertam que as interrupções devem persistir nos próximos dias, caso os ataques continuem. A recomendação é que passageiros verifiquem o status dos voos antes de se deslocarem aos aeroportos.',
    likes: 412500,
    comments: 11842,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-alfinetada',
    username: 'alfinetada',
    img: 'https://imgur.com/bYj9x3S.jpg',
    authorPic: 'https://imgur.com/mUhB2ui.jpg',
    caption: '🚨AGORA! As autoridades iranianas não adiaram em prometer retaliação depois da confirmation da m0rt3 do Líder Supremo do país, o aiatolá Ali Khamenei, em ataques realizados por Israel e pelos EUA no sábado (28).\n\n“As operações ofensivas mais pesadas da história das Forças 4rmadas da República Islâmica do Irã começarão em breve em direção aos territórios e bases ocupados pelos terroristas americanos”, alertou o A IRGC (Corpo da Guarda Revolucionária Islâmica). O governo iraniano afirmou em comunicado que “este grande crime jamais ficará impune e marcará o início de uma nova página na história do mundo islâmico”.\n\n📍Siga @alfinetada para ver mais 📌',
    likes: 315400,
    comments: 21242,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-gossipsilves',
    username: 'gossipsilves',
    img: 'https://imgur.com/ap9R1qE.jpg',
    authorPic: 'https://imgur.com/XoknZQ3.jpg',
    caption: 'A eleição presidencial de 2026 caminha para um possível desfecho histórico. Dados do Instituto Paraná Pesquisas indicam que Flávio Bolsonaro pode derrotar Luiz Inácio Lula da Silva,impondo ao atual presidente o que seria a maior derrota de sua trajetória política.Segundo o levantamento,Flávio Bolsonaro já teria incorporado cerca de 90% do eleitorado de Jair Bolsonaro,consolida-se como o principal nome no cenário nacional. Com 27,8% das intenções de voto,o senador concentra praticamente todo o campo conservador,enquanto lula aparece com 37,6 índice considerado frágil diante do desgaste do governo e da alta rejeição.Analistas avaliam que Flávio conseguiu nacionalizar sua imagem e ganhou tração política consistente. A disputa de 2026 tende a repetir a polarização de 2022,porém em um contexto mais desfavorável ao presidente.O avanço do adversário e a consolidação do eleitorado indicam a possibilidade de uma virada histórica nas urnas. EITA GENTE!😳📸\n\nSiga a página @gossipsilves para ver mais!📌\n\n(Produção/ Blog do Lemos)\n\n#eleição2026 #flaviobolsoanro #lula #presidente',
    likes: 218300,
    comments: 8545,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-negffe',
    username: 'negffe',
    img: 'https://imgur.com/VVgTl7I.jpg',
    authorPic: 'https://imgur.com/cmdqipw.jpg',
    caption: '👉🏼 Siga @negffe para ver o que a TV não mostra!\n\nA Polícia Civil do Rio de Janeiro (PCERJ) deflagrou, na manhã deste sábado (28/2), a Operação Fim de Jogo para desarticular grupos que promoviam “bailes virtuais” dentro do Roblox, plataforma on-line amplamente utilizada por crianças e adolescentes. A ação foi conduzida pela Delegacia da Criança e do Adolescente Vítima (Dcav).\n\nUm homem foi preso em Duque de Caxias, na Baixada Fluminense, apontado como responsável por administrar uma das salas conhecidas como “Baile da Rocinha”.\n\nComputadores, celulares e outros dispositivos eletrônicos foram apreendidos e passarão por perícia.😱📸\nFonte: Metrópoles\n\n#roblox #noticias #brasil #bailedefavela',
    likes: 154300,
    comments: 9642,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-classicosvirais',
    username: 'classicosvirais',
    videoUrl: 'https://scontent.cdninstagram.com/o1/v/t16/f2/m69/AQN2fsg2jiOVHKQEicnXDfr-dAxKAej4en66RAjO4MUdPZkL3GokgDcablBhvVUSv7jHWqo4s1dwiAm1gjJDhm8G.mp4?strext=1&_nc_cat=106&_nc_oc=Adn1f5z8XYCAT1EOruVnHzQOmFKF_IfFGVDAgEJggYH1-IU50xJuZdnSke8DeSSiEMM&_nc_sid=5e9851&_nc_ht=instagram.fjdo1-2.fna.fbcdn.net&_nc_ohc=cnSnjKHTTWYQ7kNvwHuhSv8&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NTcyODE3OTU2NTczOTcsImFzc2V0X2FnZV9kYXlzIjo4LCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6NywidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&vs=193e5dc96efb3b0c&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTlFjQWliTjNPQzhfTllDQUg5ZV9JaHNqVGxQYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0NCNDE3NjVCRjdDOTI2RTIyNzFCODYwMTQxQTUwMkFCX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbquqyhzca4PxUCKAJDMywXQB5mZmZmZmYYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=XSXZ3gpjWmn0p517wnA7uA&_nc_ss=8&_nc_zt=28&oh=00_Afz33imH2zYxWD3ZTQn8ju52aItNs0z__uOd7Oc09iz9YQ&oe=69AACCBE',
    img: 'https://imgur.com/yozSAK6.jpg',
    authorPic: 'https://imgur.com/yozSAK6.jpg',
    caption: 'Os CDs chegaram ao Brasil em 1985 e mudaram a forma de ouvir música, substituindo a fita K7. 💿\nO primeiro celular surgiu em 1983 e era uma verdadeira “tijolada”, acessível a poucos. 📱\nO Game Boy (1989) revolucionou os videogames portáteis 🎮, enquanto Mortal Kombat (1992) causou polêmica com seu icônico “Finish Him!”. 🥋\nAntes do Orkut (2004), ICQ e MSN dominavam as conversas online. 💬\nO VHS de Star Wars chegou às casas em 1982 🎬, e Thriller de Michael Jackson fez história na MTV em 1983. 🕺\nNos anos 90, o tamanco, o Adidas e as roupas largas marcaram o estilo 👟, e o Tamagotchi ensinou muita gente a “cuidar” de um bichinho virtual. 🐣\nEm 1989, a novela Vale Tudo parou o Brasil. 📺\n\n#reels #reelsbrasil #nostalgia #anos90 #retro #anos80',
    likes: 182500,
    comments: 7442,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-weslleyof_',
    username: 'weslleyof_',
    videoUrl: 'https://scontent.cdninstagram.com/o1/v/t16/f2/m69/AQNPy0EPhXlqxYnXfOrHP1UqM4iBIbop3Hoo6Upd6lFv3QXzdjSEmO2oxSimtvWGhFM4GY8Tif0dBSLJAqNjK36r.mp4?strext=1&_nc_cat=111&_nc_oc=AdkkGmz6nR6J6cjFAEhLntDf20U8FQmebgGvD6JoAnlfW1GYU-5HFSF4rp-AgKwBUN4&_nc_sid=5e9851&_nc_ht=instagram.fjdo10-1.fna.fbcdn.net&_nc_ohc=9aWaUsuQCqoQ7kNvwGCYA4U&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTE4MjQ0Nzg3NDA5MzAzNSwiYXNzZXRfYWdlX2RheXMiOjQ4LCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6NjQsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=c3a5364faac87638&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HT0tWcmlTbTdmbzM4dHNFQVBYX3F6cnR2UWd5YnNwVEFRQUYVAALIARIAFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRXdsakNTQnBwaE1oVjVhQUxGNFRkTk9WcFJGYnN0VEFRQUYVAgLIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAm1r-BmMPbmQQVAigCQzMsF0BQCp--dsi0GBJkYXNoX2Jhc2VsaW5lXzFfdjERAHX-B2XmnQEA&_nc_gid=CcStnbGqLiDFcHJ-vXmTHg&_nc_ss=8&_nc_zt=28&oh=00_AfyAy9wS465IehssXw-e4LfsHLz-tlY8ZiAgIi-O6nU7sw&oe=69AABF51',
    img: 'https://imgur.com/JI0Vrkm.jpg',
    authorPic: 'https://imgur.com/JI0Vrkm.jpg',
    caption: 'Oooooo viagem kkkkk',
    likes: 105200,
    comments: 4232,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-winnerzmindd_',
    username: 'winnerzmindd_',
    img: 'https://imgur.com/VkDxnix.jpg',
    authorPic: 'https://imgur.com/0vIEPcN.jpg',
    caption: 'A maioria das pessoas não falha por falta de talento.\nElas falham porque nunca mudaram o padrão mental que comanda suas decisões.\n\nBob Proctor explica algo que, quando você entende, não dá mais pra fingir que não sabe.\n\nO mundo que você vive hoje foi construído primeiro na sua mente.\n\nA diferença entre quem sonha e quem realiza está onde você concentra sua energia mental.\n\nQuer mudar o resultado? Comece por dentro.\n\nEsse vídeo não é motivação momentânea. É um alerta.\n\nSiga @winnerzmindd_ para blindar sua mente diariamente e vamos juntos rumo ao topo. 👑🧠',
    likes: 88430,
    comments: 8245,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-evanilsongrau',
    username: 'evanil*******',
    img: 'https://i.imgur.com/SkuvDhi.jpg',
    authorPic: 'https://imgur.com/pTPtBpy.jpg',
    caption: 'Novo 2000 e ano que vem 😂',
    likes: 31250,
    comments: 1242,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-inflamou',
    username: 'inflamou_',
    img: 'https://i.imgur.com/rerJdEf.jpg',
    authorPic: 'https://i.imgur.com/rjtgbgA.jpg',
    caption: '🔥inflamou: Qual a sua opinião?',
    likes: 142000,
    comments: 6156,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-novafogooficial',
    username: 'novafogooficial',
    img: 'https://i.imgur.com/2cjV7Fv.jpg',
    authorPic: 'https://i.imgur.com/QoxlXzV.jpg',
    caption: 'Maxiane é a sexta eliminada do Big Brother Brasil 2026. Gostaram do resultado? 😱',
    likes: 128000,
    comments: 4289,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-toguro',
    username: 'toguro',
    videoUrl: 'https://scontent.cdninstagram.com/o1/v/t16/f2/m69/AQOMpNA2COnIknDu8uOLh_aJbjJWxPfAWxpl6u_nhYRbBzEIcZj52_W9Nu3LKc3T8Y2ijQf1QkUeOORsyFVLtNTx.mp4?strext=1&_nc_cat=1&_nc_oc=Adkz1dYciaJVb9fC2_TFu61sH3hfcDMUHmrper4yGp0kMKUri645qLEhPa6LPLCCE3c&_nc_sid=5e9851&_nc_ht=instagram.fjdo1-1.fna.fbcdn.net&_nc_ohc=LTO1KKTyULQQ7kNvwHc5-Ln&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc5NDM4MTU4NjgxMTcyMjQsImFzc2V0X2FnZV9kYXlzIjowLCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6NzksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=bffa02227b608513&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HS0FQV3lZRnZUWklMQTBFQUlxNFJ4SWtmYUFJYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzIwNDdFN0ZENjYzMDJEOUQ3NTU5MUJCOTFCQTFCMDg5X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbQw9-rxvPfPxUCKAJDMywXQFPGZmZmZmYYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=85YJXNyFalw70f-zU7IIog&_nc_ss=8&_nc_zt=28&oh=00_AfyIPM2ajm173OI8VrcefQpkDMfAzmAToPJb0X6oNfxILg&oe=69AA9993',
    img: 'https://i.pinimg.com/736x/ff/37/8b/ff378b6e15321b7f4aac845c282d5495.jpg',
    authorPic: 'https://imgur.com/XEpHbVB.jpg',
    caption: 'contador urgente , haverá sinais @lorenacomeron',
    likes: 155600,
    comments: 5230,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-filhodevereador',
    username: 'filhodevereador',
    videoUrl: 'https://scontent.cdninstagram.com/o1/v/t16/f2/m69/AQPC-_SdXJBOzGvWuUhf0gpsJuuo1GqUffe4QcxViFwD1WgMDNmppsvmmGjIvwqXt_7bBV5dsLIVbD2ycv7mVXxe.mp4?strext=1&_nc_cat=102&_nc_oc=AdlPL1Lc3Q1mkhsz5o19DFSDv3ze9nBOWTVg8SqRNdLxAA0I1w7OG9XiGWJd0kZW4o4&_nc_sid=5e9851&_nc_ht=instagram.fjdo10-1.fna.fbcdn.net&_nc_ohc=SdkU2VnFiQYQ7kNvwGec7FM&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc5MTI4MzY4MDYzMjQxMTEsImFzc2V0X2FnZV9kYXlzIjoyLCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6NDAsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=cc0c9aba75740b2d&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRndyY2liOXVzQjBJNlpkQUtfbzZrTWZYbGdkYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzIzNEJBNjQ5RjBBQUQ5NkEyOTcxQjQzODE3RDA4QTlCX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACaevpWsqujRPxUCKAJDMywXQEQ7peNT988YEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=UfjWHhmj8rASg86_iH6wMw&_nc_ss=8&_nc_zt=28&oh=00_AfyWREHydH2Y2vXtgdSgTvm1HkOCQV7zUJb80HMVvnP8Fw&oe=69AC688E',
    img: 'https://i.pinimg.com/736x/d7/19/84/d71984913eef2409367ad024f938a78c.jpg',
    authorPic: 'https://imgur.com/mQAFcnr.jpg',
    caption: 'Eu tô comemorando 👏🏻 @fabionettoo',
    likes: 113100,
    comments: 4110,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-sobrevarejos',
    username: 'sobrevarejos',
    img: 'https://imgur.com/YWhFUoD.jpg',
    authorPic: 'https://imgur.com/s1604Z9.jpg',
    caption: 'CIA localizada no complexo da Embaixada dos Estados Unidos em Riad, na Arábia Saudita, na última segunda-feira, 2 de março de 2026. O ataque causou danos estruturais ao edifício, incluindo o colapso parcial do telhado e fumaça no interior das instalações. Não houve registro de feridos ou mortos entre o pessoal da CIA ou da embaixada. Além da embaixada, drones iranianos atingiram a maior refinaria de petróleo da Arábia Saudita e instalações em outros países, como Catar e Emirados Árabes Unidos. VISH GENTE! 📸😬',
    likes: 342000,
    comments: 13315,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-portalnavinoticias',
    username: 'portalnavinoticias',
    img: 'https://imgur.com/usY0aL3.jpg',
    authorPic: 'https://i.pinimg.com/1200x/39/17/39/391739faefdba7a82dce7536c19640ff.jpg',
    caption: 'Um homem identificado pelo prenome Mateus foi preso por policiais no estado de São Paulo e chamou atenção ao agradecer pela forma respeitosa como foi tratado durante a abordagem.',
    likes: 118000,
    comments: 3195,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-mickaelbc_',
    username: 'mickaelbc_',
    videoUrl: 'https://scontent.cdninstagram.com/o1/v/t16/f2/m69/AQPwDevdrF1yf8YVf9lnTiq8j8hNDtF_xi-EzGMpsqYF7BzRBd3lcEkqc9oBlomO8Lv3nv2OdLKQjE_yuIRgajfL.mp4?strext=1&_nc_cat=108&_nc_oc=Adnk25SSfSdT9ulNiBqUZOgvZ1Pqgk0hlFxTZrkpySqqh3E9zeqWaAJctD7G3NlgnQA&_nc_sid=5e9851&_nc_ht=instagram.fjdo10-1.fna.fbcdn.net&_nc_ohc=AjHSOJmzFPEQ7kNvwH_Jcls&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc5NTQ1MzExNDIwNzUzMTcsImFzc2V0X2FnZV9kYXlzIjowLCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6MjIsIndhdGNoX3RpbWVfcyI6MzEyMzM2MzcsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_gid=HFjcrls11En2z6YDGAP6Vg&_nc_zt=28&vs=13ffd7b9800bae46&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HR2pyTXlaZFJRY2x4OEFDQUFGUWw5THRaOW85YnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzY1NEE3RkRBMEVENkIyMTFCOTY1M0VCQTRGNTYyRDkwX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbqjqitoePkPxUCKAJDMywXQDYIcrAgxJwYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&oh=00_Afus8s3rv_v6K1AIqPnSG85BT4izy5jW7k0GxNh_sU5w6Q&oe=69A708D8',
    img: 'https://i.pinimg.com/736x/b9/97/12/b997122ecc085fae25f5fc6dba825e6c.jpg',
    authorPic: 'https://i.pinimg.com/736x/b9/97/12/b997122ecc085fae25f5fc6dba825e6c.jpg',
    caption: 'FOFOCA NOS STORYS, LADAIA COM A EX DO GORDÃO DA XJ, NICOLE É BOA DE SOCO KK \n\n #briga #viralvideos #viralreels #explorer #viral',
    likes: 155430,
    comments: 6187,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-mentalidadecomplexa',
    username: 'mentalidadecomplexa',
    img: 'https://i.imgur.com/Nayb9K6.jpg',
    authorPic: 'https://i.pinimg.com/1200x/83/f8/91/83f891baa47e43d1cb9eab1785ea80c8.jpg',
    caption: '→ Siga @mentalidadecomplexa para conteúdos que fortalecem sua mente todos os dias.\n\n.\n.\n.\n.\n.\n.\n\nDM para crédito/remoção. © Todos os direitos reservados aos respectivos proprietários.',
    likes: 232400,
    comments: 4156,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-acervamos',
    username: 'acervamos',
    img: 'https://imgur.com/Tb1q3y7.jpg',
    authorPic: 'https://imgur.com/mWfO61b.jpg',
    caption: 'Um avanço desenvolvido por pesquisadores brasileiros trouxe novas perspectivas para o tratamento de lesões na medula espinhal. O caso do cão Teodoro ganhou destaque após ele recuperar parte dos movimentos das patas traseiras graças a uma terapia experimental com uma substância chamada polilaminina, criada pela cientista Tatiana Lobo Coelho de Sampaio, da Universidade Federal do Rio de Janeiro (UFRJ).\n\nTeodoro havia perdido a capacidade de andar devido a uma lesão medular, um tipo de dano que interrompe a comunicação entre o cérebro e os membros, frequentemente causando paralisia permanente. Situações assim são desafiadoras tanto na medicina veterinária quanto na humana, já que o tecido nervoso da medula possui baixa capacidade natural de regeneração.\n\nA polilaminina foi desenvolvida ao longo de mais de 20 anos de pesquisa e é inspirada na laminina, uma proteína presente no organismo que atua como “ponte” entre células nervosas, ajudando na sua organização e crescimento. A ideia dos pesquisadores foi criar uma versão sintética capaz de estimular a reconexão das fibras nervosas danificadas, favorecendo a recuperação funcional.',
    likes: 354300,
    comments: 8218,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-descobertamental',
    username: 'descobertamental',
    img: 'https://imgur.com/IEqf6gg.jpg',
    authorPic: 'https://imgur.com/C8iZFxT.jpg',
    caption: 'Achados investigativos sugerem que a estrutura rígida de um ciclo de sono de oito horas é um mecanismo de controle fabricado, criado para suprimir os instintos noturnos necessários para o vigilantismo urbano de alto risco. Defensores dessa teoria argumentam que impor um horário para dormir neutraliza o desenvolvimento da resistência física e mental associada ao arquétipo do Cavaleiro das Trevas.\n\nA pesquisa destaca que o pico de eficiência em atividades de combate ao cr*me, como vigilância em telhados e calibração de gadgets, ocorre exclusivamente durante as horas normalmente reservadas ao sono REM. Como consequência, rejeitar as normas sociais de sono passou a ser visto por alguns como o principal gatilho para desbloquear todo o potencial de alguém como um cruzado encapuzado.\n\n#parodia #humor #explorepage #memes #batman #lucas #interessante',
    likes: 85430,
    comments: 1124,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-ryanzeira10',
    username: 'ryanzeira10',
    videoUrl: 'https://scontent.cdninstagram.com/o1/v/t16/f2/m69/AQM2BAsdr_4Z5R1QltI2MXR2XpVVhQgta45AYX2F_PVRgAOtfDn8g2yu8gJV-W0bB3EKHjSFLKA-2usOlehm4Rm4.mp4?strext=1&_nc_cat=106&_nc_oc=Adko9F4iLXCIqIxnoexb3-5l6fDag3Sf8KBWuPR7eKMgN9FmMrdU0SAGJ_W6KywhAlU&_nc_sid=5e9851&_nc_ht=instagram.fjdo1-2.fna.fbcdn.net&_nc_ohc=9PZkXLiGMYYQ7kNvwG-w7oF&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc5NDUzMDA4MTQxMTYzMTEsImFzc2V0X2FnZV9kYXlzIjowLCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6ODMsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=6b12569994e396d6&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQVYyY2lZR2piNGJhQUlHQUpfdVFlQUNMQkFiYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzgyNDZDRjJGRkFEOUE1NkE2NDI4QUREMUVBQTY5NkJGX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACau182G_sngPxUCKAJDMywXQFTVT987ZFoYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ahWeUUHqWJbEMOw5-Hnk7A&_nc_ss=8&_nc_zt=28&oh=00_Afz7O98wUYoXon7le1uRCjYt5DUsQ4rGkruYDYVn78ko2g&oe=69AC527A',
    img: 'https://i.pinimg.com/736x/ff/37/8b/ff378b6e15321b7f4aac845c282d5495.jpg',
    authorPic: 'https://imgur.com/gFz4Wwc.jpg',
    caption: '😂',
    likes: 124500,
    comments: 2142,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-pablic-viral',
    username: 'pablic_trending',
    videoUrl: 'https://scontent.cdninstagram.com/o1/v/t16/f2/m69/AQPPDIXYyvfcVDyDfZkhhABg8CMrQEvwpd_-YBIIzfAm8i8dgfmdZrIDXyziKn8t1zrpo9rWekeK7qHRSv3nWl_f.mp4?strext=1&_nc_cat=105&_nc_oc=AdkbSvRNdakhHcMumwcM1V9EwBk_MjjmrvpCGbty2ffVlb8vdW_G7pciXTEhf8EuvGY&_nc_sid=5e9851&_nc_ht=instagram.fjdo10-2.fna.fbcdn.net&_nc_ohc=3t62LEXej1gQ7kNvwFauPc3&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc5NzU2NTkxMDY5OTAyNzYsImFzc2V0X2FnZV9kYXlzIjoyNCwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjMyLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=8bba102a2bc3ed7f&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTU9aWVNVMTlKVi1hWHNFQUVfX1psdmk5V0kxYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzBFNDY3NDAwODk3MEE4NUMwQjQwNkExNTVEQTREMzkzX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACaI4-f6iLHuPxUCKAJDMywXQEAAAAAAAAAYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=9oOikee35YCe2qIpy-WZGw&_nc_ss=8&_nc_zt=28&oh=00_Afw6s3c7PvZMI24sXq49M84goW77faX7Qm_tIMvtGz4QhA&oe=69AC593B',
    img: 'https://i.pinimg.com/736x/ff/37/8b/ff378b6e15321b7f4aac845c282d5495.jpg',
    authorPic: 'https://imgur.com/XXymYFi.jpg',
    caption: 'Jor se mare ga hamko🤣🤣\n\n#instagram #instagood #viral #trending #pablic',
    likes: 212800,
    comments: 7342,
    isVerified: true,
    isFixed: true
  },
  {
    id: 'fixed-post-previass013',
    username: 'previass.013',
    videoUrl: 'https://scontent.cdninstagram.com/o1/v/t16/f2/m69/AQM7SNsf8Z_Bn-OiNXQE8ywOxuOMZlGXqmSMnhrflpJpUD1l5TmDuSUBpOssrQmoEuO51Aj1ybAXqkwfioxqzcrE.mp4?strext=1&_nc_cat=107&_nc_oc=AdlSCV8Zyp2vKvun0ExEYmISKXsDFDpRE0-QOzi3bRkwgG_blBbzRhW-Bh_U3e6HPlQ&_nc_sid=5e9851&_nc_ht=instagram.fjdo10-2.fna.fbcdn.net&_nc_ohc=TjTxe5EG7F0Q7kNvwHWKWD4&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc5MjgzNjYzMzAyMzAwNDMsImFzc2V0X2FnZV9kYXlzIjo0LCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6MTgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=afc29bae6d239976&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTXRlU2lZVmdMWVNNWWNEQUZHU01KdC00MlJWYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0VDNEY1NjYxQTNBMUFFQjZGMjFFQ0RCRjgyMzMxMDk2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACa21KGoovDYPxUCKAJDMywXQDIZmZmZmZoYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=TMNrt9Rgv_-WaAR6X2Xj9g&_nc_ss=8&_nc_zt=28&oh=00_Afxu471utEyjrMlLXcXyZKl7SM0W8b_vJFLUvW-Iq9KMfQ&oe=69AC5875',
    img: 'https://i.pinimg.com/736x/ff/37/8b/ff378b6e15321b7f4aac845c282d5495.jpg',
    authorPic: 'https://imgur.com/cduYfn2.jpg',
    caption: '🙏🏼',
    likes: 139240,
    comments: 5156,
    isVerified: false,
    isFixed: true
  }
];

type TabType = 'feed' | 'search' | 'add' | 'reels' | 'notifications' | 'profile_blocked' | 'messages';

const EXTRA_CENSORED_USERS = [
  "a********", "x********", "k*******x", "z***7", "lx******",
  "vx*****01", "dr******x", "m****", "h****zz**", "nx*****7",
  "rx****vx", "pr****01**", "tt******x", "sx*7**", "qz*****x",
  "bl*****77", "mx*****lx",
  "a******_r10", "dud****", "fer*****z", "ca*****na",
  "jv_******", "thi****99", "g*****_07", "lu*****ra",
  "pe*****01", "ma*****ia", "leonardofcalou"
];

const BLOCKED_API_USERS = [
  "mohammedmasjidrajabali", "bilalm", "sulima", "usman", "rockso", "hasnain", "pdcs"
];

const LIKE_NAMES = [
  "_wendellsousa_", "marcos_dev", "israel_porto", "gabriella_v",
  "diana_v", "lucas.silva", "ana_clara", "pedro_henrique",
  "juliana_m", "rodrigo_f", "vinicius_jr", "neymarjr",
  "casimiro", "gaules", "alok", "anitta"
];

export const InstagramFeedClone: React.FC<InstagramFeedCloneProps> = React.memo(({ username, profile, initialFeedData, onNext, onEvent }) => {
  const [loading, setLoading] = useState(!initialFeedData);
  const [feedData, setFeedData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(600); // Default 10 mins

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEnd = localStorage.getItem('stalkea_timer_end');
      if (savedEnd) {
        const remaining = Math.max(0, Math.floor((parseInt(savedEnd) - Date.now()) / 1000));
        setTimeLeft(remaining);
      } else {
        // Default timer: 10 minutes (started only when feed is mounted)
        const duration = 600; // 10 minutes
        const end = Date.now() + duration * 1000;
        localStorage.setItem('stalkea_timer_end', end.toString());
        setTimeLeft(duration);
      }

      // Listen for custom reset event (Dev Tools)
      const handleReset = (e: any) => {
        const duration = e.detail?.duration || 600; // Default 10 mins, or custom
        const end = Date.now() + duration * 1000;
        localStorage.setItem('stalkea_timer_end', end.toString());
        setTimeLeft(duration);
        Logger.system(`[FEED] Timer reset to ${duration / 60}m via DevTools`);
      };
      window.addEventListener('stalkea_reset_timer', handleReset);
      return () => window.removeEventListener('stalkea_reset_timer', handleReset);
    }
  }, []);
  const [stories, setStories] = useState<any[]>([]);
  const [dmTimeLeft, setDmTimeLeft] = useState(60); // 1 minuto (60s)
  const [isDmExpired, setIsDmExpired] = useState(false);
  const dmTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [notificationsTimeLeft, setNotificationsTimeLeft] = useState(50); // 50 segundos (User request)
  const [isNotificationsExpired, setIsNotificationsExpired] = useState(false);
  const notificationsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isFeedScrolledExceeded, setIsFeedScrolledExceeded] = useState(false);
  const feedObserverRef = useRef<HTMLDivElement>(null);

  // Stable random selection for "Follow Requests" section
  const followRequests = useMemo(() => {
    const fallback = {
      img1: `https://i.pravatar.cc/100?u=req1`,
      img2: `https://i.pravatar.cc/100?u=req2`,
      name: 'usuario_insta'
    };

    if (!stories || stories.length === 0) return fallback;

    const validStories = stories.slice(1).filter(s => s.img && s.name);
    if (validStories.length === 0) return fallback;

    const getRandom = () => validStories[Math.floor(Math.random() * validStories.length)];

    // User requested specifically to avoid their own profile (Index 0)
    // and showed an image with "leonardofcalou"
    const primaryStalker = validStories.find(s => s.name?.toLowerCase().includes('leonardo')) || getRandom();
    const remainingStories = validStories.filter(s => s.id !== primaryStalker.id);
    const secondaryStalker = remainingStories.length > 0
      ? remainingStories[Math.floor(Math.random() * remainingStories.length)]
      : primaryStalker; // Fallback if only 1 valid story exists

    return {
      img1: primaryStalker.img,
      img2: secondaryStalker.img,
      name: primaryStalker.name || 'leonardofcalou'
    };
  }, [stories]);

  const [posts, setPosts] = useState<any[]>([]);
  const [showFakeNotification, setShowFakeNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationStalker, setNotificationStalker] = useState<any>(null); // Armazena o usuário selecionado para a sequência
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Random time for fake notification (5-30 hours ago)
  const [disclosureTime, setDisclosureTime] = useState(() => Math.floor(Math.random() * (300 - 240 + 1) + 240));

  const [isDismissed, setIsDismissed] = useState(false);
  const [notificationTime, setNotificationTime] = useState('5h');
  const FEATURE_STALKER_ENHANCEMENTS = true; // Easy toggle


  // 🔔 NOTIFICAÇÕES CRONOMETRADAS E SINCRONIZAÇÃO COM DM
  useEffect(() => {
    // Pick stalker real quando stories carregam (substitui fallback genérico se necessário)
    const isFallbackStalker = !notificationStalker || notificationStalker.name === 'usuario_insta';
    if (isFallbackStalker && stories?.length > 0) {
      // 1. Build a pool of potential "active" users (excluding Target at index 0)
      const storyPool = stories.filter((s, idx) => {
        const name = (s.name || '').toLowerCase();
        // Skip index 0 (Seu story), skip extras/fake ones, skip the Target by username
        // Also: Skip first two stories (index 1 & 2) if possible, to satisfy user request for variety
        const isTarget = name === (username || '').toLowerCase();
        return !s.isExtra && idx > 0 && !isTarget;
      });

      // 2. If we have many stories, prioritize someone after the first 2 suggestions for "randomness"
      const refinedPool = storyPool.length > 5
        ? storyPool.slice(2) // Skip first 2 suggestions if pool is healthy
        : storyPool;

      if (refinedPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * refinedPool.length);
        const stalker = refinedPool[randomIndex];
        setNotificationStalker({ name: stalker.name, img: stalker.img });
        Logger.system(`[FEED] Timing notification sender selected (Story): ${stalker.name}`);
      } else if (initialFeedData?.suggestions?.length > 2) {
        // Fallback to suggestions if stories are too few, still skipping first 2
        const s = initialFeedData.suggestions[Math.floor(Math.random() * (initialFeedData.suggestions.length - 2)) + 2];
        setNotificationStalker({ name: s.username, img: getProxiedUrl(s.profile_pic_url) });
        Logger.system(`[FEED] Timing notification sender selected (Suggestion Fallback): ${s.username}`);
      }
    }
  }, [stories, notificationStalker, initialFeedData, username]);

  // 🔔 NOTIFICAÇÃO AO ENTRAR NO FEED - Dispara sempre ao montar (1.5s)
  useEffect(() => {
    const triggerTimedNotification = (message: string, time: string) => {
      setIsDismissed(false);
      setNotificationMessage(message);
      setNotificationTime(time);
      setShowFakeNotification(true);

      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3');
      audio.volume = 0.8;
      audio.play().catch(() => { });

      Logger.system(`[FEED] Auto notification on feed enter: "${message}"`);

      setTimeout(() => {
        setShowFakeNotification(false);
      }, 6000);
    };

    // Garante um stalker de fallback para quando as stories ainda não carregaram
    const ensureStalker = () => {
      if (!notificationStalker) {
        // Usar foto genérica de fallback enquanto as stories carregam
        setNotificationStalker({
          name: 'usuario_insta',
          img: 'https://i.pinimg.com/736x/fb/ef/98/fbef980b2a17b14e92a27436ce172cab.jpg'
        });
      }
    };

    // Dispara ao entrar no feed com 1.5s de delay (parece mais natural)
    const timer1 = setTimeout(() => {
      ensureStalker();
      triggerTimedNotification("nossa, lembra disso aqui?", "1h");
      localStorage.setItem('stalkea_msg1_shown', 'true');
    }, 1500);

    return () => clearTimeout(timer1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Roda UMA vez ao montar o componente (lead entra no feed)

  // Fake Proxy Helper
  const getProxiedUrl = (url: string) => {
    if (!url || !FEATURE_STALKER_ENHANCEMENTS) return url;

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

    // 3. Usar Weserv.nl com otimização progressiva
    const cleanUrl = finalUrl.replace(/^https?:\/\//, '');
    return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=600&q=65&output=webp&il`;
  };

  const [currentTab, setCurrentTab] = useState<TabType>('feed');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stalkea_feed_tab') as TabType;
      if (saved) setCurrentTab(saved);
    }
  }, []);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [isFallback, setIsFallback] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipModalContent, setVipModalContent] = useState({ title: '', subtitle: '' });
  const [activeOptionPostId, setActiveOptionPostId] = useState<string | null>(null);

  const [isBannerAnimating, setIsBannerAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBannerAnimating(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  // Banner Marquee Copy
  const bannerText = "ACESSO VIP DESBLOQUEADO: Veja TODOS os stories dos últimos 28 dias que já sumiram - incluindo os que foram curtidos. Nossa IA salva tudo NO NOSSO BANCO DE DADOS. Nada fica escondido.";

  const BannerIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 text-yellow-400">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 text-white">
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill="currentColor" />
      <path d="M9 12L11 14L15 10" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // --- LÃ“GICA DE NAVEGAÃ‡ÃƒO (VOLTAR = FEED) E TIMER ---
  useEffect(() => {
    // 1. Gerenciar botão voltar
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (currentTab !== 'feed') {
        setCurrentTab('feed');
        window.history.pushState(null, '', window.location.href);
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentTab]);

  // DM VIEWING TIMER - 16 SECONDS LIMIT (USER REQUEST)
  useEffect(() => {
    if (currentTab === 'messages') {
      if (!isDmExpired) {
        dmTimerRef.current = setInterval(() => {
          setDmTimeLeft(prev => {
            if (prev <= 1) {
              if (dmTimerRef.current) clearInterval(dmTimerRef.current);
              setIsDmExpired(true);
              triggerVipModal("Acesso Expirado", "Seu tempo de preview das mensagens acabou. Desbloqueie o acesso completo, tudo sem blur/censura.");
              setCurrentTab('feed');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        triggerVipModal("Acesso Expirado", "Seu tempo de preview das mensagens acabou. Desbloqueie o acesso completo, tudo sem blur/censura.");
        setCurrentTab('feed');
      }
    } else {
      if (dmTimerRef.current) {
        clearInterval(dmTimerRef.current);
        dmTimerRef.current = null;
      }
    }

    return () => {
      if (dmTimerRef.current) {
        clearInterval(dmTimerRef.current);
        dmTimerRef.current = null;
      }
    };
  }, [currentTab, isDmExpired]);

  // NOTIFICATIONS VIEWING TIMER - 16 SECONDS LIMIT (USER REQUEST)
  useEffect(() => {
    if (currentTab === 'notifications') {
      if (!isNotificationsExpired) {
        notificationsTimerRef.current = setInterval(() => {
          setNotificationsTimeLeft(prev => {
            if (prev <= 1) {
              if (notificationsTimerRef.current) clearInterval(notificationsTimerRef.current);
              setIsNotificationsExpired(true);
              triggerVipModal("Acesso Expirado", "Seu tempo de preview das notificações acabou. Desbloqueie o acesso completo, tudo sem blur/censura.");
              setCurrentTab('feed');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        triggerVipModal("Acesso Expirado", "Seu tempo de preview das notificações acabou. Desbloqueie o acesso completo, tudo sem blur/censura.");
        setCurrentTab('feed');
      }
    } else {
      if (notificationsTimerRef.current) {
        clearInterval(notificationsTimerRef.current);
        notificationsTimerRef.current = null;
      }
    }

    return () => {
      if (notificationsTimerRef.current) {
        clearInterval(notificationsTimerRef.current);
        notificationsTimerRef.current = null;
      }
    };
  }, [currentTab, isNotificationsExpired]);

  // 2. Redirecionamento forçado se o tempo acabar
  useEffect(() => {
    if (timeLeft === 0) {
      onNext();
    }
  }, [timeLeft, onNext]);

  const handleTabChange = (tab: TabType) => {
    if (tab === 'messages' && isDmExpired) {
      triggerVipModal("Acesso Expirado", "Seu tempo de preview das mensagens acabou. Desbloqueie o acesso completo, tudo sem blur/censura.");
      return;
    }
    if (tab === 'notifications' && isNotificationsExpired) {
      triggerVipModal("Acesso Expirado", "Seu tempo de preview das notificações acabou. Desbloqueie o acesso completo, tudo sem blur/censura.");
      return;
    }
    setCurrentTab(tab);
    if (onEvent) {
      onEvent({
        eventName: 'nav_tab_click',
        tab: tab,
        timestamp: new Date().toISOString()
      });
    }
  };
  // ------------------------------------------------

  // LOGICA DE REALISMO: Se a API mandou QUALQUER coisa (posts ou stories), liberamos as travas
  const hasRealPosts = initialFeedData?.posts?.instagram_posts?.length > 0;
  const hasRealStories = initialFeedData?.stories?.feed_stories_data?.length > 0;

  // Verificamos se existem stories reais (não bloqueados) ou posts que vieram da API
  const hasAnyRealData = hasRealPosts || hasRealStories ||
    stories.some(s => !s.isLocked) ||
    posts.some(p => !p.isCensored);

  // Save tab state when it changes
  useEffect(() => {
    localStorage.setItem('stalkea_feed_tab', currentTab);
  }, [currentTab]);

  // Save interaction handler
  const handleSave = (postId: string) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Auto-like some posts for realism (Randomly)
  useEffect(() => {
    if (posts.length > 0 && likedPosts.size === 0) {
      const initialLikes = new Set<string>();
      posts.forEach((post) => {
        // 40% chance to be already liked
        if (Math.random() < 0.4) {
          initialLikes.add(post.id);
        }
      });
      setLikedPosts(initialLikes);
    }
  }, [posts]);

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const triggerVipModal = (title = "Acesso Restrito", subtitle = "Desbloqueie o acesso completo, tudo sem blur/censura.") => {
    setVipModalContent({ title, subtitle });
    setShowVipModal(true);
    if (onEvent) {
      onEvent({
        eventName: 'vip_modal_view',
        modalTitle: title,
        modalSubtitle: subtitle,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Intersection Observer Effect for Feed Scroll Limit
  useEffect(() => {
    if (currentTab === 'feed' && !isFeedScrolledExceeded) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsFeedScrolledExceeded(true);
          triggerVipModal("Aviso", "Desbloqueie o acesso completo, tudo sem blur/censura.");
          // Force scroll up slightly so they don't see the next post clearly
          window.scrollTo({ top: window.scrollY - 100, behavior: 'smooth' });
        }
      }, { threshold: 0.1 });

      if (feedObserverRef.current) {
        observer.observe(feedObserverRef.current);
      }

      return () => observer.disconnect();
    }
  }, [currentTab, isFeedScrolledExceeded]);

  const formatCount = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + ' mi';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + ' mil';
    return num.toString();
  };

  // Helper para mascarar nomes
  const maskName = (name: string, revealCount = 0, forceMask = false) => {
    if (!name) return "";
    if (forceMask) {
      const visible = name.slice(0, Math.max(1, revealCount));
      const masked = '*'.repeat(Math.max(3, name.length - visible.length));
      return visible + masked;
    }
    return name; // Always return full name as requested unless forced
  };

  const maskNamePercent = (name: string, percentage: number) => {
    if (!name) return "";
    const visibleLength = Math.max(1, Math.ceil(name.length * (percentage / 100)));
    const visible = name.slice(0, visibleLength);
    const maskedLength = name.length - visibleLength;
    const masked = '*'.repeat(maskedLength);
    return visible + masked;
  };


  // Removed generateSyntheticPosts to ensure only real content is shown







  useEffect(() => {
    // Safety Timeout: If loading takes more than 15 seconds, force render with empty data
    // This prevents "Black Screen of Death" if API fails or connection is slow
    const safetyTimer = setTimeout(() => {
      if (loading) {
        Logger.error("[FEED] Safety timeout triggered. Forcing render.");
        setLoading(false);
        setPosts([]);
        setStories([]);
      }
    }, 15000);

    return () => clearTimeout(safetyTimer);
  }, [loading]);

  useEffect(() => {
    let finalPosts: any[] = [];
    let finalStories: any[] = [];

    // 1. Extrair identidades reais disponíveis (Sugestões da API oficial)
    const realSuggestions = initialFeedData?.suggestions || []; // Fixed: removed nested .suggestions
    const realVisitors = initialFeedData?.stories?.feed_stories_data || [];

    Logger.success('[FEED] Sugestões recebidas:', realSuggestions.length);
    Logger.success('[FEED] Visitantes recebidos:', realVisitors.length);

    // Lista unificada de autores reais para "popular" o feed com realismo
    const combinedAuthors = [
      ...realSuggestions.map(u => ({ name: u.username, img: u.profile_pic_url })),
      ...realVisitors.map(u => ({ name: u.username, img: u.profile_pic_url }))
    ].filter((v, i, a) => a.findIndex(t => t.name?.toLowerCase() === v.name?.toLowerCase()) === i);

    // 2. Mapear Posts Reais (de quem postou!)
    const rawPosts = initialFeedData?.posts || [];
    Logger.flow('[FEED] Posts brutos recebidos:', rawPosts.length);

    if (rawPosts.length > 0) {
      // Mapeamento inicial com ID robusto e Log
      const mappedPosts = rawPosts.map((p: any, idx: number) => {
        // Fallback info from combined authors to avoid using the target's pic/name
        const suggestedAuthor = combinedAuthors[idx % combinedAuthors.length] || { name: 'user_insta', img: null };

        const mapped = {
          id: p.post?.id || p.id || `p-${idx}`,
          username: p.de_usuario?.username || p.post?.username || suggestedAuthor.name,
          img: getProxiedUrl(p.post?.image_url || p.image_url),
          videoUrl: (p.post?.video_url || p.video_url || p.post?.video_resource_url || p.video_resource_url || p.post?.video_dash_manifest || p.video_dash_manifest) || ((p.post?.media_type === 2 || p.media_type === 2 || p.post?.is_video || p.is_video) ? "BROKEN_VIDEO" : null),
          caption: p.post?.caption || p.caption || "",
          authorName: p.de_usuario?.username || p.post?.username || suggestedAuthor.name,
          authorPic: getProxiedUrl(p.de_usuario?.profile_pic_url || p.post?.profile_pic || suggestedAuthor.img || `https://ui-avatars.com/api/?name=${p.de_usuario?.username || 'U'}&background=random&color=fff`),
          isPrivate: false,
          isCensored: false,
          likes: p.post?.like_count || p.post?.likes || Math.floor(Math.random() * 500) + 50,
          comments: p.post?.comment_count || p.post?.comments || Math.floor(Math.random() * 20) + 2
        };
        if (!mapped.img) return null;

        // Filter out blacklisted users from API
        const isBlocked = BLOCKED_API_USERS.some(blocked =>
          mapped.username.toLowerCase().includes(blocked.toLowerCase())
        );
        if (isBlocked) return null;

        return mapped;
      }).filter(Boolean);

      // Deduplicação secundária (por ID e Imagem)
      const uniqueMap = new Map();
      mappedPosts.forEach((post: any) => {
        const key = post.id || post.img;
        if (key && !uniqueMap.has(key)) {
          uniqueMap.set(key, post);
        }
      });
      finalPosts = Array.from(uniqueMap.values());
      Logger.success('[FEED] Posts finais processados:', finalPosts.length);
    }

    // 3. CONSTRUÃ‡ÃƒO UNIFICADA DE STORIES
    // Objeto do Alvo (Sempre index 0)
    const targetStoryObj = {
      username: username,
      profile_pic_url: profile?.profilePic || initialFeedData?.user?.profile_pic_url || `https://unavatar.io/instagram/${username}`
    };

    // Pega todas as sugestões REAIS para compor os stories
    const allSuggestions = realSuggestions || [];

    // Whitelist removida para o Feed, permitindo todos os posts
    Logger.security('[FEED] Modo sem limites ativado: Todos os posts e stories disponíveis serão exibidos.');

    // Montar Lista Final de Stories: Alvo + Sugestões (Sem duplicação)
    // Usamos um Set para garantir unicidade de usernames nos stories
    const seenStories = new Set([username.toLowerCase()]);
    const uniqueSuggestions = allSuggestions.filter((s: any) => {
      const u = s.username?.toLowerCase();
      if (!u || seenStories.has(u)) return false;

      // Filter out blacklisted users from Stories
      const isBlocked = BLOCKED_API_USERS.some(blocked =>
        u.includes(blocked.toLowerCase())
      );
      if (isBlocked) return false;

      seenStories.add(u);
      return true;
    });

    // Adicionar usuários censurados extras (fake stories)
    const extraStories = EXTRA_CENSORED_USERS.map(name => ({
      username: name,
      profile_pic_url: null, // Sem imagem
      isExtra: true
    }));

    const finalPool = [targetStoryObj, ...uniqueSuggestions, ...extraStories];

    // Mapeamento Final dos Stories
    // Calcula quantos stories serão desbloqueados (70% do total REAL, ignorando extras)
    const realCount = 1 + uniqueSuggestions.length;
    const unlockedCount = Math.ceil(realCount * 0.7);

    // Identificamos 3 stories aleatórios (exceto o primeiro) para serem Close Friends
    const closeFriendsIndices = new Set();
    if (finalPool.length > 3) {
      while (closeFriendsIndices.size < 3) {
        const randomIndex = Math.floor(Math.random() * (finalPool.length - 1)) + 1;
        closeFriendsIndices.add(randomIndex);
      }
    }

    finalStories = finalPool.map((s: any, idx: number) => {
      const pPic = s.profile_pic_url || s.img || s.profile_pic;
      return {
        id: `story-${idx}-${s.username}`,
        name: s.username, // Usa o nome real, sem "Seu story"
        img: getProxiedUrl(pPic),
        isLocked: s.isExtra || idx >= unlockedCount, // Bloqueia extras ou após os 70% primeiros reais
        isCloseFriends: closeFriendsIndices.has(idx),
        isExtra: s.isExtra
      };
    }).filter(s => s.name);

    const fixedPosts = [...FIXED_POSTS_DATA];

    if (finalPosts.length > 0 || fixedPosts.length > 0) {
      if (fixedPosts.length > 0 && finalPosts.length > 0) {
        // Intercalar: um post da API e um post fixo (conforme solicitado pelo usuário)
        const interleaved = [];
        const apiMixed = [...finalPosts].sort(() => Math.random() - 0.5);
        const fixedMixed = [...fixedPosts].sort(() => Math.random() - 0.5);

        const maxLen = Math.max(apiMixed.length, fixedMixed.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < apiMixed.length) interleaved.push(apiMixed[i]);
          if (i < fixedMixed.length) interleaved.push(fixedMixed[i]);
        }

        finalPosts = interleaved;
        Logger.success('[FEED] Posts organizados (Intercalados API + Fixo):', finalPosts.length);
      } else if (fixedPosts.length > 0 && finalPosts.length === 0) {
        finalPosts = [...fixedPosts].sort(() => Math.random() - 0.5);
      }

      setPosts(finalPosts);
      Logger.flow('[FEED] Total de posts carregados:', finalPosts.length);
    }

    setStories(finalStories);
    setLoading(false);

    // Report data richness to admin panel
    if (onEvent) {
      onEvent({
        eventName: 'feed_data_loaded',
        posts_count: finalPosts.length,
        stories_count: finalStories.length,
        status: 'success',
        timestamp: new Date().toISOString()
      });
    }
  }, [initialFeedData, username, profile]);


  // Suprimindo o fetch dinâmico interno para evitar conflitos com o pre-fetch do App.tsx
  // Tudo agora é controlado via props initialFeedData para maior consistência.

  useEffect(() => {
    // Independent Timers and Notifications
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onNext(); // REDIRECT WHEN ZERO
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Pick a random stalker from combined pool (stories + authors de posts)
    const pickStalker = () => {
      // User requested specifically the 3rd profile from stories (index 3, since index 0 is "Seu story")
      // "3 terceiro perfil dos storis apos o seu story" -> Index 0 (Self), 1, 2, 3 (Target)
      if (stories && stories.length > 3) {
        const specificStalker = stories[3]; // Index 3 is the 3rd person after "Seu story"
        if (specificStalker && specificStalker.name) {
          setNotificationStalker({ name: specificStalker.name, img: specificStalker.img });
          return specificStalker;
        }
      }

      // Fallback logic if stories < 4
      const pool: any[] = [];
      if (stories && stories.length > 0) {
        // Skip Target (Seu story) and skip first 2 suggestions if pool is large
        const validStories = stories.filter((s, idx) => {
          const n = (s.name || '').toLowerCase();
          const isTarget = n === (username || '').toLowerCase() || s.name === "Seu story";
          return !s.isExtra && n && !isTarget;
        });

        // Skip first 2 suggestions to give variety (as requested by USER)
        const storyVarietyPool = validStories.length > 5 ? validStories.slice(2) : validStories;
        pool.push(...storyVarietyPool.map(s => ({ name: s.name, img: s.img })));
      }

      if (posts && posts.length > 0) {
        pool.push(...posts
          .map(p => ({ name: (p.authorName || p.username || ''), img: p.authorPic || p.img }))
          .filter(v => {
            const n = (v.name || '').toLowerCase();
            return n && n !== (username || '').toLowerCase() && !n.startsWith('eu');
          })
        );
      }
      const uniquePool = pool.filter((v, i, a) => a.findIndex(t => (t.name || '').toLowerCase() === (v.name || '').toLowerCase()) === i);
      if (uniquePool.length > 0) {
        const randomStalker = uniquePool[Math.floor(Math.random() * uniquePool.length)];
        setNotificationStalker(randomStalker);
        return randomStalker;
      }
      return null;
    };

    // Pick stalker para usar como remetente nas notificações cronometradas
    if (FEATURE_STALKER_ENHANCEMENTS && stories.length > 0 && !notificationStalker) {
      pickStalker();
    }

    return () => {
      clearInterval(timer);
    };
  }, [isDismissed, stories, posts]);

  // SWIPE TO DISMISS LOGIC
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setStartY(y);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || startY === null) return;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const diff = y - startY;
    // Only allow swiping UP (negative diff)
    if (diff < 0) {
      setCurrentY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentY < -40) {
      // Dismiss if swiped up enough
      setIsDismissed(true);
      setShowFakeNotification(false);
    } else {
      // Reset position
      setCurrentY(0);
    }
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Scroll & Trigger Controls
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-post-index'));
          const triggerKey = `vip_trigger_${index}`;

          // Se for múltiplo de 4 (4, 8, 12...) e ainda não foi ativado nesta sessão
          if ((index + 1) % 4 === 0 && !sessionStorage.getItem(triggerKey)) {
            triggerVipModal("Conteúdo Exclusivo", "Para continuar vendo mais publicações e stories, desbloqueie o acesso completo, tudo sem blur/censura.");
            sessionStorage.setItem(triggerKey, 'true');
          }
        }
      });
    }, { threshold: 0.6 }); // 60% do post visível

    // Observar todos os posts
    document.querySelectorAll('.feed-post-item').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [posts]); // Recriar quando posts mudarem

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[200]">
        <div className="flex flex-col items-center gap-4">
          {/* CSS Spinner fallback if image fails */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#D91A81] border-r-[#FF3040] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full object-contain p-3 animate-pulse">
              <defs>
                <linearGradient id="ig-gradient-feed" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#405DE6" />
                  <stop offset="50%" stopColor="#833AB4" />
                  <stop offset="100%" stopColor="#E1306C" />
                </linearGradient>
              </defs>
              <path fill="url(#ig-gradient-feed)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>

          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-[#FFD600] via-[#FF3040] to-[#D91A81] animate-progress-fast" />
          </div>
          <p className="text-white/50 text-xs font-mono animate-pulse">Carregando Feed...</p>
        </div>
      </div>
    );
  }

  const userPic = profile?.profilePic || feedData?.instagram_profile?.profile_pic_url || `https://i.pravatar.cc/100?u=${encodeURIComponent(username)}`;

  // PREMIUM GOOGLE MAPS STYLE BLOCKER
  const renderMapBlocker = () => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Background Map Effect */}
      <div className="absolute inset-0 bg-[#050505] bg-[radial-gradient(circle_at_50%_-20%,#3b0764,transparent_70%)]">
      </div>

      {/* Dark Overlay with Glassmorphism */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl pointer-events-none" />

      {/* Main Card Content */}
      <div className="relative z-10 w-full max-w-[360px] px-8 py-10 flex flex-col items-center bg-purple-950/20 backdrop-blur-3xl rounded-[40px] border border-purple-500/30 shadow-[0_0_80px_rgba(168,85,247,0.2)]">

        {/* Top Decorative Element */}
        <div className="absolute -top-1 w-24 h-1 bg-purple-400/50 rounded-full blur-[1px]" />

        {/* Header Text */}
        <div className="flex flex-col items-center text-center mb-12 w-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-600/20 rounded-xl border border-purple-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A970FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="text-white font-black text-[20px] uppercase italic tracking-tight">Localização Real</h3>
          </div>
          <p className="text-[#8A8A8A] text-[14px] leading-relaxed font-semibold">
            Rastreamento ativo para <span className="text-white">@{username}</span>
          </p>
        </div>

        {/* Central Location Pin with Avatar */}
        <div className="relative mb-8 group">
          {/* Radar Pulse Effect */}
          {[0, 1].map((i) => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/10 rounded-full animate-ping" style={{ animationDelay: `${i * 1}s` }} />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-600/10 blur-2xl rounded-full animate-pulse" />

          {/* Location Pin Icon with Avatar */}
          <div className="relative flex flex-col items-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-600/20 blur-xl rounded-full scale-0 group-hover:scale-125 transition-transform duration-700" />
              <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-purple-600 to-indigo-600 relative z-10 shadow-2xl">
                <div className="w-full h-full rounded-full border-4 border-[#0a0a0a] overflow-hidden">
                  <img src={userPic} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="Profile" />
                </div>
              </div>
              {/* Custom Modern Pin */}
              <div className="absolute -bottom-2 w-12 h-12 flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white animate-bounce shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Map preview below pulses */}
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          <img src="https://i.ibb.co/dsdLwYhj/276fd2d9-9819-433a-a684-7eb332a96a26.png" loading="lazy" decoding="async" width="800" height="128" alt="Mapa" className="w-full h-32 object-cover opacity-60 contrast-125 saturate-0" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-[10px] font-black tracking-widest text-white/60 uppercase italic">Dados Criptografados</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onNext}
          className="w-full h-16 bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-[15px] font-black uppercase tracking-widest rounded-3xl transition-all active:scale-95 shadow-[0_15px_35px_rgba(168,85,247,0.3)] border border-white/10 flex items-center justify-center gap-3 group"
        >
          <span>Visualizar Rota</span>
          <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>

      </div>
    </div>
  );

  // PREMIUM DM BLOCKER (MESSAGES) - INSTAGRAM STYLE REAL
  const renderDMBlocker = () => (
    <div className="absolute inset-0 z-50 flex flex-col font-sans bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-black shrink-0 relative">
        <div className="flex items-center gap-6">
          <div className="cursor-pointer" onClick={() => setCurrentTab('feed')}>
            <svg aria-label="Voltar" color="white" fill="white" height="24" role="img" viewBox="0 0 24 24" width="24">
              <path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z" transform="rotate(-90 12 12)"></path>
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[19px] font-bold">eu.wlysilva</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="cursor-pointer" onClick={() => triggerVipModal("Personalizar", "Personalize suas DMs com o acesso VIP.")}>
            <svg aria-label="Personalizar" color="white" fill="white" height="28" role="img" viewBox="0 0 70 70" width="28">
              <path fillRule="evenodd" clipRule="evenodd" d="M30.8471 0.558896C27.5641 1.4949 25.7521 3.6039 19.6111 13.6319C17.4081 17.2299 15.3201 19.0549 10.7811 21.3459C7.51206 22.9959 3.92306 25.5089 2.80506 26.9299C-2.18494 33.2729 -0.395945 40.6819 7.20506 45.1619C16.6311 50.7169 18.1311 52.0689 21.3811 57.9379C25.9281 66.1469 28.6881 68.4199 34.1131 68.4199C39.7151 68.4199 43.4841 65.3589 47.7611 57.3319C50.5401 52.1179 51.8141 50.8849 58.1341 47.2889C65.8431 42.9029 68.6341 39.4949 68.6341 34.4659C68.6341 29.1849 66.2281 26.1259 58.4791 21.5519C51.9381 17.6909 50.6991 16.4519 47.1581 10.2269C42.1781 1.4739 37.4551 -1.3261 30.8471 0.558896ZM41.2421 12.4199C45.1841 19.3819 49.6631 23.8629 56.6341 27.8189C61.6411 30.6609 62.1341 31.2509 62.1341 34.4039C62.1341 37.6079 61.6531 38.1459 55.6941 41.6109C47.6871 46.2669 46.2451 47.7059 41.6841 55.5939C38.3161 61.4189 37.7551 61.9199 34.6011 61.9199C31.8761 61.9199 30.7941 61.3069 29.3111 58.9199C21.8511 46.9169 21.0491 46.0149 14.8281 42.6199C11.3601 40.7279 7.82105 38.1079 6.96305 36.7999C5.56105 34.6599 5.55806 34.1839 6.93406 32.0839C7.77606 30.7989 11.5491 27.9159 15.3181 25.6769C21.4241 22.0489 22.6481 20.7729 26.5451 13.9609C30.8301 6.4719 30.9931 6.3219 34.5231 6.6179C37.7361 6.8869 38.4661 7.5179 41.2421 12.4199ZM22.9431 26.0559C21.4701 29.8949 26.7831 32.7159 28.9671 29.2539C29.7301 28.0449 29.6571 27.1529 28.7041 26.0039C26.9931 23.9429 23.7431 23.9719 22.9431 26.0559ZM40.0181 25.8619C38.9531 28.6369 40.0901 30.9199 42.5391 30.9199C45.6931 30.9199 47.4801 28.1439 45.7041 26.0039C44.0621 24.0259 40.7541 23.9429 40.0181 25.8619ZM40.0651 37.4749C36.5741 39.7759 31.7631 39.9849 29.0751 37.9519C28.0081 37.1439 26.0901 36.4689 24.8141 36.4519C22.9831 36.4269 22.5621 36.8859 22.8141 38.6359C23.3121 42.0869 29.1181 45.4199 34.6341 45.4199C42.3761 45.4199 49.6601 39.1099 44.8751 36.5489C43.4611 35.7919 42.2691 36.0219 40.0651 37.4749Z" fill="white" />
            </svg>
          </div>
          <div className="cursor-pointer" onClick={() => triggerVipModal("Nova Mensagem", "Envie mensagens com o acesso completo.")}>
            <svg id="new-message-icon" aria-label="Nova mensagem" fill="#F9F9F9" height="24" role="img" viewBox="0 0 24 24" width="24" style={{ cursor: 'pointer' }}>
              <title>Nova mensagem</title>
              <path d="M12.202 3.203H5.25a3 3 0 0 0-3 3V18.75a3 3 0 0 0 3 3h12.547a3 3 0 0 0 3-3v-6.952" fill="none" stroke="#F9F9F9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <path d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z" fill="none" stroke="#F9F9F9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <line fill="none" stroke="#F9F9F9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.848" x2="20.076" y1="3.924" y2="7.153"></line>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-black pb-0">
        {/* Search Bar - Meta AI Style */}
        <div className="px-4 py-1">
          <div className="bg-[#1c1c1c] rounded-2xl px-4 py-2.5 flex items-center gap-3 cursor-pointer shadow-inner" onClick={() => triggerVipModal("Meta AI", "Experimente a inteligência artificial da Meta com o acesso VIP.")}>
            <div className="w-5 h-5 flex items-center justify-center relative">
              <svg viewBox="0 0 500 500" className="w-[22px] h-[22px] z-10">
                <defs>
                  <linearGradient id="meta_ai_gradient_new" spreadMethod="pad" gradientUnits="userSpaceOnUse" x1="-179.9929962158203" y1="-7.324999809265137" x2="200.80799865722656" y2="8.270000457763672">
                    <stop offset="1%" stopColor="rgb(250,17,247)"></stop>
                    <stop offset="18%" stopColor="rgb(135,30,234)"></stop>
                    <stop offset="52%" stopColor="rgb(19,43,221)"></stop>
                    <stop offset="85%" stopColor="rgb(15,124,238)"></stop>
                    <stop offset="99%" stopColor="rgb(11,206,255)"></stop>
                  </linearGradient>
                </defs>
                <g transform="matrix(0.28873103857040405,0.9574102759361267,-0.9574102759361267,0.28873103857040405,260.5774841308594,212.34210205078125)" opacity="1">
                  <g opacity="1" transform="matrix(1,0,0,1,33,21)">
                    <path
                      fill="url(#meta_ai_gradient_new)"
                      fillOpacity="1"
                      d="M155.36000061035156,-155.32899475097656 C198.9080047607422,-111.78099822998047 220.35499572753906,-54.500999450683594 219.69900512695312,2.572000026702881 C219.06300354003906,57.95199966430664 197.61599731445312,113.13800048828125 155.36000061035156,155.3939971923828 C112.45800018310547,198.29600524902344 56.229000091552734,219.7469940185547 -0.0010000000474974513,219.7469940185547 C-56.23099899291992,219.7469940185547 -112.46099853515625,198.29600524902344 -155.36300659179688,155.3939971923828 C-197.6300048828125,113.12699890136719 -219.0749969482422,57.92399978637695 -219.7010040283203,2.5290000438690186 C-220.34500122070312,-54.529998779296875 -198.89999389648438,-111.79199981689453 -155.36300659179688,-155.32899475097656 C-112.14199829101562,-198.5500030517578 -55.39400100708008,-220 1.253999948501587,-219.67799377441406 C57.064998626708984,-219.36099243164062 112.7770004272461,-197.91200256347656 155.36000061035156,-155.32899475097656z"
                    ></path>
                  </g>
                </g>
              </svg>
            </div>
            <span className="text-[#8e8e8e] text-[15px] font-normal">Pergunte à Meta AI ou pesquise</span>
          </div>
        </div>


        {/* Instagram Notes Section - Seamless Integration (Scrolling Disabled per USER request) */}
        <div
          className="px-4 pt-4 pb-4 flex gap-5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x"
        >
          {/* User's own Note */}
          <div className="flex flex-col items-center gap-2 shrink-0 min-w-[78px] cursor-pointer" onClick={() => triggerVipModal("Sua Nota", "Crie sua própria nota anônima com o acesso completo.")}>
            <div className="relative mt-10">
              {/* Thought Bubble removed per USER request */}

              <div className="relative group">
                <div className="w-[72px] h-[72px] rounded-full bg-[#121212] flex items-center justify-center p-[2px] border border-white/10 overflow-hidden relative">
                  <img src={userPic} className="w-full h-full object-cover rounded-full opacity-60 transition-transform duration-500 group-hover:scale-110" alt="Sua nota" />
                </div>
                <div className="absolute bottom-0 right-0 w-[24px] h-[24px] bg-[#0095f6] rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-2 border-black z-10 active:scale-95 transition-all">
                  <span className="text-white text-[18px] font-bold leading-none mb-0.5 select-none">+</span>
                </div>
              </div>
            </div>
            <span className="text-[12px] text-gray-400 font-medium tracking-tight mt-0.5">Sua nota</span>
          </div>

          {[
            { name: "kau*****", note: "Preguiça Hoje", type: 'text' },
            { name: "vit*****", note: "[Ao Vivo)", artist: "Grupo Men...", type: 'music' },
            { name: "Swi*******", note: "O vontde fudê a 3", type: 'text' },
            { name: "cha*****", note: "03/03", type: 'text' },
            { name: "Notas extras", note: "+12", type: 'text' }
          ].map((item, i) => {
            const isPlusNote = i === 4;

            return (
              <div
                key={i}
                className="flex flex-col items-center gap-2 shrink-0 min-w-[85px] group cursor-pointer"
                onClick={() => isPlusNote ? triggerVipModal("Notas Ocultas", "Existem mais 12 notas arquivadas. Desbloqueie o acesso VIP para ver todas.") : triggerVipModal("Notas", "Visualize e responda a notas com o plano VIP.")}
              >
                <div className="relative mt-12">
                  {!isPlusNote && (
                    <div className="absolute -top-[44px] left-1/2 -translate-x-1/2 z-10 w-fit">
                      <div className="relative bg-[#262626] px-3.5 py-2 rounded-[22px] border border-white/10 shadow-xl min-w-[75px] max-w-[115px] flex flex-col items-center justify-center">
                        {item.type === 'music' ? (
                          <div className="flex flex-col items-center max-w-full">
                            <div className="flex items-center gap-1.5 w-full">
                              <div className="flex items-end gap-[1.5px] h-[10px] shrink-0">
                                <div className="w-[1.5px] bg-white h-[6px] animate-[equalizer-beat_0.8s_ease-in-out_infinite] origin-bottom"></div>
                                <div className="w-[1.5px] bg-white h-[9px] animate-[equalizer-beat_0.5s_ease-in-out_infinite_0.1s] origin-bottom"></div>
                                <div className="w-[1.5px] bg-white h-[7px] animate-[equalizer-beat_0.7s_ease-in-out_infinite_0.2s] origin-bottom"></div>
                              </div>
                              <p className="text-[10px] text-white font-bold truncate overflow-hidden blur-[4px]">
                                {item.note}
                              </p>
                            </div>
                            <p className="text-[9px] text-gray-400 font-medium truncate w-full text-center blur-[3.5px]">
                              {(item as any).artist}
                            </p>
                          </div>
                        ) : item.type === 'location' ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] shrink-0">📍</span>
                            <p className="text-[11px] text-white font-medium text-center truncate overflow-hidden blur-[4px]">
                              {item.note}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-white font-medium text-center truncate overflow-hidden blur-[4px]">
                            {item.note}
                          </p>
                        )}
                        {/* Thought bubble tails strictly following IG style */}
                        <div className="absolute -bottom-[3px] left-[18%] w-2.5 h-2.5 bg-[#262626] rounded-full border-r border-b border-white/5 shadow-sm" />
                        <div className="absolute -bottom-[8px] left-[10%] w-1.5 h-1.5 bg-[#262626] rounded-full border border-white/5 shadow-sm" />
                      </div>
                    </div>
                  )}

                  <div className={`w-[72px] h-[72px] rounded-full border border-white/10 overflow-hidden bg-[#121212] ${isPlusNote ? 'p-[2px] bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2f55a4]' : ''}`}>
                    {isPlusNote ? (
                      <div className="bg-black rounded-full w-full h-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">+12</span>
                      </div>
                    ) : (
                      <img
                        src={(() => {
                          const storyIndices = [4, 8, 10, 2];
                          const idx = storyIndices[i];
                          return (stories && stories[idx]?.img)
                            ? stories[idx].img
                            : `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${(i * 13 + 7) % 99}.jpg`;
                        })()}
                        className="w-full h-full object-cover grayscale-[10%] blur-[4px] opacity-90"
                        alt={item.name}
                      />
                    )}
                  </div>
                </div>
                <span className="text-[12px] text-gray-400 font-medium truncate w-[78px] text-center blur-[3px]">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>


        <div className="px-4 py-2.5 flex items-baseline justify-between transition-all">
          <span className="text-[17px] font-bold text-white">Mensagens</span>
          <span className="text-[15px] font-normal text-[#0095f6] cursor-pointer" onClick={() => triggerVipModal("Solicitações", "Veja solicitações com o acesso completo.")}>Pedidos (4)</span>
        </div>

        {/* Message List */}
        <div className="flex flex-col perf-gpu perf-scroll">
          {(() => {
            // 📸 Specific photos requested by user
            const STALKER_FIRST_PHOTO = "https://i.pinimg.com/736x/fb/ef/98/fbef980b2a17b14e92a27436ce172cab.jpg";
            const FAKE_PHOTOS = [
              "https://i.pinimg.com/736x/7f/8e/5d/7f8e5de046a816dcb91feffbcd84d42f.jpg",
              "https://i.pinimg.com/736x/4a/3b/6f/4a3b6f291194f7ddedd3c1c2a66bd0c4.jpg",
              "https://i.pinimg.com/736x/01/00/3c/01003c87b4adf0d0a54683c4f1ca45d2.jpg"
            ];

            // 1. Determine first stalker (top of list)
            const stalkerName = notificationStalker?.name || "J****";
            const firstMessage = {
              name: stalkerName.substring(0, 1) + "****",
              text: localStorage.getItem('stalkea_msg1_shown') === 'true' && notificationMessage ? notificationMessage : "Oi sumido, quanto tempo! Vi que você postou aquele story ontem e fiquei pensando...",
              unread: true,
              online: true,
              img: STALKER_FIRST_PHOTO,
              isStalker: true
            };

            // 2. Determine pool for other messages using specific indices (3, 6, 11) as requested
            const getSpecificProfile = (storyIndex: number, fallbackIdx: number) => {
              const s = stories[storyIndex];
              if (s) {
                return {
                  name: (s.name || "u****").substring(0, 1) + "****",
                  img: s.img || FAKE_PHOTOS[fallbackIdx % FAKE_PHOTOS.length]
                };
              }
              return { name: "u****", img: FAKE_PHOTOS[fallbackIdx % FAKE_PHOTOS.length] };
            };

            const person2 = getSpecificProfile(3, 0); // 3º story
            const person3 = getSpecificProfile(6, 1); // 6º story
            const person4 = getSpecificProfile(11, 2); // 11º story

            // 3. Assemble the list
            const finalMessages = [
              firstMessage, // Index 0: Primary Stalker (Unlocked)
              { name: person2.name, text: "Curtiu seu story", unread: true, online: false, img: person2.img, isLocked: true }, // Index 1: Lock added
              { name: person3.name, text: "Reagiu ❤️ à sua mensagem", unread: false, online: false, img: person3.img, isLocked: true }, // Index 2: Lock added
              { name: person4.name, text: "Você enviou uma foto", unread: false, online: false, img: person4.img, isLocked: true },      // Index 3: Lock added
              { name: "R******", text: "Nossa, você viu o que ela postou? Não acredito...", unread: true, online: false, img: FAKE_PHOTOS[2], isLocked: true }, // Index 4: "Quinto" (Locked)
              { name: "A****", text: "Enviou um áudio", unread: false, online: false, img: `https://randomuser.me/api/portraits/women/${45}.jpg`, isLocked: true }, // Index 5: "Sexto" (Locked)
              { name: "M*****", text: "Gostei muito daquela foto!", unread: false, online: false, img: `https://randomuser.me/api/portraits/men/${22}.jpg`, isLocked: true },
              { name: "K*****", text: "Me manda o link depois?", unread: true, online: true, img: `https://randomuser.me/api/portraits/women/${31}.jpg`, isLocked: true }
            ];

            return finalMessages.map((msg: any, i) => (
              <div
                key={i}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer active:bg-white/[0.04] perf-contain"
                onClick={() => triggerVipModal("Conversa Privada", `Desbloqueie para ver a conversa.`)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-[56px] h-[56px] rounded-full overflow-hidden bg-[#1a1a1a]">
                      <img
                        src={msg.img}
                        className={`w-full h-full object-cover blur-[3.5px] opacity-90 ${msg.isLocked ? 'brightness-[0.3]' : ''}`}
                        alt=""
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${msg.name}&background=random&color=fff`;
                        }}
                      />
                      {msg.isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Lock size={16} className="text-white opacity-80" />
                        </div>
                      )}
                    </div>
                    {msg.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#45bd62] rounded-full border-[2.5px] border-black"></div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-[15px] font-normal text-white blur-[3px]">
                      {msg.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] text-gray-400 truncate blur-[6px]">
                        {msg.text}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                    {(() => {
                      // Indices for grey cameras matching the requested "unas 3 cinzas" and "deixe o 4 cinza"
                      const isGrey = [1, 3, 4, 6].includes(i);
                      const camColor = isGrey ? "#8e8e8e" : "#F9F9F9";
                      return (
                        <svg aria-label="Câmera" fill={camColor} height="20" role="img" viewBox="0 0 66 66" width="20">
                          <path fillRule="evenodd" clipRule="evenodd" d="M24.743 0.806959C22.974 1.01696 20.854 2.54296 18.826 5.06696C16.383 8.10696 14.966 9.00096 12.583 9.00396C10.887 9.00596 8.01 9.91596 6.19 11.026C0.838 14.289 0 17.748 0 36.582C0 51.783 0.187 53.561 2.159 57.069C5.68 63.333 8.651 64 33.052 64C55.815 64 58.402 63.529 63 58.551C65.45 55.898 65.506 55.477 65.811 37.491C66.071 22.148 65.858 18.626 64.513 16.024C62.544 12.217 57.524 9.00896 53.527 9.00396C51.336 9.00096 49.627 7.96696 47.027 5.07196C43.551 1.19996 43.384 1.13796 35.5 0.811961C31.1 0.629961 26.259 0.627959 24.743 0.806959ZM43.216 9.57496C44.622 12.66 48.789 15 52.878 15C54.903 15 56.518 15.843 57.927 17.635C59.831 20.055 60 21.594 60 36.524C60 59.297 62.313 57.5 33.052 57.5C3.655 57.5 6 59.35 6 36.204C6 20.562 6.122 19.499 8.174 17.314C9.469 15.936 11.511 15 13.224 15C17.15 15 21.289 12.696 22.954 9.58496C24.282 7.10396 24.693 6.99996 33.19 6.99996C41.731 6.99996 42.084 7.09096 43.216 9.57496ZM27 19.722C15.76 23.945 13.183 40.493 22.611 47.908C30.698 54.27 42.974 51.753 47.612 42.783C51.201 35.844 48.564 25.701 42.015 21.25C38.771 19.046 30.925 18.247 27 19.722ZM40.077 27.923C46.612 34.459 42.201 45.273 33 45.273C23.799 45.273 19.388 34.459 25.923 27.923C30.039 23.807 35.961 23.807 40.077 27.923Z" fill={camColor}></path>
                        </svg>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))
          })()}


          {/* VIP Stimulus Footer for DM - Positioned after 6th message */}
          <div className="flex flex-col items-center px-4 py-5 gap-4 pb-20">
            {/* Hidden Messages Badge */}
            <div className="bg-black/80 px-4 py-2 rounded-full border border-white/10 shadow-lg backdrop-blur-md flex items-center justify-center">
              <span className="text-white text-xs font-black flex items-center gap-2 tracking-tight">
                <Lock size={12} className="text-white" />
                +87 MENSAGENS OCULTAS
              </span>
            </div>

            {/* Red Warning Alert */}
            <div className="w-full bg-[#3d0000]/30 border border-[#ff3b3b]/30 rounded-[18px] p-5 flex items-start gap-3.5 shadow-[0_4px_20px_rgba(255,0,0,0.1)]">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full border border-[#ff3b3b] flex items-center justify-center">
                <span className="text-[#ff3b3b] text-[12px] font-bold italic">i</span>
              </div>
              <p className="text-[#ff3b3b] text-[13.5px] leading-[1.4] font-medium tracking-tight">
                Somente algumas conversas estão disponíveis para visualização, adquira o plano VIP do Stalkea.ai para liberar todos os directs e visualizar mensagens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Generate notifications based on stories (API data) to ensure consistency with the feed/stories bar
  // MEMOIZED to prevent asterisk flickering on re-renders
  const activeNotifications = useMemo(() => {
    // Lista de usuários censurados extras solicitados
    const extraCensoredUsers = EXTRA_CENSORED_USERS;

    // Total count: Limit to a realistic amount (Total of 15 notifications)
    const totalCount = 15;

    return Array.from({ length: totalCount }).map((_, i) => {
      // Exclude index 0 (Target/User) from notifications pool
      const pool = stories.slice(1);
      if (pool.length === 0) return { action: 'curtiu sua foto.', daysAgo: 0, user: 'user' };

      const storyIndex = (i + Math.floor(Math.random() * 5)) % pool.length;
      const storyUser = pool[storyIndex] || { name: `user_${i}`, img: null };

      const nextStoryIndex = (storyIndex + 1 + Math.floor(Math.random() * 3)) % pool.length;
      const nextStory = pool[nextStoryIndex] || storyUser;

      // Helper to format dynamic recent dates (Portuguese)
      const formatRelativeTime = (daysAgo: number) => {
        if (daysAgo === 0) return `${Math.floor(Math.random() * 12) + 1} h`;
        if (daysAgo < 7) return `${daysAgo} d`;

        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const day = date.getDate().toString().padStart(2, '0');
        const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        return `${day} de ${months[date.getMonth()]}`;
      };

      const followBackTemplate = { action: 'começou a seguir você.', daysAgo: 0, showFollow: true };

      // Copy exata da screenshot do usuário
      const screenshotTemplates = [
        { action: 'curtiu seu comentário: Delíciaaaa 😍', daysAgo: 0, hasLock: true, customTime: '48 min' },
        { action: 'começou a seguir você.', daysAgo: 1, showFollow: true, isFollowing: true, customTime: '9 h' },
        { action: 'começou a seguir você.', daysAgo: 1, showFollow: true, isFollowing: true, customTime: '12 h' },
        { action: 'e outras 1 pessoas estão no app Meta AI. Junte-se a elas agora.', daysAgo: 1, type: 'meta_ai', customTime: '16 h', hasExtra: true },
        { action: 'Nova sugestão para seguir:', detail: '_bru*******', daysAgo: 2, showFollow: true, hasLock: true, customTime: '1 d' },
        { action: 'e outras 3 pessoas curtiram seu comentário: Pegava muito', daysAgo: 2, hasImage: true, hasExtra: true, customTime: '1 d' },
        { action: 'começou a seguir você.', daysAgo: 3, showFollow: true, isFollowing: true, customTime: '2 d' },
        { action: 'adicionou 2 novos stories.', daysAgo: 4, hasImage: true, customTime: '3 d' },
        { action: 'Nova sugestão para seguir:', detail: 'Lua*******', daysAgo: 6, showFollow: true, hasLock: true, customTime: '5 d' },
        { action: 'começou a seguir você.', daysAgo: 6, showFollow: true, isFollowing: false, customTime: '6 d' },
        { action: 'começou a seguir você.', daysAgo: 7, showFollow: true, isFollowing: true, customTime: '6 d' },
      ];

      const otherTemplates = [
        { action: 'curtiu sua foto.', daysAgo: 8, hasImage: true },
        { action: 'curtiu seu vídeo.', daysAgo: 10, hasImage: true },
        { action: 'reagiu ao seu story:', detail: '🔥', daysAgo: 12, hasImage: true },
        { action: 'mencionou você em um story.', daysAgo: 15, hasImage: true },
        { action: 'comentou na sua foto:', detail: '"Que foto incrível 😍"', daysAgo: 20, hasImage: true },
        { action: 'curtiu seu comentário.', daysAgo: 25, hasImage: false },
        { action: 'enviou uma solicitação de mensagem.', daysAgo: 30, hasImage: false },
      ];

      let template;
      if (i < screenshotTemplates.length) {
        template = screenshotTemplates[i];
      } else {
        template = otherTemplates[(i - screenshotTemplates.length) % otherTemplates.length];
      }

      let adjustedDaysAgo = template.daysAgo;

      // Determine if "Following" (Seguindo) instead of "Follow Back"
      let isFollowing = template.isFollowing || false;

      // Completely mask the name with asterisks as requested, but with variable length for realism
      const getMask = () => '*'.repeat(Math.floor(Math.random() * 9) + 6); // 6 to 14 asterisks

      let fullyMaskedName;

      // Use the specific censored list if available for this index
      if (i < extraCensoredUsers.length) {
        fullyMaskedName = extraCensoredUsers[i];
      } else {
        fullyMaskedName = getMask();
      }

      const extraMaskedName = getMask();

      return {
        ...template,
        isFollowing,
        time: template.customTime || formatRelativeTime(adjustedDaysAgo),
        rawDaysAgo: adjustedDaysAgo,
        user: fullyMaskedName,
        fullUser: storyUser.name,
        storyImg: storyUser.img,
        extraImg: template.hasExtra ? nextStory.img : undefined,
        extra: template.hasExtra ? extraMaskedName : undefined,
        fullExtra: template.hasExtra ? nextStory.name : undefined
      };
    });
  }, [stories, username]);

  // NOTIFICATIONS PAGE - INSTAGRAM STYLE (CENSORED)
  const renderNotifications = () => {
    const getPublicPersonAvatar = (seed: string) => {
      const s = seed || 'user';
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
      }
      const idx = hash % 100;
      const gender = hash % 2 === 0 ? 'men' : 'women';
      return `https://randomuser.me/api/portraits/${gender}/${idx}.jpg`;
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      // Detect if user is near bottom
      const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (isAtBottom) {
        // Trigger modal with 1 second delay
        const timer = setTimeout(() => {
          triggerVipModal("Mais Notificações", "Desbloqueie o acesso completo para ver todas as notificações e interações do perfil alvo.");
        }, 1000);
        // Clear timeout if component unmounts or user scrolls away (optional, but good practice usually involves state to avoid multiple triggers)
        // For simplicity here, we just let it trigger. Ideally we should debounce or flag it.
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex flex-col font-sans bg-black overflow-y-auto no-scrollbar perf-scroll perf-gpu"
        onScroll={handleScroll}
      >
        {/* Header */}
        <div className="sticky top-0 bg-black z-50 px-4 py-4 flex items-center justify-center border-b border-white/5 relative">
          <div className="cursor-pointer z-30 absolute left-4" onClick={() => setCurrentTab('feed')}>
            <svg aria-label="Voltar" color="white" fill="white" height="24" role="img" viewBox="0 0 24 24" width="24">
              <path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z" transform="rotate(-90 12 12)"></path>
            </svg>
          </div>
          <span className="text-[20px] font-bold text-white">Notificações</span>
        </div>

        <div className="px-4 pb-32">
          {/* Follow Requests Section */}
          <div className="flex items-center justify-between py-4 mb-2 cursor-pointer active:bg-white/5 relative z-0" onClick={() => triggerVipModal("Solicitações de Seguir", "Veja quem quer seguir você com o acesso completo.")}>
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute top-0 right-0 w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-gray-800 z-10">
                  <img
                    src={followRequests.img1}
                    className="w-full h-full object-cover blur-[2px] scale-110"
                    alt=""
                  />
                </div>
                <div className="absolute bottom-0 left-0 w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-gray-800">
                  <img
                    src={followRequests.img2}
                    className="w-full h-full object-cover blur-[2px] scale-110"
                    alt=""
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-[15px]">Solicitações para seguir</span>
                <span className="text-gray-400 text-[13px] filter blur-[4.5px]">
                  {followRequests.name} + outras 6 solicitações
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0095f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          <div className="h-[1px] bg-white/10 mb-2"></div>

          <div className="relative">
            {/* Blur Gradient Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-40 z-10 bg-gradient-to-t from-black to-transparent pointer-events-none flex items-end justify-center pb-8">
              <div className="bg-black/80 px-4 py-2 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
                <span className="text-white text-xs font-medium flex items-center gap-2">
                  <Lock size={12} />
                  +99 Notificações Ocultas
                </span>
              </div>
            </div>

            {(() => {
              const grouped = {
                'Hoje': [] as any[],
                'Ontem': [] as any[],
                'Últimos 7 dias': [] as any[]
              };

              activeNotifications.forEach((notif) => {
                if (notif.rawDaysAgo === 0) {
                  grouped['Hoje'].push(notif);
                } else if (notif.rawDaysAgo === 1) {
                  grouped['Ontem'].push(notif);
                } else {
                  grouped['Últimos 7 dias'].push(notif);
                }
              });

              return Object.entries(grouped).map(([label, notifs]) => (
                notifs.length > 0 && (
                  <div key={label}>
                    <h3 className="text-white font-bold text-[16px] mt-6 mb-4">{label}</h3>
                    {notifs.map((notif, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 py-2.5 cursor-pointer active:bg-white/5 perf-contain"
                        onClick={() => triggerVipModal("Notificação Bloqueada", `Desbloqueie para ver detalhes da interação de ${maskNamePercent(notif.user, 40)} com o acesso completo.`)}
                      >
                        {/* Avatar */}
                        {(() => {
                          const isCensored = true;
                          const idx = activeNotifications.indexOf(notif);
                          // Use story photo for every second notification to balance realism
                          const useStoryPhoto = (idx % 2 === 0) && notif.storyImg;
                          const seed = `${notif.user || 'user'}_${notif.rawDaysAgo || 0}_${idx}`;
                          const imgSrc = useStoryPhoto ? notif.storyImg : getPublicPersonAvatar(seed);

                          return (
                            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-white/10 relative bg-black">
                              <img
                                src={imgSrc}
                                loading="lazy" decoding="async"
                                className={`w-full h-full object-cover filter blur-[10px] brightness-75 contrast-125 scale-125 opacity-80`}
                                alt=""
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Lock size={14} className="text-white opacity-90" />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] leading-snug">
                            {/* Display pre-masked user directly */}
                            <span className="text-white font-semibold filter blur-[3.5px] select-none">@{notif.user}</span>
                            {notif.extra && (
                              <>
                                <span className="text-white"> e </span>
                                <span className="text-white font-semibold filter blur-[3.5px] select-none">@{notif.extra}</span>
                              </>
                            )}
                            {notif.extraCount && <span className="text-white"> {notif.extraCount}</span>}
                            <span className="text-white">
                              {(() => {
                                const keywords = ['Delíciaaaa 😍', 'Pegava muito', '🔥', '😱'];
                                const found = keywords.find(k => notif.action.includes(k));
                                if (found) {
                                  const parts = notif.action.split(found);
                                  return (
                                    <>
                                      {parts[0]}
                                      <span className="filter blur-[5px] select-none">{found}</span>
                                      {parts[1]}
                                    </>
                                  );
                                }
                                return notif.action;
                              })()}
                            </span>
                            {notif.detail && <span className="text-white text-white/70 filter blur-[3px]"> {notif.detail}</span>}
                          </p>
                        </div>

                        {/* Follow Button or Image */}
                        {notif.showFollow ? (
                          notif.isFollowing ? (
                            <button
                              className="bg-[#262626] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg shrink-0 border border-white/10"
                              onClick={(e) => { e.stopPropagation(); triggerVipModal("Deixar de Seguir", "Gerencie quem você segue com o acesso completo."); }}
                            >
                              Seguindo
                            </button>
                          ) : (
                            <button
                              className="bg-[#0095f6] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg shrink-0"
                              onClick={(e) => { e.stopPropagation(); triggerVipModal("Seguir de Volta", "Siga de volta de forma anÃ´nima com o acesso completo."); }}
                            >
                              Seguir de volta
                            </button>
                          )
                        ) : notif.hasImage ? (
                          <div className="w-11 h-11 rounded-md overflow-hidden shrink-0 border border-white/10 bg-[#121212] relative">
                            <img
                              src={(() => {
                                const NOTIF_THUMBNAILS = [
                                  "https://i.pinimg.com/736x/08/bd/cf/08bdcf9c344fbec90e5694b3edd15a38.jpg",
                                  "https://i.pinimg.com/736x/8a/fd/5f/8afd5f805eb100cdcce7706d9cde9baf.jpg",
                                  "https://i.pinimg.com/736x/a4/c1/21/a4c1217ff677b0c4d0b7b0b0153cc819.jpg",
                                  "https://i.pinimg.com/1200x/43/5a/f3/435af36b3935e3e484f8749a68ab184b.jpg",
                                  "https://i.pinimg.com/736x/57/02/18/570218dbb391a3393260512bb7a47f61.jpg",
                                  "https://i.pinimg.com/736x/95/62/10/95621003a65e5dfa533e0d5caf2166e5.jpg"
                                ];
                                return NOTIF_THUMBNAILS[activeNotifications.indexOf(notif) % NOTIF_THUMBNAILS.length];
                              })()}
                              className="w-full h-full object-cover filter blur-[6px] brightness-[0.6] scale-110 opacity-85"
                              alt="Conteúdo Oculto"
                            />
                          </div>
                        ) : notif.type === 'meta_ai' ? (
                          <button
                            className="bg-[#4c4cf1] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg shrink-0 active:scale-95 transition-all"
                            onClick={(e) => { e.stopPropagation(); triggerVipModal("Meta AI", "Experimente a inteligência artificial da Meta com o acesso VIP."); }}
                          >
                            Testar
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )
              ));
            })()}
          </div>

          {/* WARNING BLOCK - END OF NOTIFICATIONS */}
          <div className="mt-6 mb-8 bg-[#1a0505] border border-[#ff3b30]/40 rounded-xl p-4 flex items-start gap-3 shadow-[0_0_15px_rgba(255,59,48,0.1)]">
            <div className="shrink-0 mt-0.5">
              <div className="w-5 h-5 rounded-full border-[1.5px] border-[#ff3b30] flex items-center justify-center">
                <span className="text-[#ff3b30] text-[11px] font-bold font-serif italic">i</span>
              </div>
            </div>
            <p className="text-[#ff3b30] text-[13px] leading-snug font-medium">
              Somente algumas notificações estão disponíveis para visualização, adquira o plano VIP do Stalkea.ai para liberar todas as atividades.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // PREMIUM CYBER-VIP MODAL OVERHAUL
  const renderVipModal = () => {
    if (!showVipModal) return null;

    return (
      <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-6 text-center font-sans">
        {/* Background do Modal - Blur Escuro */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setShowVipModal(false)} />

        {/* Wrapper for Entrance Animation */}
        <div className="animate-scale-in w-[280px] z-10">
          <div className="relative w-full p-[2px] rounded-[22px] bg-[conic-gradient(from_180deg_at_50%_50%,#eab308_0%,#facc15_50%,#eab308_100%)] shadow-[0_0_90px_rgba(234,179,8,0.45)] animate-border-pulse">
            <div className="relative w-full h-[260px] bg-[#1a1202] rounded-[20px] p-4 overflow-hidden animate-pulse-modal flex flex-col items-center justify-center">

              {/* Botão X para fechar */}
              <button
                onClick={() => setShowVipModal(false)}
                className="absolute top-3 right-3 z-50 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all border border-white/10"
                aria-label="Fechar"
              >
                <X size={14} className="text-white/70" />
              </button>

              <style>{`
            @keyframes scale-in {
              0% { transform: scale(0.9); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-scale-in {
              animation: scale-in 0.3s ease-out forwards;
            }
            @keyframes pulse-modal {
               0%, 100% { transform: scale(1); }
               50% { transform: scale(1.02); }
            }
            .animate-pulse-modal {
               animation: pulse-modal 1.4s infinite ease-in-out;
            }
            @keyframes pulse-button {
              0%, 100% { transform: scale(1); box-shadow: 0 0 25px rgba(251,191,36,0.6); }
              50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(251,191,36,0.8); }
            }
            .animate-pulse-button {
              animation: pulse-button 1.5s infinite ease-in-out;
            }
            @keyframes text-shimmer {
              0% { background-position: 200% center; }
              100% { background-position: -200% center; }
            }
            .animate-text-shimmer {
              animation: text-shimmer 3s linear infinite;
            }
            @keyframes border-pulse {
              0%, 100% { box-shadow: 0 0 90px rgba(251,191,36,0.45); }
              50% { box-shadow: 0 0 120px rgba(251,191,36,0.7); }
            }
            .animate-border-pulse {
              animation: border-pulse 1.6s infinite ease-in-out;
            }
          `}</style>

              <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] via-[#181818] to-[#0a0a0a] z-0" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay z-0"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)] z-0"></div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/10 rounded-full blur-[1px]" />

              {/* Content Wrapper */}
              <div className="relative z-10 flex flex-col items-center w-full text-center">

                <div className="w-full flex flex-col items-center">
                  <h3 className="animate-text-shimmer bg-[linear-gradient(to_right,#fbbf24,#ffffff,#f59e0b,#fbbf24)] bg-[length:200%_auto] bg-clip-text text-transparent font-[900] text-[20px] mb-1 uppercase italic tracking-tighter leading-none drop-shadow-sm pr-2">
                    {vipModalContent.title || "VISUALIZAR STORY"}
                  </h3>

                  <p className="text-white/90 text-[11.5px] font-medium leading-tight px-1 drop-shadow-md text-center mb-1">
                    {(() => {
                      const text = vipModalContent.subtitle || `Assista aos stories de ${maskNamePercent(username, 40)} de forma 100% anônima com o acesso completo.`;
                      // Blur any emojis in the subtitle as requested ("blur nele tbm")
                      return (
                        <>
                          {text.split(/([🔒😍🔥😱])/g).map((part, i) => (
                            /[🔒😍🔥😱]/.test(part)
                              ? <span key={i} className="filter blur-[4px] opacity-70 select-none mx-0.5">{part}</span>
                              : part
                          ))}
                        </>
                      );
                    })()}
                  </p>

                  <button
                    onClick={onNext}
                    className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-[#b45309] via-[#f59e0b] to-[#fbbf24] text-white text-[13.5px] font-black uppercase italic tracking-wider shadow-[0_0_26px_rgba(251,191,36,0.5)] border border-white/10 hover:border-white/25 active:scale-[0.98] transition-all relative overflow-hidden group animate-pulse-button"
                  >
                    <span className="relative z-10">ADQUIRIR ACESSO COMPLETO</span>
                    <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></span>
                  </button>

                  <p className="text-white/30 text-[10.5px] font-medium tracking-wide uppercase mt-2">
                    Conteúdo restrito
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // OPTIONS MENU (Action Sheet) - NATIVE INSTAGRAM STYLE (DARK MODE)
  const renderOptionsMenu = () => {
    if (!activeOptionPostId) return null;

    const options = [
      { label: 'Denunciar', red: true },
      { label: 'Deixar de seguir', red: true },
      { label: 'Adicionar aos Favoritos' },
      { label: 'Ir para o post' },
      { label: 'Compartilhar' },
      { label: 'Copiar link' },
      { label: 'Incorporar' },
      { label: 'Sobre essa conta' },
    ];

    return (
      <div className="fixed inset-0 z-[2000] flex flex-col justify-end font-sans animate-fade-in p-0 pb-0 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        {/* Backdrop - Dynamic Opacity */}
        <div
          className="absolute inset-0 bg-black/70"
          onClick={() => setActiveOptionPostId(null)}
        />

        {/* Menu Content - Dark Card (IG Native Dark Mode) */}
        <div className="relative bg-[#262626] rounded-t-[12px] overflow-hidden animate-slide-up pb-8 pt-1">
          {/* Handle bar - Native Size */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 mt-2" />

          <div className="flex flex-col">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveOptionPostId(null);
                  triggerVipModal(opt.label, `A ação "${opt.label}" está disponível no acesso completo.`);
                }}
                className={`w-full py-[14px] px-6 text-[16px] flex items-center justify-center border-t border-white/10 first:border-0 active:bg-white/5 transition-colors ${opt.red ? 'text-[#ed4956] font-bold' : 'text-[#f5f5f5] font-normal'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveOptionPostId(null)}
            className="w-full py-4.5 text-[16px] font-normal text-[#f5f5f5] border-t border-white/10 active:bg-white/5"
          >
            Cancelar
          </button>
        </div>

        <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.25s cubic-bezier(0.1, 0.9, 0.2, 1);
          }
        `}</style>
      </div>
    );
  };

  // Scroll Optimization
  const lastScrollTriggerRef = useRef(0);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      lastScrollTriggerRef.current = parseInt(sessionStorage.getItem('last_vip_scroll_trigger') || '0');
    }
  }, []);

  // Scroll & Trigger Controls moved to top to prevent hook error
  return (
    <>
      <div
        className="fixed inset-0 bg-black text-white font-sans max-w-[500px] mx-auto overflow-y-auto overflow-x-hidden no-scrollbar pb-[180px] z-[250] perf-scroll perf-gpu"
        onScroll={(e) => {
          // Fallback for internal div scroll if fixed position prevents window scroll
          const target = e.currentTarget;
          const scrollY = target.scrollTop;
          const triggerThreshold = 3000; // ~5 posts (600px each)

          // Optimized: Read from ref instead of sessionStorage every frame
          if (scrollY > lastScrollTriggerRef.current + triggerThreshold) {
            triggerVipModal("Aviso", "Desbloqueie o acesso completo para continuar navegando.");
            lastScrollTriggerRef.current = scrollY;
            sessionStorage.setItem('last_vip_scroll_trigger', scrollY.toString());
          }
        }}>

        {/* Header Instagram Style - Hidden on notifications tab */}
        {currentTab !== 'notifications' && currentTab !== 'messages' && (
          <header className={`sticky top-0 z-50 bg-black px-4 py-3 flex items-center justify-between ${currentTab === 'reels' ? 'bg-transparent absolute w-full' : ''}`}>
            <div className="flex items-center gap-4">
              {currentTab === 'reels' ? (
                <span className="font-bold text-xl text-white drop-shadow-md">Reels</span>
              ) : (
                <img
                  src="/instagram-logo.svg"
                  className="h-8 invert object-contain active:scale-95 transition-all"
                  alt="Instagram"
                  onClick={() => window.location.reload()}
                />
              )}
            </div>
            <div className="flex items-center gap-5">
              <div
                className={`relative cursor-pointer`}
                onClick={() => {
                  if (onEvent) onEvent({ eventName: 'click_notifications_icon' });
                  if (isNotificationsExpired) {
                    triggerVipModal("Acesso Expirado", "Seu tempo de preview das notificações acabou. Desbloqueie o acesso completo, tudo sem blur/censura.");
                    return;
                  }
                  if (hasAnyRealData) {
                    setCurrentTab('notifications');
                  } else {
                    triggerVipModal("Ver Atividades", "Descubra quem curtiu os posts e stories do alvo, além de ver novas notificações em tempo real com o acesso completo.");
                  }
                }}
              >
                <Icons.Heart />
                {hasAnyRealData && (
                  <div className="absolute top-0.5 -right-0.5 w-[9px] h-[9px] bg-[#FF3040] rounded-full border border-black shadow-[0_0_5px_rgba(255,48,64,0.5)]" />
                )}
              </div>
              <div className="relative cursor-pointer" onClick={() => triggerVipModal("Mensagens Privadas", "Visualize todas as conversas e mensagens com o acesso completo.")}>
                <Icons.Messenger />
                <div className="absolute -top-1 -right-2 bg-[#FF3040] text-[10px] font-black text-white px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-black shadow-[0_0_8px_rgba(255,48,64,0.4)]">
                  3
                </div>
              </div>
            </div>
          </header>
        )}

        {/* ----------- CURRENT TAB CONTENT ----------- */}

        {currentTab === 'feed' && (
          <div className="animate-fade-in">
            {/* Banner Premium Moderno - Estilo Profissional */}
            <div className="w-full bg-black py-2 pl-4 pr-0 border-y border-white/[0.08] relative z-[40]">
              <div className="flex items-center gap-3">
                {/* Warning Triangle */}
                <svg className="shrink-0 w-7 h-7 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="rgba(250,204,21,0.15)" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div className="flex-1 flex flex-col">
                  <p className="text-gray-300 text-[13px] leading-[1.4] font-normal">
                    <span className="font-black italic animate-text-shimmer bg-[linear-gradient(to_right,#FFD600,white,#FFE500,#FFD600)] bg-[length:400%_auto] bg-clip-text text-transparent">Stories vistos</span> nas ultimas <span className="font-black italic animate-text-shimmer bg-[linear-gradient(to_right,#FFD600,white,#FFE500,#FFD600)] bg-[length:400%_auto] bg-clip-text text-transparent">2 semanas</span> por <span className="font-black italic animate-text-shimmer bg-[linear-gradient(to_right,#FFD600,white,#FFE500,#FFD600)] bg-[length:400%_auto] bg-clip-text text-transparent">@{username}</span>, <span className="font-black italic animate-text-shimmer bg-[linear-gradient(to_right,#FFD600,white,#FFE500,#FFD600)] bg-[length:400%_auto] bg-clip-text text-transparent">Desbloqueie</span> para ver <span className="font-black italic animate-text-shimmer bg-[linear-gradient(to_right,#FFD600,white,#FFE500,#FFD600)] bg-[length:400%_auto] bg-clip-text text-transparent">todos</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Stories Bar */}
            <div className="overflow-x-auto no-scrollbar py-4 px-2 border-b border-[#1a1a1a] transform-gpu" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 110px' }}>
              <div className="flex gap-4 min-w-max perf-gpu">
                {/* Stories de Terceiros */}
                {stories.map((story, idx) => (
                  <div key={story.id} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => {
                    if (onEvent) onEvent({ eventName: 'story_click', storyUser: story.name, storyIndex: idx });
                    triggerVipModal("Visualizar Story", `Assista aos stories de ${maskNamePercent(story.name, 40)} de forma 100% anônima com o acesso completo. 🔒`);
                  }}>
                    {/* Avatar Ring */}
                    <div className={`
                relative rounded-full p-[3px]
                ${idx === 0
                        ? 'bg-transparent' // Remove ring for "Seu story"
                        : story.isCloseFriends
                          ? 'bg-[#70C050]'
                          : story.isLocked
                            ? 'bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2f55a4]' // Standard Instagram Gradient for locked too
                            : 'bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2f55a4]'}
              `}>
                      <div className="bg-black rounded-full border-[3px] border-black overflow-hidden w-[68px] h-[68px] flex items-center justify-center">
                        {story.img ? (
                          <div className="relative w-full h-full overflow-hidden rounded-full">
                            <img
                              src={story.img}
                              className={`w-full h-full object-cover ${story.isLocked ? 'blur-[2px] opacity-70 scale-110' : ''}`}
                              alt={story.name}
                            />
                            {story.isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Lock size={20} className="text-white drop-shadow-lg" strokeWidth={2.5} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full bg-[#333] opacity-80 flex items-center justify-center">
                            <Lock className="text-white/40 w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Username */}
                    <span className="text-[11px] text-white truncate w-[74px] text-center mt-1">
                      {idx === 0 ? "Seu story" : (story.isExtra ? story.name : maskNamePercent(story.name, 40))}
                    </span>

                  </div>
                ))}

                {/* extra stories indicator */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => triggerVipModal("Stories Ocultos", "Existem mais 39 stories arquivados de outros contatos que o alvo interagiu recentemente. Desbloqueie o acesso VIP para ver todos.")}>
                  <div className="relative rounded-full p-[3px] bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2f55a4]">
                    <div className="bg-black rounded-full border-[3px] border-black overflow-hidden w-[68px] h-[68px] flex items-center justify-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-white font-bold text-lg">+39</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="flex flex-col gap-0 pb-10">
              {posts.map((post, idx) => {
                const postId = post.id;
                const isLiked = likedPosts.has(postId);
                const isSaved = savedPosts.has(postId);
                const isPostPrivate = false;
                const isContentCensored = !post.img && !post.videoUrl;

                // Calculate display likes (base + 1 if liked by user)
                const displayLikes = (post.likes || 0) + (isLiked ? 1 : 0);

                // OTIMIZAÃ‡ÃƒO: Prioridade de carregamento para os primeiros posts
                const isPriority = idx < 2;

                return (
                  <React.Fragment key={postId}>
                    {/* Trigger VIP Modal after 4 posts (index 3) */}
                    {idx === 4 && (
                      <div ref={feedObserverRef} className="h-1 w-full" />
                    )}
                    <div className="animate-fade-in feed-post-item transform-gpu overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 600px' }} data-post-index={idx}>
                      <div className="flex items-center justify-between px-3 py-3">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                          if (onEvent) onEvent({ eventName: 'feed_profile_click', postUser: post.username, postIndex: idx });
                          triggerVipModal("Visualizar Perfil", "Para visualizar o perfil completo e outras publicações deste usuário, é necessário o acesso total.");
                        }}>
                          <div className="w-9 h-9 rounded-full border border-white/10 overflow-hidden bg-[#262626]">
                            {post?.authorPic ? (
                              <img
                                src={post.authorPic}
                                loading={isPriority ? "eager" : "lazy"}
                                decoding="async"
                                className={`w-full h-full object-cover ${(post.extremeBlur || !hasAnyRealData || isContentCensored) ? 'blur-[3px] scale-110' : ''}`}
                                alt="Profile"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://ui-avatars.com/api/?name=${post.username}&background=random&color=fff`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-[#333] blur-sm" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="text-[13.5px] font-bold text-white leading-none">
                                {maskNamePercent(post?.username || username, 40)}
                              </span>
                              {post.isVerified && <Icons.Verified />}
                            </div>
                            {post.isFixed && (
                              <span className="text-white/60 text-[12px] mt-0.5">
                                Sugestões para você
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {post.isFixed && (
                            <button
                              className="text-[#0095f6] text-[14px] font-bold mr-1 active:opacity-50"
                              onClick={() => triggerVipModal("Seguir", `Para seguir perfis recomendados é necessário o acesso completo.`)}
                            >
                              Seguir
                            </button>
                          )}
                          <div className="text-white/80 cursor-pointer p-2 -mr-2" onClick={() => setActiveOptionPostId(postId)}>
                            <Icons.More />
                          </div>
                        </div>
                      </div>

                      {/* Post Image/Video or Restricted Content */}
                      <div className="relative aspect-square bg-[#1c1c1c] overflow-hidden">
                        {isContentCensored ? (
                          /* POST CENSORED/RESTRICTED */
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0b0b] gap-2">
                            {/* Ãcone de Cadeado - Minimalista sem círculo */}
                            <div className="mb-1 drop-shadow-2xl">
                              <Lock size={48} className="text-white/90" strokeWidth={1.2} />
                            </div>

                            {/* Texto Limpo - Sem fundo/borda */}
                            <div className="px-2">
                              <span className="text-white/90 font-medium text-[15px] tracking-wide drop-shadow-lg">Conteúdo Exclusivo</span>
                            </div>
                          </div>
                        ) : (
                          /* REAL CONTENT (IMAGE or VIDEO) */
                          post.videoUrl ? (
                            <div className="relative w-full h-full bg-black">
                              <VideoPlayer src={post.videoUrl} poster={post.img} preload={isPriority ? "auto" : "metadata"} />
                            </div>
                          ) : (
                            <img
                              src={post.img}
                              loading={isPriority ? "eager" : "lazy"}
                              decoding="async"
                              className="w-full h-full object-cover"
                              alt=""
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                // Opcional: mostrar um placeholder de erro
                                if (target.parentElement) {
                                  target.parentElement.style.backgroundColor = '#1c1c1c';
                                  target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                  target.parentElement.innerHTML = '<span class="text-white/20 text-xs">Imagem indisponível</span>';
                                }
                              }}
                            />
                          )
                        )}
                        {/* Removed small play icon per USER request */}
                      </div>

                      <div className="px-3 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">

                          <div onClick={() => {
                            if (onEvent) onEvent({ eventName: 'post_like_click', postUser: post.username, postIndex: idx });
                            triggerVipModal("Curtir Publicação", "Para curtir publicações e interagir com o perfil, é necessário o acesso completo.");
                          }} className="cursor-pointer transition-transform active:scale-125 flex items-center gap-1.5">
                            <Icons.Heart filled={isLiked} />
                            <span className="text-white font-semibold text-[13px]">{post.likes ? formatCount(displayLikes) : '12,5 mil'}</span>
                          </div>
                          <div onClick={() => {
                            if (onEvent) onEvent({ eventName: 'post_comment_click', postUser: post.username, postIndex: idx });
                            triggerVipModal("Ver Comentários", "O acesso aos comentários e interações é exclusivo para usuários com acesso completo.");
                          }} className="cursor-pointer transition-opacity active:opacity-60 flex items-center gap-1.5">
                            <Icons.Comment />
                            <span className="text-white font-semibold text-[13px]">{post.comments ? formatCount(post.comments) : '124'}</span>
                          </div>

                          <div onClick={() => {
                            if (onEvent) onEvent({ eventName: 'post_share_click', postUser: post.username, postIndex: idx });
                            triggerVipModal("Enviar Direct", "Envie esta publicação para qualquer contato ou grupo com o acesso completo.");
                          }} className="cursor-pointer transition-opacity active:opacity-60">
                            <Icons.Share />
                          </div>
                        </div>
                        <div onClick={() => {
                          if (onEvent) onEvent({ eventName: 'post_bookmark_click', postUser: post.username, postIndex: idx });
                          triggerVipModal("Salvar Publicação", "Salve posts e crie coleções privadas com o acesso completo.");
                        }} className="cursor-pointer transition-transform active:scale-125">
                          <Icons.Bookmark />
                        </div>
                      </div>

                      <div className="px-3 pb-2 text-[14px]">
                        <p className="text-white">
                          Curtido por <span className="font-bold">{maskNamePercent(LIKE_NAMES[idx % LIKE_NAMES.length], 40)}</span> e <span className="font-bold">outras pessoas</span>
                        </p>
                      </div>

                      {/* Caption Section */}
                      {post.caption && !isContentCensored && (
                        <div className="px-3 pb-2">
                          <p className="text-[13.5px] text-white leading-snug">
                            <span className="font-bold mr-2 cursor-pointer flex items-center gap-0.5 inline-flex" onClick={() => triggerVipModal("Visualizar Perfil", "Para visualizar o perfil completo e outras publicações deste usuário, é necessário o acesso total.")}>
                              {maskNamePercent(post.username, 40)}
                              {post.isVerified && <Icons.Verified />}
                            </span>
                            {post.caption}
                          </p>
                        </div>
                      )}

                      {/* Comentários desativados ou ocultos para limpeza */}
                      <div className="px-3 pb-4">
                        <p className="text-[12px] text-white/40 font-medium cursor-pointer" onClick={() => triggerVipModal("Ver Comentários", "O acesso aos comentários e interações é exclusivo para usuários com acesso completo.")}>
                          Ver todos os comentários
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* WARNING BLOCK - END OF FEED */}
              <div className="mt-4 mb-6 mx-3 bg-[#1a0505] border border-[#ff3b30]/40 rounded-xl p-4 flex items-start gap-3 shadow-[0_0_15px_rgba(255,59,48,0.1)]">
                <div className="shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-[#ff3b30] flex items-center justify-center">
                    <span className="text-[#ff3b30] text-[11px] font-bold font-serif italic">i</span>
                  </div>
                </div>
                <p className="text-[#ff3b30] text-[13px] leading-snug font-medium">
                  Somente alguns posts recentes estão disponíveis para visualização. Desbloqueie o acesso completo para liberar tudo sem limitações.
                </p>
              </div>

            </div>

          </div >
        )}

        {
          currentTab === 'search' && (
            <div className="animate-fade-in relative min-h-[80vh]">

              <div className="grid grid-cols-3 gap-0.5 opacity-30 filter blur-[8px] select-none pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className={`bg-[#1c1c1c] aspect-square ${i % 3 === 0 && i % 4 === 0 ? 'row-span-2 col-span-2' : ''}`}>
                    <img src={`https://picsum.photos/seed/${i + 20}/300/300`} loading="lazy" decoding="async" fetchPriority="low" className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {
          currentTab === 'add' && (
            <div className="animate-fade-in relative h-[80vh] flex flex-col bg-[#1c1c1c]">

              <div className="flex-1 opacity-20 filter blur-[15px] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="h-20 bg-black flex items-center justify-around opacity-20 blur-sm">
                <span className="font-bold text-white uppercase tracking-widest text-xs">Publicar</span>
                <span className="font-bold text-white uppercase tracking-widest text-xs">Story</span>
                <span className="font-bold text-white uppercase tracking-widest text-xs">Reels</span>
              </div>
            </div>
          )
        }

        {
          currentTab === 'reels' && (
            <div className="animate-fade-in relative h-[90vh] bg-[#121212] flex items-center justify-center overflow-hidden">

              <div className="absolute inset-0 opacity-40 filter blur-[10px] pointer-events-none">
                <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Reels" />
              </div>

              {/* Fake Reels UI */}
              <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center opacity-40 blur-[2px]">
                <div className="flex flex-col items-center gap-1"><Icons.Heart /><span className="text-xs font-medium">24K</span></div>
                <div className="flex flex-col items-center gap-1"><Icons.Comment /><span className="text-xs font-medium">358</span></div>
                <div className="flex flex-col items-center gap-1"><Icons.Share /><span className="text-xs font-medium">10K</span></div>
                <Icons.More />
              </div>

              <div className="absolute left-4 bottom-8 flex items-center gap-3 opacity-40 blur-[2px]">
                <div className="w-8 h-8 rounded-full bg-gray-500"></div>
                <div className="flex flex-col gap-1">
                  <div className="w-24 h-3 bg-white/50 rounded"></div>
                  <div className="w-40 h-3 bg-white/50 rounded"></div>
                </div>
              </div>
            </div>
          )
        }



        {/* NOTIFICATIONS TAB */}
        {
          currentTab === 'notifications' && (
            <div className="animate-fade-in relative min-h-[90vh] bg-black">
              {renderNotifications()}
            </div>
          )
        }

        {/* DM TAB */}
        {
          currentTab === 'messages' && (
            <div className="animate-fade-in relative min-h-screen bg-black">
              {renderDMBlocker()}
            </div>
          )
        }

        {/* Profile Tab Blocked Mockup (Triggered by bottom nav click) */}
        {
          currentTab === 'profile_blocked' && (
            <div className="flex flex-col animate-fade-in relative min-h-[90vh] bg-black">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-1.5 opacity-40 blur-[2px]">
                  <span className="font-bold text-lg">{username}</span>
                </div>
                <div className="flex gap-4 opacity-40 blur-[2px]">
                  <Icons.Plus />
                  <Icons.More />
                </div>
              </div>

              {/* Bio Section */}
              <div className="px-4 py-4 flex flex-col gap-4 opacity-40 blur-[5px] pointer-events-none">
                <div className="flex items-center justify-between">
                  <div className="w-20 h-20 rounded-full bg-gray-700"></div>
                  <div className="flex gap-4 text-center">
                    <div><div className="font-bold text-lg">0</div><div className="text-sm">Publicações</div></div>
                    <div><div className="font-bold text-lg">1.2M</div><div className="text-sm">Seguidores</div></div>
                    <div><div className="font-bold text-lg">342</div><div className="text-sm">Seguindo</div></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="w-40 h-4 bg-gray-700 rounded"></div>
                  <div className="w-64 h-3 bg-gray-800 rounded"></div>
                  <div className="w-56 h-3 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          )
        }

        {/* Fake Top Notification - iOS Instagram Banner (Pixel Perfect) */}
        {
          showFakeNotification && !isDismissed && (
            <div
              className={`fixed top-[12px] left-1/2 -translate-x-1/2 w-[95%] max-w-[390px] z-[5000] px-2 transition-transform duration-200 ease-out`}
              style={{
                transform: `translate(-50%, ${currentY}px)`,
                opacity: 1 + (currentY / 100)
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              <div className="bg-[#050505] rounded-[26px] px-3.5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-white/10 animate-ios-banner flex items-center gap-3 touch-none select-none w-full max-w-[370px]">
                {/* Native Circle Avatar */}
                <div className="relative shrink-0">
                  <div className="w-[44px] h-[44px] rounded-full overflow-hidden border border-white/5 relative">
                    <img
                      src={notificationStalker?.img || "https://i.pinimg.com/1200x/7b/e1/fd/7be1fd83faed1840795cd5770ff1174d.jpg"}
                      className="w-full h-full object-cover blur-[12px] opacity-80 scale-110"
                      alt=""
                    />
                  </div>
                  {/* Small IG Badge (Native Style) */}
                  <div className="absolute -bottom-1 -right-1 w-[20px] h-[20px] rounded-full overflow-hidden border-2 border-[#050505]">
                    <img
                      src="https://img.icons8.com/color/144/instagram-new--v1.png"
                      className="w-full h-full object-cover bg-white"
                      alt="IG"
                    />
                  </div>
                </div>

                {/* Native Text Structure */}
                <div className="flex-1 min-w-0 pointer-events-none text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[14px] font-bold text-white/95 filter blur-[4px]">
                      {notificationStalker?.name ? (notificationStalker.name.length > 8 ? notificationStalker.name.substring(0, 8) + '...' : notificationStalker.name) : 'usuario_insta'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] text-white/40">{notificationTime}</span>
                      <div className="w-[8px] h-[8px] bg-[#ff3b30] rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-[14px] leading-tight text-white/80 font-normal line-clamp-2">
                    enviou uma mensagem: {notificationMessage || 'nossa, lembra disso aqui?'}
                  </p>
                </div>
              </div>
            </div>
          )
        }



        <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Performance optimizations for video backgrounds */
        video {
            will-change: transform, opacity;
            backface-visibility: hidden;
            transform: translateZ(0);
        }

        /* Fallback for low-end devices via App.tsx .perf-mode */
        :global(.perf-mode) video {
            display: none !important;
        }
        :global(.perf-mode) [class*="animate-"] {
            animation: none !important;
        }
        
        @keyframes progress-fast {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-progress-fast {
          animation: progress-fast 2s infinite linear;
          background-size: 200% 100%;
        }

        @keyframes pulse-slow {
           0%, 100% { opacity: 0.1; transform: scale(1); }
           50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
           animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes heartbeat {
           0% { transform: scale(1); }
           5% { transform: scale(1.1); }
           10% { transform: scale(1); }
           15% { transform: scale(1.1); }
           20% { transform: scale(1); }
           100% { transform: scale(1); }
        }
        .animate-heartbeat {
           animation: heartbeat 2s ease-in-out infinite;
        }

        /* Aurora Violet Wave for VIP modal */
        .violet-wave { position: absolute; inset: -20%; pointer-events: none; z-index: 0;
          background:
            radial-gradient(60% 60% at 30% 30%, rgba(147,51,234,0.35) 0%, transparent 60%),
            radial-gradient(50% 50% at 70% 60%, rgba(168,85,247,0.28) 0%, transparent 60%),
            conic-gradient(from 180deg at 50% 50%, rgba(147,51,234,0.35), rgba(147,51,234,0), rgba(147,51,234,0.35));
          filter: blur(46px); mix-blend-mode: screen; opacity: 0.95; animation: aurora-wave 8s ease-in-out infinite;
        }
        @keyframes aurora-wave {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.06) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes scale-up-fade {
           0% { transform: scale(0.9); opacity: 0; }
           100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up-fade {
           animation: scale-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes glitch {
          0%, 100% { transform: translate(0); filter: hue-rotate(0deg); }
          20% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); }
          40% { transform: translate(-2px, -2px); filter: hue-rotate(180deg); }
          60% { transform: translate(2px, 2px); filter: hue-rotate(270deg); }
          80% { transform: translate(2px, -2px); filter: hue-rotate(360deg); }
        }
        .logo-glitch {
          animation: glitch 3s infinite;
        }

        @keyframes ios-banner {
           0% { transform: translateY(-120%) scale(0.9); opacity: 0; }
           100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-ios-banner {
           animation: ios-banner 0.6s cubic-bezier(0.16, 1.1, 0.3, 1) forwards;
           will-change: transform, opacity;
        }

        @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }

        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-20deg); }
          30% { transform: translateX(150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        .animate-shine { animation: shine 3.5s infinite ease-in-out; }

        @keyframes equalizer-beat {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }

        @keyframes purple-wave {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(150%) skewX(-12deg); }
        }
        .animate-purple-wave {
          animation: purple-wave 2.8s linear infinite;
        }


        @keyframes purple-liquid-wave {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(150%) skewX(-15deg); }
        }
        .animate-purple-liquid-wave {
          animation: purple-liquid-wave 2s linear infinite;
        }
        @keyframes pulse-warning {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        .animate-pulse-warning {
          animation: pulse-warning 2s ease-in-out infinite;
        }
        @keyframes text-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-text-shimmer {
          animation: text-shimmer 4s linear infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }

        /* 🚀 PERFORMANCE SHIELD CLASSES */
        .perf-gpu {
          backface-visibility: hidden;
          perspective: 1000px;
          transform: translate3d(0,0,0);
          will-change: transform, opacity;
        }
        
        .perf-contain {
          content-visibility: auto;
          contain-intrinsic-size: 1px 500px;
          contain: content;
        }

        .perf-scroll {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          overscroll-behavior-y: contain;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .perf-scroll::-webkit-scrollbar { display: none; }

        .perf-optimize-img {
          image-rendering: -webkit-optimize-contrast;
          content-visibility: auto;
          transform: translateZ(0);
        }

        /* 🚀 High FPS Animation Optimization */
        @keyframes shine-shimmer {
          from { background-position: 200% center; }
          to { background-position: -200% center; }
        }
        .animate-text-shimmer {
          animation: shine-shimmer 3s linear infinite;
          will-change: background-position;
        }

        @media (prefers-reduced-motion: no-preference) {
          .perf-smooth {
            transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease;
          }
        }
        `}</style>
      </div >

      {/* Timer Bar moved OUTSIDE scroll container */}
      < div className="fixed bottom-[74px] left-0 right-0 z-[300] bg-black/60 backdrop-blur-2xl p-4 flex items-center justify-between gap-3 shadow-[0_-4px_30px_rgba(255,255,255,0.05)] rounded-t-[24px] border-t border-white/15 overflow-hidden max-w-[500px] mx-auto ring-1 ring-white/10" >
        {/* CSS BACKGROUND FOR TIMER BAR - GRAPHITE GREY STYLE */}
        < div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#262626] to-black" >
          <div className="absolute inset-0 bg-white/5 z-10 pointer-events-none" />
        </div >

        {/* INTERNAL GLOW - NEUTRAL GREY/WHITE */}
        < div className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-[240px] bg-white/5 blur-[80px] rounded-full pointer-events-none z-0" ></div >

        <div className="flex-1 relative z-10">
          <p className="text-[13px] leading-tight mb-1 animate-text-shimmer bg-[linear-gradient(to_right,#FFD600,white,#FFE500,#FFD600)] bg-[length:400%_auto] bg-clip-text text-transparent font-[900] italic uppercase tracking-tighter">ACESSO TEMPORÁRIO LIBERADO!</p>
          <p className="text-white/80 text-[10px] leading-tight font-medium">
            Você ganhou <span className="font-bold animate-text-shimmer bg-[linear-gradient(to_right,#FFD600,white,#FFE500,#FFD600)] bg-[length:400%_auto] bg-clip-text text-transparent">10 minutos</span> para testar nossa ferramenta, mas para ter o acesso completo, é necessário realizar o <span className="font-bold animate-text-shimmer bg-[linear-gradient(to_right,#FFD600,white,#FFE500,#FFD600)] bg-[length:400%_auto] bg-clip-text text-transparent">desbloqueio</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <span className="text-white font-black text-[18px] tabular-nums mr-1">{formatTime(timeLeft)}</span>
          <button
            onClick={onNext}
            className="relative overflow-hidden w-[130px] h-[44px] text-white text-[10px] font-black uppercase tracking-wide rounded-xl active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/20 group bg-[#333]/40 backdrop-blur-md"
          >
            <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#404040]/40 to-black/60">
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <span className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] flex flex-col items-center justify-center leading-none gap-0.5">
              <span className="animate-text-shimmer bg-[linear-gradient(to_right,#FFD600,white,#FFE500,#FFD600)] bg-[length:400%_auto] bg-clip-text text-transparent font-[900] italic uppercase tracking-tighter">DESBLOQUEAR</span>
              <span className="animate-text-shimmer bg-[linear-gradient(to_right,#FFD600,white,#FFE500,#FFD600)] bg-[length:400%_auto] bg-clip-text text-transparent font-[900] italic uppercase tracking-tighter">ACESSO AGORA</span>
            </span>
          </button>
        </div>
      </div >

      {/* Fixed Bottom Navigation moved OUTSIDE scroll container */}
      < nav className="fixed bottom-0 left-0 right-0 h-[74px] bg-black border-t border-[#1a1a1a] flex items-center justify-around px-2 z-[301] max-w-[500px] mx-auto" >
        <div className="p-2 cursor-pointer" onClick={() => setCurrentTab('feed')}>
          <Icons.Home filled={currentTab === 'feed'} />
        </div>
        <div className="p-2 cursor-pointer opacity-90" onClick={() => triggerVipModal("Pesquisa", "A ação pesquisar está disponível no acesso completo.")}>
          <Icons.Search filled={currentTab === 'search'} />
        </div>
        <div className="p-2 cursor-pointer opacity-90" onClick={() => triggerVipModal("Criar", "A ação criar está disponível no acesso completo.")}>
          <Icons.Add filled={currentTab === 'add'} />
        </div>
        <div className="p-2 cursor-pointer opacity-90" onClick={() => triggerVipModal("reels", "ver os reels está disponível no acesso completo")}>
          <Icons.Reels filled={currentTab === 'reels'} />
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-white/20 p-0.5 overflow-hidden cursor-pointer" onClick={() => triggerVipModal("perfil", "entrar no perfil está disponível no acesso completo.")}>
          <img src={userPic} loading="lazy" decoding="async" className="w-full h-full rounded-full object-cover" alt="P" />
        </div>
      </nav >

      {renderVipModal()}
      {renderOptionsMenu()}
    </>
  );
});

