import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ConfirmationCard } from './components/ConfirmationCard.tsx';
import { InstagramBruteForce } from './components/InstagramBruteForce.tsx';
import { InstagramFeedClone } from './components/InstagramFeedClone.tsx';
import { Cta } from './components/Cta.tsx';
import { StalkeaPayCheckout } from './components/StalkeaPayCheckout.tsx';
import { BlockedAccessModal } from './components/BlockedAccessModal.tsx';
import { WaitingQueue } from './components/WaitingQueue.tsx';
import { PrivacyWarningModal } from './components/PrivacyWarningModal.tsx';

import { EntrandoNoFeed } from './components/EntrandoNoFeed.tsx';
import { fetchInstagramFeed } from './src/utils/instagram.ts';
import { Logger } from './src/utils/logger.ts'; // 🪵 Logger
import { supabase } from './src/lib/supabase.ts'; // ⚡ Supabase Client
import { SupabaseAnalytics } from './components/SupabaseAnalytics.tsx'; // 📈 Advanced Analytics
import { Settings, X, RotateCcw, Shield, ShieldOff, Layers, Zap, ChevronUp, ChevronDown, BarChart3, Code, DollarSign, Bell, Activity } from 'lucide-react';


export type AppStep = 'home' | 'confirm' | 'hacking' | 'feed' | 'cta' | 'checkout' | 'loading' | 'results' | 'waiting' | 'privacy_check';

export interface ProfileData {
  username: string;
  name?: string;
  posts: string;
  followers: string;
  following: string;
  bio: string;
  profilePic: string;
  sources?: any[];
}

const STEP_MAP: Record<string, AppStep> = {
  '': 'home',
  'index.html': 'home',
  'home': 'home',
  'inicio': 'home',
  'confirmar-perfil': 'confirm',
  'analise-segura': 'hacking',
  'feed-secreto': 'feed',
  'relatorio-pronto': 'cta',
  'pagamento-seguro': 'checkout',
  'processando-dados': 'loading',
  'painel-vip': 'results',
  'fila-espera': 'waiting',
  'verificacao-seguranca': 'privacy_check',
  // Legacy support
  'confirme': 'confirm',
  'hacking': 'hacking',
  'feed': 'feed',
  'cta.html': 'cta',
  'checkout': 'checkout',
  'processando': 'loading',
  'dashboard': 'results',
  'aguardando': 'waiting',
  'seguranca': 'privacy_check'
};

const REVERSE_STEP_MAP: Record<AppStep, string> = {
  'home': '',
  'confirm': 'confirmar-perfil',
  'hacking': 'analise-segura',
  'feed': 'feed-secreto',
  'cta': 'relatorio-pronto',
  'checkout': 'pagamento-seguro',
  'loading': 'processando-dados',
  'results': 'painel-vip',
  'waiting': 'fila-espera',
  'privacy_check': 'verificacao-seguranca'
};

// 🖼️ LISTA DE IMAGENS CRÍTICAS PARA PRÉ-CARREGAMENTO (Checkout e VIP)
// 🚀 Reduzir em mobile para economizar RAM e largura de banda
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

const CRITICAL_IMAGES = isMobileDevice ? [
  'https://i.ibb.co/Qvjdd8fY/c56e5d5f-bcc0-4324-bf0f-de9a1e2b3183.png', // Logo StalkeaPay (Nova)
  'https://i.ibb.co/9m6pG513/f85d6e00-b101-4f91-9aff-0f3b3a3f1d09.png', // Logo Stalkea.ai VIP
] : [
  'https://i.ibb.co/Qvjdd8fY/c56e5d5f-bcc0-4324-bf0f-de9a1e2b3183.png', // Logo StalkeaPay (Nova)
  'https://perfectpay-files.s3.us-east-2.amazonaws.com/app/img/plan/PPPBCKOS/pplqqmin7thirdimagepathrelatorio_1_mes_1.png', // Banner Resultados
  'https://app.ironpayapp.com.br/assets/pix-21b9f5c7.jpg', // Ícone Pix
  'https://i.ibb.co/9m6pG513/f85d6e00-b101-4f91-9aff-0f3b3a3f1d09.png', // Logo Stalkea.ai VIP
  'https://i.ibb.co/dw6fj3rT/pplqqmin7imagepathlogo-vert-fundo-preto.png', // Logo Sidebar
  'https://stalkea.ai/assets/images/screenshots/fotoblur1.jpg', // Prints Borrados
  'https://i.ibb.co/dsdLwYhj/276fd2d9-9819-433a-a684-7eb332a96a26.png', // Mapa
  'https://i.pinimg.com/1200x/7b/e1/fd/7be1fd83faed1840795cd5770ff1174d.jpg', // Ju Viana
];


const App: React.FC = () => {
  const [config, setConfig] = useState<any>(() => {
    const cached = localStorage.getItem('stalkea_config_cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) { }
    }
    return {
      prices: { main: 37, upsell1: 16.00, upsell2: 12 },
      copy: { main_title: "Acesso Stalkea", main_description: "Acesso Completo 2.0", upsell1_title: "Privacy Bolt", upsell2_title: "Ghost Mode" }
    };
  });

  // 🖐️ DRAG CONTROLS FOR DEV PANEL
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = false;
    const touch = e.touches[0];
    dragOffset.current = { x: touch.clientX - dragPos.x, y: touch.clientY - dragPos.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    isDragging.current = true;
    const touch = e.touches[0];
    setDragPos({ x: touch.clientX - dragOffset.current.x, y: touch.clientY - dragOffset.current.y });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;
    dragOffset.current = { x: e.clientX - dragPos.x, y: e.clientY - dragPos.y };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      isDragging.current = true;
      setDragPos({ x: moveEvent.clientX - dragOffset.current.x, y: moveEvent.clientY - dragOffset.current.y });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 🛰️ REMOTE CONFIG (Sincronização Otimizada com Supabase - Polling 10s)
  useEffect(() => {
    const syncConfig = async () => {
      try {
        // Adiciona timestamp para ignorar cache do navegador/CDN
        const res = await fetch(`/api/config?t=${Date.now()}`);
        if (!res.ok) throw new Error('API fetch failed');
        const remoteConfig = await res.json();

        if (remoteConfig && remoteConfig.prices) {
          // Log visual no console solicitado pelo usuário
          console.log(`[MONITOR] 💰 Preço Atual: R$ ${remoteConfig.prices.main} | Privacy: R$ ${remoteConfig.prices.upsell1} | Fila: R$ ${remoteConfig.prices.upsell2}`);

          setConfig(remoteConfig);
          localStorage.setItem('stalkea_config_cache', JSON.stringify(remoteConfig));

          // Valida Banimento de IP Localmente
          if (remoteConfig.banned_ips && Array.isArray(remoteConfig.banned_ips)) {
            // Valida Banimento de IP Localmente (via Cloudflare Trace - mais discreto na rede)
            fetch('https://www.cloudflare.com/cdn-cgi/trace')
              .then(r => r.text())
              .then(text => {
                const ipLine = text.split('\n').find(l => l.startsWith('ip='));
                if (ipLine) {
                  const ip = ipLine.split('=')[1];
                  if (remoteConfig.banned_ips.includes(ip)) {
                    localStorage.setItem('stalkea_terminated', 'true');
                    window.location.reload();
                  }
                }
              }).catch(() => { });
          }
        }
      } catch (err) {
        console.warn("⚠️ Config Sync Exception:", err);
      }
    };

    // Primeira execução imediata
    syncConfig();

    // ⚡ Polling a cada 10s usando requestIdleCallback (não compete com animações/scroll)
    const interval = setInterval(() => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(syncConfig, { timeout: 5000 });
      } else {
        syncConfig();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const [step, setStep] = useState<AppStep>(() => {
    // 1. Prioridade para a URL (Evita redirect incorreto no reload)
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace('/', '');
      if (path.includes('feed') || path === 'feed') return 'feed';
      const urlStep = STEP_MAP[path];
      if (urlStep && urlStep !== 'home') return urlStep;
    }

    // 2. Fallback para LocalStorage
    const savedStep = localStorage.getItem('stalkea_current_step') as AppStep;

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath.includes('feed') || currentPath.includes('feed-secreto')) {
        return 'feed';
      }
    }

    if ((savedStep as string) === 'feed') {
      return 'feed';
    }

    const isTerminated = localStorage.getItem('stalkea_terminated') === 'true';
    const isPaidMain = localStorage.getItem('stalkea_payment1_verified') === 'true' || localStorage.getItem('stalkea_paid_main') === 'true';
    const isPaidPrivacy = localStorage.getItem('stalkea_paid_privacy') === 'true' || localStorage.getItem('stalkea_upsell_complete') === 'true';

    if (isTerminated && localStorage.getItem('stalkea_bypass') !== 'true') return 'home';

    // 🔥 LÓGICA DE PERSISTÊNCIA DE PAGAMENTO E ETAPAS
    // 1. Se já pagou o Upsell (Privacy), vai para a Fila de Espera (ou Feed se já passou da fila)
    if (isPaidPrivacy) {
      // Se já estava na fila ou feed, mantém. Se estava antes, avança para fila.
      if ((savedStep as string) === 'waiting' || (savedStep as string) === 'feed') return savedStep;
      return 'waiting';
    }

    // 2. Se já pagou o Checkout Principal, OBRIGATORIAMENTE vai para o Aviso de Segurança (Privacy Check)
    if (isPaidMain) {
      return 'privacy_check';
    }

    return savedStep || 'home';
  });


  const [username, setUsername] = useState(() => localStorage.getItem('stalkea_current_user') || '');

  // Persist Step and Username
  useEffect(() => {
    if (step) localStorage.setItem('stalkea_current_step', step);
    if (username) localStorage.setItem('stalkea_current_user', username);
  }, [step, username]);

  // 🛡️ BLOQUEIO GLOBAL DE NAVEGAÇÃO - Impede voltar após sair do home
  useEffect(() => {
    // Só ativa o bloqueio se não estiver no home
    if (step === 'home') return;

    const blockNavigation = (e: PopStateEvent) => {
      // Bloqueio agressivo: Força o histórico para frente sempre que houver tentativa de voltar
      window.history.pushState(null, '', window.location.href);
    };

    // "Puxa" o usuário para uma entrada extra no histórico para capturar o primeiro clique de voltar
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', blockNavigation);

    return () => {
      window.removeEventListener('popstate', blockNavigation);
    };
  }, [step]);

  const [isFetching, setIsFetching] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [prefetchedFeed, setPrefetchedFeed] = useState<any>(null);
  const [payerName, setPayerName] = useState(() => localStorage.getItem('stalkea_payer_name') || 'usuário');
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(() => localStorage.getItem('stalkea_supreme_unlocked') === 'true');
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false); // 🚀 Controle de expansão
  const [activeDevTab, setActiveDevTab] = useState<'nav' | 'config' | 'posts'>('nav'); // 📑 Tabs do Control Center

  const [newPost, setNewPost] = useState({
    username: '',
    authorPic: '',
    videoUrl: '',
    img: '',
    caption: '',
    likes: 1200,
    comments: 45
  });
  const [isSavingPost, setIsSavingPost] = useState(false);

  const handleSavePost = async () => {
    if (!newPost.username) return alert('Username é obrigatório!');
    setIsSavingPost(true);
    try {
      const { error } = await supabase.from('custom_posts').insert([{
        ...newPost,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      alert('Post adicionado com sucesso ao Feed Global!');
      setNewPost({ username: '', authorPic: '', videoUrl: '', img: '', caption: '', likes: 1200, comments: 45 });
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar: ' + (err.message || 'Verifique o Supabase'));
    } finally {
      setIsSavingPost(false);
    }
  };

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false); // 🔑 Nova trava
  const [adminPass, setAdminPass] = useState(''); // Input da senha
  const [loginAttempts, setLoginAttempts] = useState(0); // 🛡️ Anti Brute Force
  const [bypassBlocks, setBypassBlocks] = useState(() => localStorage.getItem('stalkea_bypass') === 'true');

  // 🎛️ API Toggles
  const [apiProfileEnabled, setApiProfileEnabled] = useState(() => localStorage.getItem('stalkea_api_profile_enabled') !== 'false');
  const [apiFeedEnabled, setApiFeedEnabled] = useState(() => localStorage.getItem('stalkea_api_feed_enabled') !== 'false');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getProxiedUrl = (url: string | undefined | null) => {
    if (!url) return `https://unavatar.io/instagram/${username || 'instagram'}`;

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

    // 3. Aplicar Weserv.nl com otimização agressiva (il = interlaced/progressive)
    const cleanUrl = finalUrl.replace(/^https?:\/\//, '');
    return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=400&h=400&fit=cover&q=65&il`;
  };

  // Ref para controlar requisições de feed em andamento e evitar duplicidade
  const feedFetchRef = useRef<{ [username: string]: boolean }>({});

  // 🛡️ BLOQUEIO PERMANENTE (Célula de Suicídio) - DESATIVADO
  /*
  useEffect(() => {
    const isTerminated = localStorage.getItem('stalkea_terminated') === 'true';
    if (isTerminated && !bypassBlocks) {
      window.stop();
      window.location.replace('https://www.google.com/search?q=acesso+indisponivel');
    }
  }, [bypassBlocks]);
  */

  // 📊 SISTEMA DE RELATÓRIOS (Admin, Facebook CAPI & TikTok)
  const reportAdminActivity = (extra: any = {}) => {
    // Gerar um Event ID único para deduplicação (Browser + Server)
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Non-blocking background report for High FPS
    setTimeout(async () => {
      try {
        const fbc = document.cookie.split('; ').find(row => row.startsWith('_fbc='))?.split('=')[1];
        const fbp = document.cookie.split('; ').find(row => row.startsWith('_fbp='))?.split('=')[1];

        // 0. ⚡ SUPABASE LOG (ALTA PRECISÃO)
        (async () => {
          try {
            let userIp = 'unknown';
            let city = 'Desconhecido';
            let region = '';

            try {
              const ipRes = await fetch('https://ipwho.is/');
              if (ipRes.ok) {
                const ipData = await ipRes.json();
                if (ipData.success) {
                  userIp = ipData.ip || userIp;
                  city = ipData.city || 'Desconhecido';
                  region = ipData.region || '';
                }
              }
            } catch (e) {
              try {
                const ipRes = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
                if (ipRes.ok) {
                  const text = await ipRes.text();
                  const ipLine = text.split('\n').find(l => l.startsWith('ip='));
                  if (ipLine) userIp = ipLine.split('=')[1];
                }
              } catch (e2) { }
            }

            await supabase.from('traffic_logs').insert({
              ip: userIp,
              target_user: username || 'visitante',
              event_type: extra.eventName || 'view_content',
              city: city,
              device: navigator.userAgent,
              metadata: {
                step,
                fbc,
                fbp,
                payment_verified: localStorage.getItem('stalkea_payment1_verified') === 'true',
                ...extra
              }
            });
          } catch (err) { }
        })();

        // 1. Report to Backend (Admin + FB CAPI)
        fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step,
            targetUsername: username,
            paymentVerified: localStorage.getItem('stalkea_payment1_verified') === 'true',
            fbc,
            fbp,
            eventId,
            userData: {
              email: extra.email || localStorage.getItem('stalkea_user_email'),
              name: extra.name || localStorage.getItem('stalkea_payer_name'),
              cpf: extra.cpf || localStorage.getItem('stalkea_user_cpf')
            },
            ...extra
          })
        }).catch(() => { });

        // 2. TikTok Pixel (Browser Side)
        if (extra.eventName && (window as any).ttq) {
          let ttEvent = extra.eventName;
          if (ttEvent === 'Purchase') ttEvent = 'CompletePayment';

          (window as any).ttq.track(ttEvent, {
            content_name: 'VIP Stalkea',
            value: extra.value ? parseFloat(extra.value) : (extra.eventName === 'Purchase' ? parseFloat(config.prices.main) : undefined),
            currency: 'BRL',
            event_id: eventId
          });
        }

        // 3. Meta Pixel (Browser Side)
        if ((window as any).fbq) {
          const eventName = extra.eventName || 'PageView';
          const standardEvents = ['ViewContent', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead', 'AddToCart', 'PageView'];
          const isStandard = standardEvents.includes(eventName);

          const params: any = {
            currency: 'BRL',
            content_name: 'Acesso Stalkea',
            content_type: 'product'
          };

          // Dados de Advanced Matching (Email/Nome) para aumentar precisão
          const userData: any = {};
          const userEmail = extra.email || localStorage.getItem('stalkea_user_email');
          const userName = extra.name || localStorage.getItem('stalkea_payer_name');

          if (userEmail) userData.em = userEmail.toLowerCase().trim();
          if (userName) userData.fn = userName.toLowerCase().trim();

          if (extra.value || eventName === 'Purchase') {
            params.value = parseFloat(extra.value || config.prices.main);
          }

          const eventParams = { eventID: eventId };

          // Re-init com dados de usuário se disponíveis (Advanced Matching)
          if (Object.keys(userData).length > 0) {
            (window as any).fbq('init', '1408422817609246', userData);
            (window as any).fbq('init', '2102051133960198', userData);
          }

          if (isStandard) {
            (window as any).fbq('track', eventName, params, eventParams);
          } else {
            (window as any).fbq('trackCustom', eventName, params, eventParams);
          }
        }
      } catch (e) { }
    }, 50);
  };

  // ⚡ SALVAR CONFIGURAÇÃO REMOTA (Supabase)
  const updateRemoteConfig = async (newConfig: any) => {
    try {
      // 🛠️ Sanitização: Garante que os preços sejam números reais
      const preparedConfig = {
        ...newConfig,
        prices: {
          main: parseFloat(newConfig.prices.main) || 27,
          upsell1: parseFloat(newConfig.prices.upsell1) || 16,
          upsell2: parseFloat(newConfig.prices.upsell2) || 12
        }
      };

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          data: preparedConfig
        })
      });
      const data = await res.json();
      if (data.success) {
        // Atualiza o estado local com os dados sanitizados para refletir na UI imediatamente sem reload
        setConfig(preparedConfig);
        alert("Configurações salvas no Banco de Dados!");
      }
    } catch (e) {
      console.error("Save failed", e);
      alert("Falha ao salvar. Verifique o servidor.");
    }
  };


  // 🚀 RELATÓRIO INICIAL (Entrou na Página)
  useEffect(() => {
    if (step === 'home') {
      reportAdminActivity({ eventName: 'ViewContent' });
    }
  }, []);

  // 🚀 PRÉ-CARREGAMENTO DE IMAGENS (Instant Checkout)
  useEffect(() => {
    CRITICAL_IMAGES.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Efeito para Sincronizar URL com o Estado (One-way: State -> URL)
  useEffect(() => {
    // PROTEÇÃO CRÍTICA DE RELOAD: Se a URL diz feed, mas o React ainda está montando como 'home',
    // impedimos que este efeito sobrescreva a URL ou o LocalStorage.
    const currentUrl = window.location.pathname;
    if (step === 'home' && (currentUrl.includes('feed') || currentUrl.includes('feed-secreto'))) {
      console.log('[App] Boot protection: preventing URL overwrite to home');
      return;
    }

    const path = REVERSE_STEP_MAP[step];
    const params = new URLSearchParams(window.location.search);

    // Manter ou atualizar username na query
    if (username) {
      params.set('u', username);
      localStorage.setItem('stalkea_current_user', username);
    }

    // Adicionar parâmetros do site original para realismo
    if (step === 'cta' || step === 'feed') {
      if (!params.has('sck')) params.set('sck', `${Date.now()}_${Math.floor(Math.random() * 10000000)}`);
      if (!params.has('src')) params.set('src', 'stalkea.ai');
    }

    const newPath = `/${path}`;
    const newQuery = params.toString() ? `?${params.toString()}` : '';
    const newUrl = `${newPath}${newQuery}`;

    if (window.location.pathname !== newPath || window.location.search !== newQuery) {
      // Para etapas do funil (pós-home), usamos replaceState em algumas transições para limpar rastro
      const isPostConfirm = ['hacking', 'feed', 'cta', 'checkout', 'waiting'].includes(step);
      if (isPostConfirm) {
        window.history.replaceState(null, '', newUrl);
      } else {
        window.history.pushState(null, '', newUrl);
      }
    }

    // Salvar estado para persistência no F5
    localStorage.setItem('stalkea_current_step', step);
  }, [step, username]);

  // 🛡️ CAMADA DE SEGURANÇA MÁXIMA (Desativada)
  useEffect(() => {
    // F12 e inspeção liberados conforme solicitação
  }, []);

  // 🔊 DESBLOQUEIO GLOBAL DE ÁUDIO (Melhora conversão e alertas)
  // 🚀 Desabilitar em mobile para economizar recursos
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return; // Skip audio unlock on mobile

    // 🔄 SINCRONIZAÇÃO DE CONFIGURAÇÃO (Supabase)
    const unlockAudio = () => {
      const audio = new Audio();
      audio.play().catch(() => { });
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // 🛠️ PAINEL SECRETO: BLOQUEIO LEDS OLHO GORDO (Shortcuts)
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = true;

      // CTRL + ALT + F + G
      if (e.ctrlKey && e.altKey && keysPressed['f'] && keysPressed['g']) {
        // Agora exige senha também no atalho
        setShowPasswordPrompt(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete keysPressed[e.key.toLowerCase()];
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 🕵️ MÉTODO DE ATIVAÇÃO UNIVERSAL (CELULAR & PC): 15 Cliques Rápidos + Senha
  useEffect(() => {
    reportAdminActivity({ eventName: 'PageView' });
    let clickCount = 0;
    let lastClickTime = 0;

    const handleSecretClicks = () => {
      if (showDebugPanel || showPasswordPrompt) return; // Já em modo dev ou pedindo senha

      const now = Date.now();
      if (now - lastClickTime < 500) {
        clickCount++;
      } else {
        clickCount = 1;
      }
      lastClickTime = now;

      if (clickCount >= 15) {
        setShowPasswordPrompt(true);
        clickCount = 0; // Reset
        console.log('🔒 15 CLIQUES! Digite a senha para Supreme Access...');
      }
    };

    window.addEventListener('click', handleSecretClicks);
    return () => window.removeEventListener('click', handleSecretClicks);
  }, [showDebugPanel, showPasswordPrompt]);

  // Salvar Bypass no Storage
  useEffect(() => {
    localStorage.setItem('stalkea_bypass', String(bypassBlocks));
    if (bypassBlocks) setShowBlockedModal(false);
  }, [bypassBlocks]);

  // Efeito para Lidar com o carregamento inicial (Path -> State + Persistência)
  useEffect(() => {
    // 1. Recuperar dados globais (Username e Perfil) para TODAS as etapas
    const params = new URLSearchParams(window.location.search);
    const urlUsername = params.get('u');

    // Recuperar perfil do localStorage se existir
    const cachedProfile = localStorage.getItem('stalkea_profile');
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        setProfileData(parsed);
      } catch (e) { console.error("Erro ao ler cache", e); }
    }

    // Definir Username (Prioridade: URL > Saved > Confirmed)
    const savedUser = localStorage.getItem('stalkea_current_user');
    const confirmedUser = localStorage.getItem('stalkea_confirmed_user');
    const effectiveUser = urlUsername || savedUser || confirmedUser;

    if (effectiveUser) {
      const rawUser = effectiveUser;
      const targetUser = rawUser.replace('@', '').split('?')[0].split('&')[0].trim().toLowerCase();

      setUsername(targetUser);
      // Se não tem cache e temos usuário, busca dados reais (exceto se for feed, que tem lógica própria)
      if (!cachedProfile && targetUser) {
        fetchRealProfileData(targetUser, false);
      } else if (cachedProfile) {
        const parsed = JSON.parse(cachedProfile);
        if (parsed.username) setUsername(parsed.username);
      }
    }

    // 2. Melhor limpeza do path (remove barra inicial e final)
    const rawPath = window.location.pathname;
    const currentPath = rawPath.replace(/^\/|\/$/g, '') || 'index.html';

    console.log('[DEBUG] Init Path:', currentPath);

    // 3. Definir Step (Prioridade: URL path > LocalStorage > Default)
    let initialStep = STEP_MAP[currentPath];

    // Lógica de fallback para URL contendo 'feed' (igual ao useState)
    if (!initialStep && (currentPath.includes('feed') || rawPath.includes('feed'))) {
      initialStep = 'feed';
    }

    console.log('[DEBUG] Init Check - Path:', currentPath, 'Mapped:', initialStep, 'Saved:', localStorage.getItem('stalkea_current_step'));

    // Se o que está no Path não é um passo válido ou é a Home, tenta recuperar do LocalStorage
    // MAS, se a URL for explicitamente /feed, forçamos o feed se tivermos dados
    if ((!initialStep || initialStep === 'home') && !currentPath.includes('feed')) {
      // Se tiver dados de sessão salvos, respeita o passo salvo
      const savedStep = localStorage.getItem('stalkea_current_step') as AppStep;
      if (savedStep && savedStep !== 'home') {
        initialStep = savedStep;
      } else {
        initialStep = 'home';
      }
    }

    // 🔄 PERSISTÊNCIA DO FEED NO RELOAD (PRIORIDADE ABSOLUTA)
    const savedStep = localStorage.getItem('stalkea_current_step') as AppStep;

    // Se o step salvo for 'feed', IGNORA qualquer outra lógica e força o feed
    const shouldBeOnFeed = savedStep === 'feed' || initialStep === 'feed' || currentPath.includes('feed') || step === 'feed';

    if (shouldBeOnFeed) {
      console.log('[DEBUG] Force Persisting Feed - CORINGA 2.0');
      setStep('feed');
      setShowBlockedModal(false);

      // Restore Profile Data if missing
      let restoredProfile = false;
      if (!profileData) {
        const cachedProfile = localStorage.getItem('stalkea_profile');
        if (cachedProfile) {
          try {
            const parsed = JSON.parse(cachedProfile);
            setProfileData(parsed);
            restoredProfile = true;
          } catch (e) {
            localStorage.removeItem('stalkea_profile');
          }
        }

        if (!restoredProfile) {
          // Fallback critical: if on feed but no profile, create a mock one to prevent crash/redirect
          const user = username || localStorage.getItem('stalkea_current_user') || 'instagram';
          const mockProfile = {
            username: user,
            name: user,
            posts: '152',
            followers: '12.5k',
            following: '482',
            bio: 'Instagram User',
            profilePic: `https://unavatar.io/instagram/${user}`
          };
          setProfileData(mockProfile);
          localStorage.setItem('stalkea_profile', JSON.stringify(mockProfile));
        }
      }

      // Restore Feed Data
      const user = username || localStorage.getItem('stalkea_current_user');
      if (user) {
        const cacheKey = `stalkea_cache_${user}`;
        const cachedFeed = localStorage.getItem(cacheKey);
        if (cachedFeed) {
          try {
            const parsedFeed = JSON.parse(cachedFeed);
            if (parsedFeed.feed) {
              setPrefetchedFeed(parsedFeed.feed);
            } else {
              startFeedPreFetch(user);
            }
          } catch (e) {
            startFeedPreFetch(user);
          }
        } else {
          // Trigger fetch if missing
          startFeedPreFetch(user);
        }
      }
      return; // STOP EXECUTION HERE TO PREVENT OVERWRITE
    }

    setStep(initialStep || 'home');

    // 🕵️ IP-BASED SESSION RECOVERY (Multi-device/Incognito Persistence)
    const syncWithIp = async () => {
      // 🛡️ RESET BYPASS: Se acabamos de resetar via Admin, ignora a primeira tentativa de sincronização
      if (localStorage.getItem('stalkea_reset_session')) {
        Logger.security('[IP-SYNC] Bypass de reset detectado. Ignorando sincronização no primeiro carregamento.');
        localStorage.removeItem('stalkea_reset_session');
        return;
      }

      try {
        // 1. Pegar IP real via IPIFY (Exigência do usuário para precisão máxima)
        const ipifyRes = await fetch('https://api.ipify.org?format=json');
        const { ip: clientIp } = await ipifyRes.json();

        // 2. Consultar o Supabase passando o IP capturado via Query String
        const response = await fetch(`/api/track-ip?ip=${clientIp}`);
        const data = await response.json();

        if (data.success && data.username) {
          Logger.system(`[IP-SYNC] Sessão recuperada para @${data.username} na etapa ${data.step} | IP: ${clientIp}`);

          // Restaurar Username e travar cache (evita pesquisar outro @)
          setUsername(data.username);
          localStorage.setItem('stalkea_current_user', data.username);

          // Restaurar Etapa (Força o redirecionamento para o ponto salvo no banco)
          let finalStep = (data.step || 'home') as AppStep;

          // 🔥 SEGURANÇA PÓS-PAGO: Se já pagou, o destino mínimo é o privacy_check
          // Se o pagamento for detectado, forçamos o avanço se ele ainda estiver no checkout ou antes.
          if (data.payment_verified && (finalStep === 'home' || finalStep === 'confirm' || finalStep === 'hacking' || finalStep === 'cta' || finalStep === 'checkout')) {
            Logger.success('[IP-SYNC] Pagamento detectado! Forçando avanço para Privacy Check.');
            finalStep = 'privacy_check';
          }

          if (finalStep !== 'home') {
            setStep(finalStep);
            localStorage.setItem('stalkea_current_step', finalStep);
            setShowBlockedModal(false);
          }

          // Restaurar Status de Pagamento no LocalStorage
          if (data.payment_verified) {
            localStorage.setItem('stalkea_payment1_verified', 'true');
            localStorage.setItem('stalkea_paid_main', 'true'); // redundância amigável
          }

          // Busca perfil se faltar
          if (!profileData) {
            fetchRealProfileData(data.username, false);
          }
        }
      } catch (e) {
        Logger.error('[IP-SYNC] Falha ao sincronizar com IP:', e);
      }
    };

    syncWithIp();
  }, []);

  // 🚀 MODO LIMPO: TIMER DESATIVADO (Agora gerenciado apenas no InstagramFeedClone.tsx)


  // Helper para formatar números grandes (ex: 671.000.000 -> 617M)
  const formatStatsNumber = (num: number) => {
    if (!num) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
  };

  const fetchRealProfileData = async (name: string, shouldRedirect: boolean = true) => {
    let proceed = shouldRedirect;
    let success = false;
    setIsFetching(true);
    setErrorMessage(null);
    const cleanUsername = name.replace('@', '').split('?')[0].split('&')[0].trim().toLowerCase() || 'instagram';

    // 🔒 BLOQUEIO POR IP - Verifica se o IP já tem um @ vinculado
    try {
      const ipCheckResponse = await fetch('/api/track-ip');
      const ipData = await ipCheckResponse.json();

      if (ipData.success && ipData.blocked && ipData.username) {
        // IP já tem um @ vinculado e está bloqueado
        const lockedUsername = ipData.username;

        if (lockedUsername !== cleanUsername) {
          // Tentou pesquisar um @ diferente do original
          Logger.security(`🚫 BLOQUEIO POR IP: Tentativa de pesquisar "${cleanUsername}" mas IP está vinculado a "${lockedUsername}"`);

          // Força o usuário a ver apenas o @ original
          setUsername(lockedUsername);
          setErrorMessage(`Você já pesquisou @${lockedUsername}. Não é possível pesquisar outro perfil.`);

          // Tenta recuperar dados do @ original
          const cachedData = localStorage.getItem(`stalkea_cache_${lockedUsername}`);
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData);
              if (parsed.profile) {
                setProfileData(parsed.profile);
                if (shouldRedirect) setStep('confirm');
              }
            } catch (e) { }
          }

          setIsFetching(false);
          return;
        }
      }
    } catch (e) {
      Logger.error('Erro ao verificar IP:', e);
    }

    setUsername(cleanUsername);

    // 🔥 ANTECIPAÇÃO CRÍTICA: Inicia o fetch do feed no EXATO SEGUNDO que o perfil é identificado (Independente do cache de perfil)
    startFeedPreFetch(cleanUsername);

    const startTime = Date.now();

    // 1. TENTAR RECUPERAR DO CACHE LOCAL (Navegador)
    const cachedData = localStorage.getItem(`stalkea_cache_${cleanUsername}`);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.profile) {
          Logger.system('[CACHE] Recuperado do localStorage:', cleanUsername);
          setProfileData(parsed.profile);
          setIsFetching(false);
          if (shouldRedirect) setStep('confirm');
          return;
        }
      } catch (e) { Logger.error('Erro ao ler cache:', e); }
    }

    // 2. BUSCA VIA CLIENT-SIDE (NOVA LÓGICA)
    try {
      // 🛡️ API TOGGLE CHECK
      if (localStorage.getItem('stalkea_api_profile_enabled') === 'false') {
        throw new Error("API Perfil desativada manualmente");
      }

      const response = await Promise.race([
        fetch(`/api/profile?username=${cleanUsername}`),
        new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 35000)) // 35s para aguentar retries do backend
      ]);

      if (!response.ok) throw new Error('API Local offline ou erro 500');
      const result = await response.json();

      if (result.success && result.data) {
        const d = result.data;
        const realData: ProfileData = {
          username: d.username,
          name: d.full_name,
          posts: d.posts,
          followers: d.followers,
          following: d.following,
          bio: d.biography,
          profilePic: d.profile_pic_url
        };
        setProfileData(realData);
        success = true;
        // Atualiza o username com o oficial retornado pela API para garantir precisão
        setUsername(d.username);

        localStorage.setItem('stalkea_profile', JSON.stringify(realData));

        // Salvar no cache persistente
        const currentCache = JSON.parse(localStorage.getItem(`stalkea_cache_${cleanUsername}`) || '{}');
        localStorage.setItem(`stalkea_cache_${cleanUsername}`, JSON.stringify({
          ...currentCache,
          profile: realData
        }));
      } else {
        throw new Error("API não retornou sucesso");
      }
    } catch (err) {
      console.warn("Perfil não encontrado ou erro na API:", err);

      // Quando não encontra, limpamos os dados e mostramos o erro na Home
      setProfileData(null);
      setErrorMessage("Nenhuma API conseguiu retornar o perfil.");
      proceed = false; // IMPEDE de ir para a tela de confirmação
    } finally {
      const elapsed = Date.now() - startTime;
      const minDelay = 2000;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }

      // SÓ AVANÇA se 'proceed' for true e tivermos sucesso na busca
      if (proceed && success) {
        setStep('confirm');
      }
      setIsFetching(false);
    }
  };

  const handleStepChange = (newStep: AppStep) => {
    // 🛡️ TRAVA DE NÃO REGRESSÃO - DESATIVADA
    setStep(newStep);
    Logger.flow(`Mudança de Etapa: ${newStep}`);

    // 🔥 SYNC COM SUPABASE (IP TRACKING)
    fetch('/api/track-ip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        step: newStep,
        payment_verified: localStorage.getItem('stalkea_payment1_verified') === 'true'
      })
    }).catch(() => { });

    // Relatório de Progressão
    let capiEvent = null;
    let eventValue = null;

    if (newStep === 'home') capiEvent = 'ViewContent';
    if (newStep === 'cta') {
      capiEvent = 'cta'; // Entrada no CTA não é InitiateCheckout
    }
    if (newStep === 'checkout') {
      capiEvent = 'InitiateCheckout'; // InitiateCheckout só ao ir pro checkout
      eventValue = '27.00';
    }
    if (newStep === 'results') {
      capiEvent = 'Purchase';
      eventValue = '27.00';
    }

    reportAdminActivity({
      step: newStep,
      eventName: capiEvent,
      value: eventValue
    });
  };

  const handleConfirmProfile = async () => {
    // 🔥 ANTECIPAÇÃO MÁXIMA DO FEED 🔥
    // Inicia o carregamento IMEDIATAMENTE após clicar em "Confirmar"
    // Isso garante que enquanto o usuário vê as telas de "Hacking/Loading", 
    // o feed já está sendo montado em background.
    Logger.flow(`[Confirm] Usuário confirmou perfil: ${username}. Garantindo fetch do feed...`);
    startFeedPreFetch(username);

    // 1. Iniciar cronômetro: REMOVIDO DAQUI
    // O timer agora inicia apenas quando o componente InstagramFeedClone.tsx é montado.

    // 2. 🔒 REGISTRAR IP NO SERVIDOR para proteção permanente (BLOQUEIO DEFINITIVO)
    // (Este bloco roda uma única vez ao confirmar o perfil, antes do brute force)
    if (!localStorage.getItem('stalkea_timer_end')) { // Mantendo verificação para rodar apenas uma vez
      try {
        // Salvar no Supabase (IP Binding)
        fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => {
          Logger.security(`🔒 Vinculando IP ${d.ip} ao alvo ${username}`);
          supabase.from('traffic_logs').insert({
            ip: d.ip,
            target_user: username,
            event_type: 'ip_bind',
            device: navigator.userAgent,
            metadata: { action: 'profile_confirmed', timestamp: new Date().toISOString() }
          }).then(({ error }) => {
            if (error) Logger.error('[Supabase] Erro ao vincular IP:', error);
            else Logger.success('[Supabase] IP vinculado com sucesso!');
          });
        }).catch(() => { });

        // 🔒 BLOQUEIO PERMANENTE POR IP - Registra o @ vinculado ao IP
        await fetch('/api/track-ip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            durationMinutes: 999999 // Duração muito longa = bloqueio permanente
          })
        });

        Logger.security(`🔒 IP bloqueado permanentemente para @${username}`);
      } catch (e) {
        Logger.error('Erro ao registrar IP:', e);
      }
    }

    handleStepChange('hacking');
  };

  const startFeedPreFetch = async (specificUsername?: string) => {
    const targetUser = specificUsername || username;
    if (!targetUser) return;

    // Verificar se já existe um fetch em andamento para este usuário
    if (feedFetchRef.current[targetUser]) {
      Logger.flow(`[FEED] Já existe uma requisição em andamento para ${targetUser}. Mantendo fluxo contínuo.`);
      return;
    }

    // Marcar como em andamento
    feedFetchRef.current[targetUser] = true;

    // 1. TENTAR RECUPERAR DO CACHE PRIMEIRO
    const cacheKey = `stalkea_cache_${targetUser}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        // Validação Robusta do Cache (Agora exige posts > 0 para evitar tela branca)
        const isValidFeed = (f: any) => f && Array.isArray(f.posts) && f.posts.length > 0 && (f.stories?.feed_stories_data === undefined || Array.isArray(f.stories?.feed_stories_data));

        if (parsed.feed && parsed.feed.enriched && isValidFeed(parsed.feed)) {
          Logger.success('[FEED] Carregado do CACHE (Enriched):', parsed.feed);
          setPrefetchedFeed(parsed.feed);
          // Libera a flag pois terminou (via cache)
          feedFetchRef.current[targetUser] = false;
          return;
        } else {
          Logger.error("[CACHE] Feed inválido ou corrompido. Ignorando cache.");
          localStorage.removeItem(cacheKey);
        }
      } catch (e) {
        Logger.error('Cache invalido (JSON error)', e);
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      // 2. BUSCA VIA CLIENT-SIDE (NOVA LÓGICA)
      // Usa fetchInstagramFeed do utils/instagram.ts que roda no browser do usuário
      Logger.api(`[FEED] Iniciando fetch client-side para ${targetUser}...`);
      const result = await fetchInstagramFeed(targetUser);

      // CORINGA FIX: Verificação segura para evitar erro de tipo 'property error does not exist'
      const hasError = !result || !result.success;
      if (hasError) throw new Error("Falha no fetch client-side");

      const finalPosts = result.posts;
      const finalStories = result.suggestions; // No utils, suggestions já vem formatado como stories

      Logger.success(`[Enrichment] Final: ${finalPosts.length} posts, ${finalStories.length} stories.`);

      // 📊 LOG FEED STATS TO ADMIN DASHBOARD
      reportAdminActivity({
        eventName: 'FeedGenerated',
        posts_count: finalPosts.length,
        stories_count: finalStories.length,
        step: 'feed'
      });

      const feed = {
        posts: finalPosts,
        stories: { feed_stories_data: finalStories },
        suggestions: finalStories,
        enriched: true
      };

      // 🚀 PREFETCH DE IMAGENS: Carregar em background para exibição instantânea
      // Isso atende ao pedido de não "carregar na cara do usuário"
      setTimeout(() => {
        const imagesToPreload: string[] = [];

        // Posts (Top 15 para garantir a primeira tela e scroll inicial)
        finalPosts.slice(0, 15).forEach((item: any) => {
          const p = item.post || item;
          if (p.image_url) imagesToPreload.push(p.image_url);
          // Também carregar avatar do autor do post se tiver
          if (p.profile_pic) imagesToPreload.push(p.profile_pic);
        });

        // Stories (Top 10)
        finalStories.slice(0, 10).forEach((s: any) => {
          if (s.profile_pic_url) imagesToPreload.push(s.profile_pic_url);
        });

        if (imagesToPreload.length > 0) {
          Logger.flow(`[PREFETCH] Iniciando carregamento silencioso de ${imagesToPreload.length} imagens...`);
          imagesToPreload.forEach(url => {
            const img = new Image();
            img.src = url;
          });
        }
      }, 0);

      setPrefetchedFeed(feed);

      // Salvar feed no cache do localStorage
      const currentCache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
      localStorage.setItem(cacheKey, JSON.stringify({
        ...currentCache,
        feed: feed
      }));

    } catch (e) {
      Logger.error("Erro no pre-fetch do feed:", e);
      // Fallback para evitar travamento na tela de hacking
      setPrefetchedFeed({
        posts: [],
        stories: { feed_stories_data: [] },
        suggestions: [],
        enriched: false
      });
    } finally {
      // Sempre libera a flag no final (sucesso ou erro)
      feedFetchRef.current[targetUser] = false;
    }
  };

  // Trigger re-fetch if arriving directly at feed/hacking step via URL/F5
  useEffect(() => {
    if ((step === 'feed' || step === 'hacking') && username && !prefetchedFeed) {
      startFeedPreFetch();
    }
  }, [step, username, prefetchedFeed]);

  useEffect(() => {
    if (step === 'cta' && username) {
      const missing =
        !profileData ||
        !profileData.posts ||
        !profileData.followers ||
        !profileData.following ||
        !profileData.profilePic;
      if (missing) {
        fetchRealProfileData(username, false);
      }
    }
  }, [step, username]);

  useEffect(() => {
    if (step === 'feed') {
      // 🚀 SEMPRE mostrar o loading "Entrando no Feed" por pelo menos 2.5s após o brute force
      // Isso garante a transição visual que o usuário solicitou
      setIsLoadingFeed(true);

      const minDuration = 2500;
      const timer = setTimeout(() => {
        if (prefetchedFeed) {
          setIsLoadingFeed(false);
        } else {
          // Se ainda não carregou os dados reais, espera o timeout final de 5s
          const backupTimer = setTimeout(() => {
            setIsLoadingFeed(false);
          }, 2500);
          return () => clearTimeout(backupTimer);
        }
      }, minDuration);

      return () => clearTimeout(timer);
    } else {
      setIsLoadingFeed(true);
    }
  }, [step, prefetchedFeed]);

  // 🔒 SINCRONIZAÇÃO DE URL REMOVIDA DAQUI PARA EVITAR CONFLITOS DE POPSTATE
  // A sincronização agora é feita apenas na mudança de etapa via handleStepChange e no efeito de persistência global.

  // Performance mode: detect low-end devices and reduce heavy effects
  useEffect(() => {
    try {
      // 🚀 FLUID EXPERIENCE: Disable performance mode automatically to show background video
      // Only enable if user explicitly opts-in (which is not implemented, so it stays off)
      // const mem = (navigator as any).deviceMemory as number | undefined;
      // const cores = navigator.hardwareConcurrency as number | undefined;
      // const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
      // const isLowEnd = (typeof mem === 'number' && mem <= 4) || (typeof cores === 'number' && cores <= 4) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Force disable perf mode for fluid experience
      document.documentElement.classList.remove('perf-mode');
      document.documentElement.removeAttribute('data-perf-mode');

    } catch { }
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-purple-500 selection:text-white relative overflow-x-hidden" >
      {/* 🚀 PRELOAD CRITICAL GIFS */}


      <style>{`
        /* 🚀 ULTRA-PERFORMANCE CORE */
        * {
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }

        /* Força GPU em elementos fixos e modais */
        .fixed, .absolute {
          will-change: transform, opacity;
          transform: translateZ(0); /* Força aceleração 3D */
        }

        /* Gerenciamento inteligente de renderização */
        .content-auto {
          content-visibility: auto;
          contain-intrinsic-size: 1px 500px;
        }

        /* Desativa efeitos de vidro em modo de economia ou celular fraco */
        .perf-mode [style*="filter: blur"] { filter: none !important; backdrop-filter: none !important; }
        .perf-mode [class*="blur-"] { filter: none !important; backdrop-filter: none !important; }
        .perf-mode [class*="backdrop-blur"] { 
          backdrop-filter: none !important; 
          background-color: rgba(5,5,5,0.98) !important; 
        }
        
        /* Animações otimizadas */
        .perf-mode [class*="animate-"] { 
          animation-duration: 0.1s !important; /* Quase instantâneo, mas mantém a lógica */
        }

        /* Otimização de Imagens */
        img {
          content-visibility: auto;
          image-rendering: -webkit-optimize-contrast;
        }
      `}</style>

      {/* 📊 ADVANCED ANALYTICS (Supabase) */}
      <SupabaseAnalytics />

      {/* 🚨 ERROR TOAST (NOT FOUND) */}




      <div className="relative z-10">
        {/* secret cookie panel */}
        {(() => {
          const [show, setShow] = React.useState(false);
          const [val, setVal] = React.useState('');
          React.useEffect(() => {
            const handler = (e: KeyboardEvent) => {
              if (e.altKey && e.key.toLowerCase() === 's') {
                setShow(true);
              }
            };
            window.addEventListener('keydown', handler);
            return () => window.removeEventListener('keydown', handler);
          }, []);
          const save = async () => {
            try {
              localStorage.setItem('ig_cookie', val.trim());
              setShow(false);
            } catch { }
          };
          const paste = async () => {
            try {
              const t = await navigator.clipboard.readText();
              setVal(t);
            } catch { }
          };
          const clear = () => {
            localStorage.removeItem('ig_cookie');
            setVal('');
            setShow(false);
          };
          return show ? (
            <div className="fixed top-4 right-4 z-[9999] bg-black/90 border border-white/10 rounded-xl shadow-xl p-4 w-[360px]">
              <div className="text-white/80 text-sm mb-2">Sessão Instagram</div>
              <textarea value={val} onChange={(e) => setVal(e.target.value)} className="w-full h-28 bg-[#111] text-white text-xs rounded-md p-2 border border-white/10 outline-none" placeholder="Cole o cookie aqui" />
              <div className="flex gap-2 mt-3">
                <button onClick={paste} className="px-3 py-1.5 text-xs rounded-md bg-[#1f2937] text-white">Colar</button>
                <button onClick={save} className="px-3 py-1.5 text-xs rounded-md bg-[#9333ea] text-white">Salvar</button>
                <button onClick={clear} className="px-3 py-1.5 text-xs rounded-md bg-[#374151] text-white">Limpar</button>
                <button onClick={() => setShow(false)} className="ml-auto px-3 py-1.5 text-xs rounded-md bg-[#111] text-white">Fechar</button>
              </div>
            </div>
          ) : null;
        })()}
        {step === 'home' && (
          <>
            <Hero
              onStart={fetchRealProfileData}
              error={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />
            {isFetching && (
              <div className="fixed inset-0 flex items-center justify-center bg-[#050505] z-[200] animate-fade-in backdrop-blur-sm">
                <div className="flex flex-col items-center gap-12 relative">
                  {/* Scanner / Spinner UI REMOVED */}

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-black text-[10px] md:text-[12px] text-purple-500 tracking-[0.4em] uppercase opacity-80 animate-pulse">
                        Sincronizando com Stalkea AI v6.0
                      </p>
                      <h2 className="text-[18px] md:text-[22px] font-bold text-white tracking-tight flex items-center gap-2">
                        Extraindo metadados
                        <span className="flex gap-1 ml-1 mt-1">
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                        </span>
                      </h2>
                    </div>

                    <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md">
                      <p className="font-mono text-[12px] text-gray-400 font-bold">
                        IDENTIFICADO: <span className="text-white italic">@{username}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid Overlay / Scanline for extra detail */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              </div>
            )}
          </>
        )}

        {step === 'confirm' && profileData && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <ConfirmationCard
              profile={profileData}
              onConfirm={handleConfirmProfile}
              onBack={() => handleStepChange('home')}
            />
          </div>
        )}

        {step === 'hacking' && (
          <InstagramBruteForce
            username={username}
            onComplete={() => {
              Logger.flow('🚀 Transição Automática: Hacking -> Feed');
              // Persistência imediata antes de mudar o estado
              localStorage.setItem('stalkea_current_step', 'feed');
              localStorage.removeItem('stalkea_timer_end');
              handleStepChange('feed');
            }}
            isDataReady={!!prefetchedFeed}
          />
        )}

        {step === 'feed' && (
          isLoadingFeed ? (
            <EntrandoNoFeed />
          ) : (
            <InstagramFeedClone
              username={username}
              profile={profileData}
              initialFeedData={prefetchedFeed}
              onNext={() => handleStepChange('cta')}
              onEvent={reportAdminActivity}
            />
          )
        )}

        {step === 'cta' && (
          <Cta
            username={username}
            profilePic={getProxiedUrl(profileData?.profilePic)}
            stats={{
              posts: profileData?.posts ? formatStatsNumber(Number(profileData.posts)) || profileData.posts.toString() : "152",
              followers: profileData?.followers ? formatStatsNumber(Number(profileData.followers)) || profileData.followers.toString() : "12.5k",
              following: profileData?.following ? formatStatsNumber(Number(profileData.following)) || profileData.following.toString() : "482"
            }}
            price={parseFloat(config.prices.main)}
            onCheckoutStart={(amount) => {
              try {
                localStorage.setItem('stalkea_selected_price', String(amount));
                localStorage.setItem('stalkea_checkout_started', 'true'); // Marcar que checkout foi iniciado
              } catch { }
              handleStepChange('checkout');
            }}
          />
        )}

        {step === 'checkout' && (
          <StalkeaPayCheckout
            username={username}
            amount={(() => {
              const saved = localStorage.getItem('stalkea_selected_price');
              return saved ? parseFloat(saved) : parseFloat(config.prices.main);
            })()}
            onClose={() => {
              // Não faz nada - usuário fica no checkout
              // O bloqueio de navegação já está no componente StalkeaPayCheckout
            }}
            onPaymentSuccess={(name) => {
              if (name) {
                setPayerName(name);
                localStorage.setItem('stalkea_payer_name', name);
              }
              localStorage.setItem('stalkea_payment1_verified', 'true');
              handleStepChange('privacy_check');
            }}
            onEvent={reportAdminActivity}
          />
        )}

        {step === 'privacy_check' && (
          <PrivacyWarningModal
            targetUsername={username}
            payerName={payerName}
            price={parseFloat(config.prices.upsell1)}
            onContinue={() => {
              localStorage.setItem('stalkea_paid_privacy', 'true');
              localStorage.setItem('stalkea_upsell_complete', 'true');
              handleStepChange('waiting');
            }}
            onEvent={reportAdminActivity}
          />
        )}

        {step === 'waiting' && (
          <WaitingQueue
            username={username}
            price={parseFloat(config.prices.upsell2)}
            onSkipQueue={() => {
              localStorage.setItem('stalkea_paid_ghost', 'true');
              localStorage.setItem('stalkea_payment_verified', 'true');
              reportAdminActivity({ eventName: 'Purchase', value: config.prices.upsell2, cartUpdate: { upsell2: true } });
              handleStepChange('feed'); // Redireciona para o Feed (Desbloqueado)
            }}
          />
        )}

        {/* LoadingScreen removed */}

        {/* ResultsDashboard removed */}

        {/* 🔑 MODAL DE SENHA SUPREMA (Apenas 15 Cliques) */}
        {showPasswordPrompt && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#050505]/95 backdrop-blur-3xl animate-fade-in px-6">
            <div className="w-full max-w-[360px] p-10 rounded-[40px] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] text-center relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-purple-600/5 blur-[80px] -mt-16 pointer-events-none"></div>

              <div className="w-20 h-20 bg-gradient-to-b from-purple-500/20 to-transparent rounded-full flex items-center justify-center mx-auto mb-8 border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.1)]">
                <Shield size={32} className="text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              </div>

              <h2 className="text-white font-black text-2xl mb-2 uppercase italic tracking-tighter leading-none">Supreme Access</h2>
              <p className="text-white/30 text-[10px] mb-10 uppercase font-black tracking-[0.3em]">Autenticação Necessária</p>

              <div className="relative mb-10 group">
                <input
                  autoFocus
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••"
                  value={adminPass}
                  onChange={(e) => {
                    const val = e.target.value;
                    // 🔒 Senha carregada do .env para segurança
                    const correctPass = import.meta.env.VITE_ADMIN_PASSWORD;

                    if (!correctPass) {
                      console.error("ERRO: Senha de admin não configurada no .env");
                      return;
                    }

                    if (val.length > correctPass.length) return;
                    setAdminPass(val);

                    if (val === correctPass) {
                      localStorage.setItem('stalkea_supreme_unlocked', 'true'); // 🔑 Permanente (Supreme Menu)
                      sessionStorage.setItem('stalkea_session_admin', 'true'); // 🛡️ Volátil (Unblocks F12/Inspect)
                      localStorage.setItem('stalkea_bypass', 'true'); // 🚀 Garante visibilidade global
                      setShowDebugPanel(true);
                      setShowPasswordPrompt(false);
                      setAdminPass('');
                      setBypassBlocks(true);
                      window.location.reload();
                    } else if (val.length === 4) {
                      // Se errou após digitar 4 dígitos
                      const newAttempts = loginAttempts + 1;
                      setLoginAttempts(newAttempts);
                      setAdminPass('');

                      if (newAttempts >= 3) {
                        // ☢️ AUTO-DESTRUIÇÃO POR TENTATIVA DE BRUTE FORCE
                        localStorage.setItem('stalkea_terminated', 'true');
                        window.location.replace('https://www.google.com/search?q=acesso+bloqueado+por+seguranca');
                      }
                    }
                  }}
                  className="w-full bg-black/40 border-b-2 border-white/5 group-focus-within:border-purple-500/50 p-6 text-center text-4xl font-black text-white focus:outline-none transition-all placeholder:text-white/5 tracking-[0.5em]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>

              <button
                onClick={() => { setShowPasswordPrompt(false); setAdminPass(''); }}
                className="text-white/20 hover:text-white/60 text-[11px] uppercase font-black tracking-[0.2em] transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* 🔒 Modal de Acesso Bloqueado (Apenas visível até o Feed) - REMOVIDO */}

        {/* 🛠️ SUPREME DEV PANEL (Unified & Optimized for Mobile) */}
        {showDebugPanel && (
          <div
            className="fixed bottom-4 right-4 z-[99999] flex flex-col items-end gap-3 pointer-events-none"
            style={{ transform: `translate(${dragPos.x}px, ${dragPos.y}px)` }}
          >
            {/* Expandable Menu */}
            {isDevMenuOpen && (
              <div className="w-[85vw] max-w-[360px] bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/20 rounded-[32px] p-6 shadow-[0_20px_60px_rgba(0,0,0,1),0_0_30px_rgba(255,255,255,0.05)] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto overflow-hidden relative">
                {/* CSS BACKGROUND */}
                <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-black">
                  <div className="absolute inset-0 bg-[#0a0a0a]/60" />
                </div>

                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[60px] rounded-full -mr-16 -mt-16 z-10"></div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div>
                    <h3 className="text-white font-black text-lg tracking-tighter uppercase italic flex items-center gap-2">
                      <Zap size={18} className="text-white fill-white" />
                      Supreme Access
                    </h3>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mt-0.5">Control Center</p>
                  </div>
                  <button
                    onClick={() => setIsDevMenuOpen(false)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={20} className="text-white/50" />
                  </button>
                </div>

                {/* 🏷️ TABS */}
                <div className="flex bg-white/5 p-1 rounded-2xl mb-6 relative z-10">
                  <button
                    onClick={() => setActiveDevTab('nav')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeDevTab === 'nav' ? 'bg-white text-black' : 'text-white/40 active:bg-white/5'}`}
                  >
                    <Layers size={14} />
                    Navegação
                  </button>
                  <button
                    onClick={() => setActiveDevTab('config')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeDevTab === 'config' ? 'bg-white text-black' : 'text-white/40 active:bg-white/5'}`}
                  >
                    <DollarSign size={14} />
                    Preços
                  </button>
                  <button
                    onClick={() => setActiveDevTab('posts')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeDevTab === 'posts' ? 'bg-white text-black' : 'text-white/40 active:bg-white/5'}`}
                  >
                    <Activity size={14} />
                    Posts
                  </button>
                </div>

                {activeDevTab === 'nav' ? (
                  <React.Fragment>
                    {/* Navigation Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-6 relative z-10">
                      {(['home', 'confirm', 'hacking', 'feed', 'cta', 'checkout', 'privacy_check', 'waiting'] as AppStep[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setStep(s);
                            localStorage.setItem('stalkea_current_step', s);
                            setShowBlockedModal(false);
                            // 🛡️ ADM FORCE: Se clicar no painel, ativa o bypass automaticamente
                            if (!bypassBlocks) setBypassBlocks(true);
                          }}
                          className={`flex items-center gap-2 px-3 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${step === s
                            ? 'bg-white border-white text-black shadow-[0_5px_15px_rgba(255,255,255,0.2)]'
                            : 'bg-white/5 border-white/5 text-white/40 active:bg-white/10'
                            }`}
                        >
                          <Layers size={14} className={step === s ? 'opacity-100' : 'opacity-30'} />
                          <span className="truncate">{s.replace('_', ' ')}</span>
                        </button>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col gap-2 relative z-10">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const isUnlocked = sessionStorage.getItem('stalkea_session_admin') === 'true';
                            if (isUnlocked) {
                              sessionStorage.removeItem('stalkea_session_admin');
                            } else {
                              sessionStorage.setItem('stalkea_session_admin', 'true');
                            }
                            window.location.reload();
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-black uppercase transition-all border ${sessionStorage.getItem('stalkea_session_admin') === 'true'
                            ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                            : 'bg-white/5 border-white/5 text-white/40'
                            }`}
                        >
                          <Code size={16} />
                          {sessionStorage.getItem('stalkea_session_admin') === 'true' ? 'Bloquear F12' : 'Liberar F12'}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('stalkea_trigger_notification'));
                            setIsDevMenuOpen(false);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-black uppercase transition-all border bg-white/5 border-white/5 text-white/40 active:bg-white/10"
                        >
                          <Bell size={16} />
                          Testar Notificação
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setBypassBlocks(!bypassBlocks)}
                          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-black uppercase transition-all border ${bypassBlocks
                            ? 'bg-purple-600/20 border-purple-500/40 text-purple-400'
                            : 'bg-white/5 border-white/5 text-white/40'
                            }`}
                        >
                          {bypassBlocks ? <ShieldOff size={16} /> : <Shield size={16} />}
                          {bypassBlocks ? 'Bypass On' : 'Bypass Off'}
                        </button>

                        <button
                          onClick={async () => {
                            Logger.security('☢️ INICIANDO RESET TOTAL (Local + Supabase)...');

                            try {
                              // 1. Identificar IP para o Reset Preciso
                              const ipifyRes = await fetch('https://api.ipify.org?format=json');
                              const { ip: clientIp } = await ipifyRes.json();
                              Logger.security(`[RESET] IP identificado para limpeza: ${clientIp}`);

                              // 2. Resetar via API (Tracking)
                              await fetch(`/api/track-ip?reset=true&ip=${clientIp}`);

                              // 3. Limpeza direta no Supabase (Remover vínculos de IP)
                              const { error: supabaseError } = await supabase
                                .from('traffic_logs')
                                .delete()
                                .match({ ip: clientIp, event_type: 'ip_bind' });

                              if (supabaseError) throw supabaseError;
                              Logger.success('🔓 Vínculos de IP removidos do Supabase!');

                            } catch (e) {
                              Logger.error('Erro no reset remoto:', e);
                              // Mesmo com erro remoto, prosseguimos com o reset local
                            }

                            // 4. Limpar toda a persistência local
                            localStorage.clear();
                            sessionStorage.clear();

                            // 5. Resetar ESTADOS locais para evitar fantasmas antes do reload
                            setUsername('');
                            setStep('home');
                            setProfileData(null);
                            setErrorMessage(null);
                            setPrefetchedFeed(null);
                            setIsFetching(false);

                            // 6. Configurar flags de sessão limpa
                            localStorage.setItem('stalkea_current_step', 'home');
                            localStorage.setItem('stalkea_supreme_unlocked', 'true');
                            localStorage.setItem('stalkea_bypass', 'true');
                            localStorage.setItem('stalkea_reset_session', 'true'); // Flag crucial para syncWithIp
                            localStorage.setItem('stalkea_terminated', 'false'); // Forçar desbloqueio local

                            Logger.flow('🚀 Redirecionando para Home...');
                            window.location.href = '/';
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-500 text-[11px] font-black uppercase active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                        >
                          <RotateCcw size={16} />
                          Reset All
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            localStorage.removeItem('stalkea_timer_end');
                            window.dispatchEvent(new CustomEvent('stalkea_reset_timer', { detail: { duration: 600 } }));
                            alert('Timer resetado para 10 minutos!');
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-500 text-[11px] font-black uppercase active:scale-95 transition-all"
                        >
                          <RotateCcw size={16} />
                          Resetar Timer (10m)
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            try {
                              localStorage.setItem('stalkea_cta_stage', '0');
                              localStorage.setItem('stalkea_cta_remaining', '480');
                              localStorage.setItem('stalkea_cta_paused', 'false');
                              localStorage.setItem('stalkea_cta_end', String(Date.now() + 480 * 1000));
                            } catch { }
                            window.dispatchEvent(new Event('stalkea_reset_cta'));
                            alert('CTA resetado para 8 minutos!');
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-black uppercase active:scale-95 transition-all"
                        >
                          <RotateCcw size={16} />
                          Resetar CTA (8m)
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newState = !apiProfileEnabled;
                            setApiProfileEnabled(newState);
                            localStorage.setItem('stalkea_api_profile_enabled', String(newState));
                            Logger.system(`API Perfil: ${newState ? 'ON' : 'OFF'}`);
                          }}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${apiProfileEnabled
                            ? 'bg-purple-600/20 border-purple-500/40 text-purple-400'
                            : 'bg-red-600/10 border-red-500/20 text-red-500 opacity-60'}`}
                        >
                          API Perfil
                        </button>
                        <button
                          onClick={() => {
                            const newState = !apiFeedEnabled;
                            setApiFeedEnabled(newState);
                            localStorage.setItem('stalkea_api_feed_enabled', String(newState));
                            Logger.system(`API Feed: ${newState ? 'ON' : 'OFF'}`);
                          }}
                          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${apiFeedEnabled
                            ? 'bg-purple-600/20 border-purple-500/40 text-purple-400'
                            : 'bg-red-600/10 border-red-500/20 text-red-500 opacity-60'}`}
                        >
                          API Feed
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                ) : activeDevTab === 'posts' ? (
                  <div className="flex flex-col gap-3 relative z-10 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                    <div className="bg-purple-600/10 border border-purple-500/20 p-3 rounded-2xl mb-2">
                      <p className="text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Zap size={10} /> Feed Global
                      </p>
                      <p className="text-white/40 text-[9px] leading-tight">Adicione posts que aparecerão para TODOS os usuários do seu site.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-white/40 text-[9px] uppercase font-black ml-1">Username</label>
                        <input
                          type="text"
                          placeholder="ex: neymarjr"
                          value={newPost.username}
                          onChange={e => setNewPost({ ...newPost, username: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[11px] outline-none focus:border-white/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-white/40 text-[9px] uppercase font-black ml-1">Foto Perfil (URL)</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={newPost.authorPic}
                          onChange={e => setNewPost({ ...newPost, authorPic: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[11px] outline-none focus:border-white/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-white/40 text-[9px] uppercase font-black ml-1">Vídeo Link (OPCIONAL)</label>
                        <input
                          type="text"
                          placeholder="https://...mp4"
                          value={newPost.videoUrl}
                          onChange={e => setNewPost({ ...newPost, videoUrl: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[11px] outline-none focus:border-white/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-white/40 text-[9px] uppercase font-black ml-1">Imagem Capa/Post (URL)</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={newPost.img}
                          onChange={e => setNewPost({ ...newPost, img: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[11px] outline-none focus:border-white/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-white/40 text-[9px] uppercase font-black ml-1">Legenda</label>
                        <textarea
                          placeholder="Escreva aqui..."
                          value={newPost.caption}
                          onChange={e => setNewPost({ ...newPost, caption: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[11px] outline-none focus:border-white/20 h-20 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-white/40 text-[9px] uppercase font-black ml-1">Likes</label>
                          <input
                            type="number"
                            value={newPost.likes}
                            onChange={e => setNewPost({ ...newPost, likes: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[11px] outline-none focus:border-white/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-white/40 text-[9px] uppercase font-black ml-1">Comments</label>
                          <input
                            type="number"
                            value={newPost.comments}
                            onChange={e => setNewPost({ ...newPost, comments: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[11px] outline-none focus:border-white/20"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleSavePost}
                        disabled={isSavingPost}
                        className={`w-full py-4 mt-2 rounded-[22px] font-black uppercase text-[12px] tracking-widest transition-all ${isSavingPost ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.2)]'}`}
                      >
                        {isSavingPost ? 'Salvando...' : 'Adicionar ao Feed'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 relative z-10 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-white/40 text-[9px] uppercase font-black tracking-wider ml-1">Checkout Principal</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-3 focus-within:border-purple-500/50 transition-all">
                          <span className="text-white font-black mr-2">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={config.prices.main}
                            onChange={(e) => setConfig({ ...config, prices: { ...config.prices, main: e.target.value } })}
                            className="bg-transparent border-none outline-none text-white font-black w-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-white/40 text-[9px] uppercase font-black tracking-wider ml-1">Aviso de Segurança (Privacy)</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-3 focus-within:border-purple-500/50 transition-all">
                          <span className="text-white font-black mr-2">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={config.prices.upsell1}
                            onChange={(e) => setConfig({ ...config, prices: { ...config.prices, upsell1: e.target.value } })}
                            className="bg-transparent border-none outline-none text-white font-black w-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-white/40 text-[9px] uppercase font-black tracking-wider ml-1">Furar Fila (Ghost Mode)</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-3 focus-within:border-purple-500/50 transition-all">
                          <span className="text-white font-black mr-2">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={config.prices.upsell2}
                            onChange={(e) => setConfig({ ...config, prices: { ...config.prices, upsell2: e.target.value } })}
                            className="bg-transparent border-none outline-none text-white font-black w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => updateRemoteConfig(config)}
                      className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-[12px] shadow-[0_10px_30px_rgba(168,85,247,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                    >
                      <RotateCcw size={16} />
                      Salvar Alterações
                    </button>

                    <p className="text-[8px] text-white/20 text-center uppercase font-bold tracking-widest">Alterar aqui atualiza o Banco de Dados</p>
                  </div>
                )}
              </div>
            )}

            {/* Main Toggle Button */}
            <button
              onClick={() => {
                if (!isDragging.current) setIsDevMenuOpen(!isDevMenuOpen);
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onMouseDown={handleMouseDown}
              style={{ touchAction: 'none' }}
              className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.4)] border border-white/20 active:scale-90 transition-all pointer-events-auto cursor-grab active:cursor-grabbing"
            >
              {isDevMenuOpen ? <ChevronDown size={28} className="text-white" /> : <Settings size={28} className={`text-white animate-spin ${step === 'hacking' ? '[animation-duration:1s]' : '[animation-duration:4s]'}`} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
