import React, { useState, useEffect, useRef } from 'react';

interface CtaProps {
    username: string;
    profilePic: string;
    stats: {
        posts: string;
        followers: string;
        following: string;
    };
    price: number;
    onCheckoutStart: (amount: number) => void;
}

export const Cta: React.FC<CtaProps> = ({ username, profilePic, stats, price, onCheckoutStart }) => {
    const [timeLeft, setTimeLeft] = useState(480);
    const [currentPrice, setCurrentPrice] = useState(price); // Track current price
    const [priceStage, setPriceStage] = useState(0); // 0 = initial, 1 = second stage, 2 = final
    const [isPaused, setIsPaused] = useState(false); // Timer pause state
    const [timerStarted, setTimerStarted] = useState(false); // Start only when visible
    const timerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // SEMPRE resetar para o início quando a página carregar
        setPriceStage(0);
        setCurrentPrice(price);
        setTimeLeft(480);
        setIsPaused(false);

        // Limpar localStorage do timer (mas NÃO limpar o checkout_started)
        localStorage.setItem('stalkea_cta_stage', '0');
        localStorage.setItem('stalkea_cta_remaining', '480');
        localStorage.setItem('stalkea_cta_paused', 'false');
        localStorage.setItem('stalkea_cta_end', String(Date.now() + 480 * 1000));

        // Sync com API
        (async () => {
            try {
                await fetch('/api/track-ip', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        cta_stage: 0,
                        cta_remaining: 480,
                        cta_end: Date.now() + 480 * 1000,
                        durationMinutes: 60
                    })
                });
            } catch { }
        })();
    }, [price, username]);

    useEffect(() => {
        if (!timerStarted) return;
        const timer = setInterval(() => {
            if (!isPaused) {
                setTimeLeft((prev) => {
                    if (prev > 0) {
                        const newTime = prev - 1;
                        try {
                            localStorage.setItem('stalkea_cta_remaining', String(newTime));
                            // Atualizar o end time também
                            const endTime = Date.now() + newTime * 1000;
                            localStorage.setItem('stalkea_cta_end', String(endTime));
                        } catch { }
                        return newTime;
                    } else {
                        // Timer reached zero
                        console.log('Timer reached zero, priceStage:', priceStage);
                        if (priceStage === 0) {
                            console.log('Updating to stage 1, price 47.01');
                            setCurrentPrice(47.01);
                            setPriceStage(1);
                            const next = 300;
                            try {
                                localStorage.setItem('stalkea_cta_stage', '1');
                                localStorage.setItem('stalkea_cta_remaining', String(next));
                                localStorage.setItem('stalkea_cta_end', String(Date.now() + next * 1000));
                                localStorage.setItem('stalkea_cta_paused', 'false');
                                fetch('/api/track-ip', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ username, cta_stage: 1, cta_remaining: next, cta_end: Date.now() + next * 1000, durationMinutes: 60 })
                                }).catch(() => { });
                            } catch { }
                            return next;
                        } else if (priceStage === 1) {
                            console.log('Updating to stage 2, price 68.90');
                            setCurrentPrice(68.90);
                            setPriceStage(2);
                            try {
                                localStorage.setItem('stalkea_cta_stage', '2');
                                localStorage.setItem('stalkea_cta_remaining', '0');
                                localStorage.setItem('stalkea_cta_end', String(Date.now()));
                                localStorage.setItem('stalkea_cta_paused', 'false');
                                fetch('/api/track-ip', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ username, cta_stage: 2, cta_remaining: 0, cta_end: Date.now(), durationMinutes: 60 })
                                }).catch(() => { });
                            } catch { }
                            return 0;
                        }
                        return 0;
                    }
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [priceStage, isPaused, timerStarted, username]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [chatStep, setChatStep] = useState(0);
    const [testimonialStep, setTestimonialStep] = useState(0);
    const [touchStartX, setTouchStartX] = useState(0);
    const [userCity, setUserCity] = useState<string>("");
    const [isWifi, setIsWifi] = useState<boolean>(false);
    const [address, setAddress] = useState<{ city?: string; town?: string; village?: string; municipality?: string; road?: string; house_number?: string; suburb?: string } | null>(null);

    useEffect(() => {
        const detection = async () => {
            try {
                const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
                if (conn) {
                    const type = conn.type || conn.effectiveType;
                    if (type === 'wifi' || type === '4g') setIsWifi(true);
                }

                // TENTATIVA 1: IPWHO.IS (Mais permissiva e sem chave)
                try {
                    const res = await fetch('https://ipwho.is/');
                    const data = await res.json();
                    if (data && data.success && data.city) {
                        setUserCity(data.city);
                    } else {
                        throw new Error('IPWho falhou');
                    }
                } catch (e) {
                    // TENTATIVA 2: IPAPI.CO (Fallback clássico)
                    try {
                        const res = await fetch('https://ipapi.co/json/');
                        const data = await res.json();
                        if (data && data.city) {
                            setUserCity(data.city);
                        } else {
                            throw new Error('IpApi falhou');
                        }
                    } catch (e2) {
                        // TENTATIVA 3: DB-IP (Último recurso)
                        try {
                            const res = await fetch('https://api.db-ip.com/v2/free/self');
                            const data = await res.json();
                            if (data && data.city) {
                                setUserCity(data.city);
                            }
                        } catch (e3) {
                            console.error('Todas as APIs de localização falharam');
                            setUserCity("Brasil"); // Fallback final genérico
                        }
                    }
                }


            } catch (e) {
                setUserCity("");
            }
        };
        detection();
    }, []);

    const testimonials = [
        {
            name: 'Marcos_Souza22',
            time: '5 min',
            text: 'krl desbloqueou na hora msm, tava com medo mas eh real',
            img: 'https://i.pinimg.com/736x/3f/10/a6/3f10a679322381b137d4dac84457b4a7.jpg'
        },
        {
            name: 'Joao_Vitor.P',
            time: '12 min',
            text: 'muito facil, ja apareceu tudo desbloqueado, top',
            img: 'https://i.pinimg.com/736x/83/43/24/834324e417965150710c1fd0faf96ea8.jpg'
        },
        {
            name: 'Julio.mendes',
            time: '20 min',
            text: 'nossa gente funciona mesmo!! ja liberou o acesso kkkk',
            img: 'https://i.pinimg.com/736x/8d/49/95/8d499542964d0a0f2e4b167ec75f7c5f.jpg'
        },
        {
            name: 'Fernando_lima',
            time: '32 min',
            text: 'pode confiar, liberou instantaneo, muito rapido',
            img: 'https://i.pinimg.com/736x/ff/8a/33/ff8a3356234e5e94596d33ee0d2e4c6d.jpg'
        },
        {
            name: 'Carlos_eduardo',
            time: '45 min',
            text: 'top demais, liberou tudo na hora. vale cada centavo',
            img: 'https://i.pinimg.com/736x/d5/7c/8c/d57c8c893ce4d79b7f0565f30173b0c9.jpg'
        },
        {
            name: 'Beatriz.souza',
            time: '1h',
            text: 'amei a praticidade, na mesma hora ja consegui ver tudo, super recomendo',
            img: 'https://i.pinimg.com/736x/d3/e4/9b/d3e49bec46d4c38a295ecd24cf0ecebe.jpg'
        },
        {
            name: 'Mariana_oliveira',
            time: '1h',
            text: 'gente é verdade mesmo, liberou na hora, muito rapido',
            img: 'https://i.pinimg.com/736x/97/53/89/9753899b2380012bffaa9d298631033c.jpg'
        },
        {
            name: 'Camila.martins',
            time: '2h',
            text: 'muito bom, ja desbloqueou, sem enrolacao. nota 10',
            img: 'https://i.pinimg.com/736x/e1/2a/4a/e12a4a7fab8543740c091559e54e9101.jpg'
        },
        {
            name: 'Larissa_silva',
            time: '2h',
            text: 'surreal de rapido, ja liberou o acesso completo, to passada',
            img: 'https://i.pinimg.com/736x/ae/47/13/ae47130f1307a562ef0bbe02d31e1209.jpg'
        },
        {
            name: 'Amanda.costa',
            time: '3h',
            text: 'melhor investimento, ja to usando, liberou na hora',
            img: 'https://i.pinimg.com/736x/ac/27/d8/ac27d8d33c19a0f4d0fc90f1139c27a7.jpg'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTestimonialStep(prev => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [testimonialStep]); // Reset interval whenever step changes (auto or manual)

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (diff > 50) {
            // Swipe Left -> Next
            setTestimonialStep((prev) => (prev + 1) % testimonials.length);
        } else if (diff < -50) {
            // Swipe Right -> Prev
            setTestimonialStep((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        }
    };

    useEffect(() => {
        // Loop Infinito do Chat com etapas de digitação - VERSÃO TURBO
        const runChatLoop = () => {
            setChatStep(0); // Alvo digitando
            setTimeout(() => setChatStep(1), 800); // Mensagem do alvo aparece (Mais rápido)
            setTimeout(() => setChatStep(2), 1800); // Usuário digitando (você)
            setTimeout(() => setChatStep(3), 2800); // Sua resposta aparece
            setTimeout(() => setChatStep(4), 5000); // Pausa menor antes de reiniciar
        };

        runChatLoop();
        const mainInterval = setInterval(runChatLoop, 6500); // Reinicia o ciclo a cada 6.5s

        return () => clearInterval(mainInterval);
    }, []);

    useEffect(() => {
        const el = timerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !timerStarted) {
                    try {
                        const endStr = localStorage.getItem('stalkea_cta_end');
                        const paused = localStorage.getItem('stalkea_cta_paused') === 'true';

                        if (!paused) {
                            // Se não estiver pausado, garantir que o end time está correto
                            if (!endStr || endStr === 'null') {
                                const newEndTime = Date.now() + timeLeft * 1000;
                                localStorage.setItem('stalkea_cta_end', String(newEndTime));
                            }
                            localStorage.setItem('stalkea_cta_paused', 'false');
                        }

                        fetch('/api/track-ip', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, cta_stage: priceStage, cta_remaining: timeLeft, cta_end: Date.now() + timeLeft * 1000, durationMinutes: 60 })
                        }).catch(() => { });
                    } catch { }
                    setTimerStarted(true);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [timerStarted, timeLeft, priceStage, username]);

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleCheckout = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsPaused(true); // Pause the timer
        try {
            localStorage.setItem('stalkea_cta_paused', 'true');
            localStorage.setItem('stalkea_cta_remaining', String(timeLeft));
            localStorage.removeItem('stalkea_cta_end');
            fetch('/api/track-ip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, cta_stage: priceStage, cta_remaining: timeLeft, durationMinutes: 60 })
            }).catch(() => { });
        } catch { }
        onCheckoutStart(currentPrice);
    };

    return (
        <div
            className="vip-original-wrapper fixed inset-0 overflow-y-auto overflow-x-hidden no-scrollbar bg-black z-[100] max-w-[500px] mx-auto pb-24 touch-pan-y"
        >

            <link rel="stylesheet" href="/Stalkea.ai - a maior ferramenta de stalker do Brasil._files/cta.css" />
            <style>{`
                @keyframes shine-wave {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes blink {
                    0%, 49% { opacity: 1; }
                    50%, 100% { opacity: 0.3; }
                }
                @keyframes pulse-text {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.08); opacity: 0.75; }
                }
                @keyframes pulse-red {
                    0%, 100% { 
                        transform: scale(1); 
                        opacity: 1;
                        text-shadow: 0 0 5px rgba(220, 38, 38, 0.5);
                    }
                    50% { 
                        transform: scale(1.12); 
                        opacity: 0.85;
                        text-shadow: 0 0 15px rgba(220, 38, 38, 0.8);
                    }
                }
                .shine-purple-text {
                    background: linear-gradient(90deg, #6B59D8 0%, #a855f7 35%, #fff 50%, #a855f7 65%, #6B59D8 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shine-wave 4s linear infinite;
                    display: inline-block;
                    font-weight: 900;
                }
                .vip-original-wrapper {
                    background: #040607;
                    color: #F9F9F9;
                    font-family: -apple-system, sans-serif;
                    overflow-y: auto !important;
                    height: 100%;
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior-y: contain;
                }
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                @keyframes marquee-infinite {
                    0% { transform: translateX(0) translateZ(0); }
                    100% { transform: translateX(-50%) translateZ(0); }
                }
                @keyframes snake-border {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <div className="container relative z-10">
                {/* Logo e Título */}
                <div className="logo-section fade-in-up delay-0">
                    <div className="flex items-center gap-2 mb-4 justify-center">
                        <img src="https://i.ibb.co/9m6pG513/f85d6e00-b101-4f91-9aff-0f3b3a3f1d09.png" alt="Stalkea.ai" width="56" height="56" loading="lazy" className="h-14 w-auto object-contain drop-shadow-[0_0_18px_rgba(255,255,255,0.25)]" />
                    </div>
                    <h1 className="main-title">
                        A maior ferramenta<br />de <span className="gradient">Stalker</span> do Brasil
                    </h1>
                </div>

                {/* Profile Card */}
                <div className="profile-card visible fade-in-up delay-2" style={{ display: 'block !important' }}>
                    <div className="profile-card-content">
                        <div className="profile-card-avatar-wrapper">
                            <div className="profile-card-avatar-border">
                                <div className="profile-card-avatar-inner">
                                    <img alt="Perfil" src={profilePic} className="profile-card-avatar-img" />
                                </div>
                            </div>
                        </div>
                        <div className="profile-card-info">
                            <h2 className="profile-card-username">{username}</h2>
                            <p className="profile-card-name">@{username}</p>
                            <div className="profile-card-stats">
                                <div className="profile-card-stat">
                                    <span className="profile-card-stat-number">{stats.posts}</span>
                                    <span className="profile-card-stat-label"> posts</span>
                                </div>
                                <div className="profile-card-stat">
                                    <span className="profile-card-stat-number">{stats.followers}</span>
                                    <span className="profile-card-stat-label"> seguidores</span>
                                </div>
                                <div className="profile-card-stat">
                                    <span className="profile-card-stat-number">{stats.following}</span>
                                    <span className="profile-card-stat-label"> seguindo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badge */}
                <div className="profile-card-badge fade-in-up delay-4">
                    <p className="badge-text">
                        <strong className="badge-title">Espionagem 100% finalizada!</strong>
                        <span className="emoji-confetti">🥳</span>
                        <br />
                        <span className="badge-line-1">Adquira seu acesso completo e tenha</span>
                        <br />
                        <span className="badge-line-2">acesso imediatamente a:</span>
                    </p>
                </div>

                {/* Features Section */}
                <div className="features-section">
                    {/* Mídias */}
                    <div className="feature-item fade-in-up delay-6" style={{ marginTop: '30px', marginBottom: '30px' }}>
                        <div className="feature-header" style={{ textAlign: 'center', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B59D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <h3 className="feature-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Veja Mídias de {username}</h3>
                            </div>
                            <p style={{ color: 'rgba(249, 249, 249, 0.6)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                                Veja todas as mídias recebidas e enviadas,<br />incluindo itens apagados.
                            </p>
                        </div>

                        <div className="media-grid-block" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '10px',
                            padding: '0 5px',
                            maxWidth: '380px',
                            margin: '0 auto'
                        }}>
                            {/* Large Image (2x2) occupying first 2 rows and columns */}
                            <div style={{
                                gridArea: 'span 2 / span 2',
                                position: 'relative',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                background: '#111',
                                border: '1px solid rgba(255,255,255,0.05)',
                                aspectRatio: '1/1'
                            }}>
                                <img src={`https://stalkea.ai/assets/images/screenshots/fotoblur1.jpg`} loading="lazy" decoding="async" fetchPriority="low" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, filter: 'blur(70px)' }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', gap: '12px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '50%', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex' }}>
                                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700, opacity: 0.9 }}>Conteúdo restrito</span>
                                </div>
                            </div>

                            {/* Small Images filling the rest of the 3x3 grid */}
                            {[
                                'https://stalkea.ai/assets/images/screenshots/nudes1-chat1.jpg',
                                'https://stalkea.ai/assets/images/screenshots/nudes1-chat2.jpg',
                                'https://stalkea.ai/assets/images/screenshots/chat5.1a.png',
                                'https://stalkea.ai/assets/images/screenshots/chat2.nudes1.png',
                                'https://stalkea.ai/assets/images/screenshots/pack1.1.chat2.png'
                            ].map((src, i) => (
                                <div key={i} style={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    aspectRatio: '1/1',
                                    background: '#111',
                                    position: 'relative',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <img src={src} loading="lazy" decoding="async" fetchPriority="low" style={{ filter: 'blur(15px)', opacity: 0.7, width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stories e posts ocultos */}
                    <div className="feature-item fade-in-up delay-8" style={{ marginTop: '50px', marginBottom: '30px' }}>
                        <div className="feature-header" style={{ textAlign: 'center', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B59D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <h3 className="feature-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>stories e posts ocultos</h3>
                            </div>
                            <p style={{ color: 'rgba(249, 249, 249, 0.6)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                Veja stories que já sumiram e conteúdos<br />que <strong>{username}</strong> ocultou de você.
                            </p>
                        </div>

                        <div className="hidden-content-grid" style={{
                            display: 'flex',
                            gap: '16px',
                            padding: '0 10px',
                            justifyContent: 'center'
                        }}>
                            {/* Card 1 */}
                            <div style={{
                                flex: 1,
                                maxWidth: '165px',
                                aspectRatio: '9/16',
                                background: '#111',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <img src="https://i.pinimg.com/736x/ff/3e/29/ff3e293cdd6063bced3d543c4a2b7723.jpg" loading="lazy" decoding="async" fetchPriority="low" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(15px)', opacity: 0.7 }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)' }}>
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700, opacity: 0.9 }}>Conteúdo restrito</span>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div style={{
                                flex: 1,
                                maxWidth: '165px',
                                aspectRatio: '9/16',
                                background: '#111',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <img src="https://i.pinimg.com/736x/94/41/37/944137134411660277987e31bcfd8e6b.jpg" loading="lazy" decoding="async" fetchPriority="low" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(15px)', opacity: 0.7 }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)' }}>
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700, opacity: 0.9 }}>Conteúdo restrito</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mensagens do Direct */}
                    <div className="feature-item fade-in-up delay-10" style={{ marginTop: '50px', marginBottom: '30px' }}>
                        <div className="feature-header" style={{ textAlign: 'center', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B59D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                </svg>
                                <h3 className="feature-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Mensagens de Direct</h3>
                            </div>
                            <p style={{ color: 'rgba(249, 249, 249, 0.6)', fontSize: '0.95rem' }}>
                                Veja literalmente todas as mensagens de<br /><strong>{username}</strong>, incluindo mensagens temporárias.
                            </p>
                        </div>

                        <div className="direct-chat-mock" style={{
                            background: '#1A1A1A',
                            borderRadius: '32px',
                            padding: '24px',
                            maxWidth: '400px',
                            margin: '0 auto',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '25px', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(249, 249, 249, 0.1)' }}>
                                        <img src={profilePic} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                        <p style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>{username}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
                                            <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 600 }}>online</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', color: 'white' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minHeight: '130px' }}>
                                {/* Step 0: Target Typing */}
                                {chatStep === 0 && (
                                    <div style={{ alignSelf: 'start', display: 'flex', gap: '4px', padding: '12px 18px', background: '#262626', borderRadius: '24px', borderBottomLeftRadius: '4px' }}>
                                        <div className="dot-typing" style={{ width: '5px', height: '5px', background: '#8e8e8e', borderRadius: '50%', animation: 'chat-dot 1s infinite' }}></div>
                                        <div className="dot-typing" style={{ width: '5px', height: '5px', background: '#8e8e8e', borderRadius: '50%', animation: 'chat-dot 1s infinite 0.2s' }}></div>
                                        <div className="dot-typing" style={{ width: '5px', height: '5px', background: '#8e8e8e', borderRadius: '50%', animation: 'chat-dot 1s infinite 0.4s' }}></div>
                                    </div>
                                )}

                                {/* Step 1+: Target Message */}
                                {chatStep >= 1 && (
                                    <div className="fade-in-up" style={{ background: '#262626', padding: '14px 20px', borderRadius: '24px', borderBottomLeftRadius: '4px', alignSelf: 'start', maxWidth: '85%' }}>
                                        <p style={{ color: 'white', fontSize: '0.95rem', fontWeight: 500, lineHeight: '1.4' }}>E aí, bora ver tudo do instagram de {username}?</p>
                                    </div>
                                )}

                                {/* Step 2: User Typing (You) */}
                                {chatStep === 2 && (
                                    <div style={{ alignSelf: 'end', display: 'flex', gap: '4px', padding: '12px 18px', background: 'linear-gradient(135deg, #6B59D8, #8B2C8B)', borderRadius: '24px', borderBottomRightRadius: '4px', opacity: 0.8 }}>
                                        <div className="dot-typing" style={{ width: '5px', height: '5px', background: 'white', borderRadius: '50%', animation: 'chat-dot 1s infinite' }}></div>
                                        <div className="dot-typing" style={{ width: '5px', height: '5px', background: 'white', borderRadius: '50%', animation: 'chat-dot 1s infinite 0.2s' }}></div>
                                        <div className="dot-typing" style={{ width: '5px', height: '5px', background: 'white', borderRadius: '50%', animation: 'chat-dot 1s infinite 0.4s' }}></div>
                                    </div>
                                )}

                                {/* Step 3+: User Message */}
                                {chatStep >= 3 && (
                                    <div className="fade-in-up" style={{ background: 'linear-gradient(135deg, #6B59D8, #8B2C8B)', padding: '14px 20px', borderRadius: '24px', borderBottomRightRadius: '4px', alignSelf: 'end', maxWidth: '85%', boxShadow: '0 8px 20px rgba(107, 89, 216, 0.3)' }}>
                                        <p style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, lineHeight: '1.4' }}>Boraa, vou comprar meu acesso completo 🔥</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Localização Premium (Reference Style) */}
                    <div className="feature-item fade-in-up delay-12" style={{ marginTop: '40px' }}>
                        <div className="feature-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B59D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <h3 className="feature-title" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Localização em tempo real</h3>
                            </div>
                            <p style={{ color: 'rgba(249, 249, 249, 0.6)', fontSize: '0.9rem' }}>
                                Veja onde {username} está agora, e<br />os últimos locais por onde passou.
                            </p>
                        </div>

                        <div className="location-card-container" style={{
                            background: '#1A1A1A',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
                        }}>
                            {/* Map Area */}
                            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                                <img src="https://i.ibb.co/dsdLwYhj/276fd2d9-9819-433a-a684-7eb332a96a26.png" alt="Mapa" width="800" height="180" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) saturate(1.1)' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(26,26,46,0.5) 0%, rgba(10,10,10,0.7) 100%)' }}></div>

                                {/* Centered Avatar Block with Multiple Pulses */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 10
                                }}>
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="location-pulse" style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: 'rgba(124, 58, 237, 0.6)',
                                            animation: `pulse-location 2.5s infinite ${i * 0.8}s`,
                                            pointerEvents: 'none',
                                            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)'
                                        }}></div>
                                    ))}
                                    <div style={{
                                        position: 'relative',
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        border: '3px solid white',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                                        background: '#222'
                                    }}>
                                        <img src={profilePic} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div >

                    {/* Testimonials & Warning Sections */}
                    <div className="fade-in-up delay-13" style={{ marginTop: '50px', marginBottom: '30px' }}>
                        {/* Down Arrow Indicator */}
                        < div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', opacity: 0.5 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
                                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                            </svg>
                        </div >


                        {/* Sensitive Information Warning */}
                        <div className="fade-in-up delay-13" style={{
                            background: 'rgba(20, 5, 5, 0.9)',
                            borderRadius: '24px',
                            padding: '25px',
                            border: '1px solid rgba(220, 38, 38, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginTop: '60px',
                            marginBottom: '60px',
                            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 15px rgba(220, 38, 38, 0.1)',
                            position: 'relative',
                            zIndex: 5
                        }}>
                            <div style={{ flexShrink: 0, animation: 'pulse-red 2s infinite' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
                                </svg>
                            </div>
                            <p style={{ color: '#F87171', fontSize: '0.95rem', fontWeight: 600, lineHeight: '1.5' }}>
                                As informações acessadas são <strong style={{ color: '#ef4444', textShadow: '0 0 10px rgba(239, 68, 68, 0.3)' }}>extremamente sensíveis</strong>. Use com responsabilidade.
                            </p>
                        </div>
                    </div >

                    {/* Tool Section (Premium Pricing) - VERSÃO ULTRA COMPACTA */}
                    <div className="tool-section fade-in-up delay-14" style={{
                        position: 'relative',
                        marginTop: '60px',
                        marginBottom: '60px',
                        background: '#0a0a0a',
                        borderRadius: '24px',
                        padding: '25px 15px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                        textAlign: 'center',
                        overflow: 'hidden' // Garante que o marquee não vaze
                    }}>


                        <div className="pricing-header" style={{ marginBottom: '15px' }}>



                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '18px',
                            }}>
                                <span style={{
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    letterSpacing: '2.5px',
                                    textTransform: 'uppercase',
                                }}>
                                    {priceStage === 0 ? 'Oferta Exclusiva' : 'Última Chance'}
                                </span>
                            </div>

                            <p className="pricing-old-price" style={{
                                textDecoration: 'line-through',
                                color: 'rgba(255, 255, 255, 0.15)',
                                fontSize: '0.9rem',
                                marginBottom: '2px',
                                fontWeight: 500
                            }}>De: R$ 279,90</p>

                            <div className="pricing-current-price" style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'center',
                                gap: '3px'
                            }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>R$</span>
                                <span style={{ fontSize: '4.2rem', fontWeight: 900, color: 'white', lineHeight: '0.8', letterSpacing: '-2px' }}>
                                    {Math.floor(currentPrice)}
                                </span>
                                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
                                    ,{(currentPrice % 1).toFixed(2).split('.')[1]}
                                </span>
                            </div>
                        </div>

                        <div className="benefits-list" style={{
                            textAlign: 'left',
                            maxWidth: '380px',
                            margin: '0 auto 20px auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            {[
                                `Todas as mensagens do direct de ${username}`,
                                "Todas as fotos sem censura (incluindo apagadas)",
                                "Localização em tempo real e locais que esteve",
                                `Alerta quando ${username} interagir com alguém`,
                                "2 bônus surpresa avaliados em R$120,00"
                            ].map((text, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.04)',
                                    borderRadius: '12px',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B59D8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        fontWeight: i === 4 ? 800 : 500,
                                        color: i === 4 ? '#a855f7' : 'rgba(255,255,255,0.9)',
                                        lineHeight: '1.2'
                                    }}>{text}</span>
                                </div>
                            ))}
                        </div>

                        <button onClick={handleCheckout} className="premium-cta-btn" style={{
                            width: '100%',
                            padding: '18px',
                            background: "url('https://i.ibb.co/k28d2vmJ/original-52cf3a971cd1054bf2985d8f34a9a056.gif') center center / cover no-repeat",
                            border: 'none',
                            borderRadius: '16px',
                            color: 'white',
                            fontWeight: 900,
                            fontSize: '1.15rem',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 0 4px rgba(168, 85, 247, 0.2)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            marginBottom: '20px',
                            animation: 'pulse-btn 2s infinite'
                        }}>
                            <span style={{
                                position: 'relative',
                                zIndex: 2,
                                color: 'white',
                                background: 'transparent'
                            }}>DESBLOQUEAR TUDO AGORA</span>
                        </button>

                        <div className="guarantee-card" style={{
                            background: 'rgba(22, 22, 22, 0.4)',
                            border: '1px solid rgba(34, 197, 94, 0.08)',
                            borderRadius: '16px',
                            padding: '15px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '6px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                                <span style={{ color: '#22c55e', fontWeight: 900, fontSize: '0.95rem' }}>Garantia de 30 Dias</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)', lineHeight: '1.3', fontWeight: 500 }}>
                                Garantimos sua satisfação ou devolvemos 100% do valor.
                            </p>
                        </div>
                    </div >


                    {/* Testimonials Card */}
                    <div className="fade-in-up delay-15" style={{
                        background: '#0D0D0D',
                        borderRadius: '32px',
                        padding: '35px 25px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        textAlign: 'center',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                        marginBottom: '40px',
                        marginTop: '30px'
                    }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', lineHeight: '1.2', marginBottom: '25px' }}>
                            Veja o que falam as pessoas que usam o <span className="shine-purple-text">Stalkea.ai</span>
                        </h2>

                        <div
                            key={testimonialStep}
                            className="fade-in-up"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '24px',
                                padding: '25px',
                                textAlign: 'left',
                                border: '1px solid rgba(255,255,255,0.03)',
                                position: 'relative',
                                minHeight: '160px',
                                cursor: 'grab',
                                userSelect: 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #6B59D8' }}>
                                    <img
                                        src={testimonials[testimonialStep].img}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        alt="User"
                                    />
                                </div>
                                <div>
                                    <p style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem' }}>{testimonials[testimonialStep].name}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{testimonials[testimonialStep].time}</p>
                                </div>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {testimonials[testimonialStep].text}
                            </p>
                        </div>

                        {/* Pagination Dots */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                            {testimonials.map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: i === testimonialStep ? '30px' : '8px',
                                        height: '8px',
                                        background: i === testimonialStep ? '#6B59D8' : 'rgba(255,255,255,0.2)',
                                        borderRadius: '10px',
                                        transition: 'all 0.3s ease'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div >

                    {/* FAQ Premium Accordion (Reference Style) */}
                    <div className="faq-section fade-in-up delay-15" style={{ marginTop: '50px', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: '30px', color: 'white' }}>Perguntas Frequentes</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { q: 'A ferramenta realmente funciona?', a: 'Sim! Utilizamos protocolos de segurança avançados para descriptografar os pacotes de dados do Instagram em tempo real.' },
                                { q: 'A pessoa vai saber que eu stalkeei o perfil dela?', a: 'Não. O monitoramento é 100% invisível. O alvo nunca recebe notificações e você não precisa fazer login com sua conta.' },
                                { q: 'Funciona em perfis privados?', a: 'Sim! Nossa tecnologia consegue acessar metadados de contas privadas sem a necessidade de seguir o perfil.' },
                                { q: 'Preciso instalar alguma coisa?', a: 'Não. O sistema funciona 100% em nuvem. Você acessa tudo pelo seu navegador de forma segura e rápida.' },
                                { q: 'Como funciona a garantia?', a: 'Oferecemos 30 dias de garantia incondicional. Se não ficar satisfeito, devolvemos 100% do seu dinheiro imediatamente.' },
                                { q: 'Quanto tempo tenho acesso?', a: 'O acesso é vitalício! Uma vez adquirido, você pode usar a ferramenta para sempre, sem mensalidades ou renovações.' }
                            ].map((item, i) => (
                                <div key={i}
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        borderRadius: '14px',
                                        border: '1px solid rgba(255,255,255,0.03)',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{
                                        padding: '18px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <p style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem', color: '#f9f9f9', paddingRight: '15px' }}>{item.q}</p>
                                        <div style={{ color: '#6B59D8', fontSize: '1.4rem', fontWeight: 300, transition: 'transform 0.3s ease', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                                            {openFaq === i ? '✕' : '+'}
                                        </div>
                                    </div>
                                    {openFaq === i && (
                                        <div style={{ padding: '0 20px 20px 20px' }}>
                                            <p style={{ fontSize: '0.88rem', color: 'rgba(249, 249, 249, 0.6)', lineHeight: '1.5' }}>
                                                {item.a}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <style>{`
                @keyframes pinkWave {
                    0% { background-position: 200% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .pricing-old-price {
                    text-decoration: line-through;
                    color: #666;
                }
                .benefit-item {
                    margin: 10px 0;
                }
                .gradient {
                    background: linear-gradient(135deg, #4a37b6 0%, #ab58f4 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                 @keyframes pulse-location {
                    0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.9; }
                    100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
                }
                .premium-cta-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 40px rgba(107, 89, 216, 0.6) !important;
                }
                .premium-cta-btn:active {
                    transform: translateY(-1px);
                }
                .shine-effect {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        120deg,
                        transparent,
                        rgba(255, 255, 255, 0.3),
                        transparent
                    );
                    animation: shine-btn 3s infinite;
                    z-index: 1;
                }
                @keyframes shine-btn {
                    0% { left: -100%; }
                    20% { left: 100%; }
                    100% { left: 100%; }
                }
                @keyframes pulse-btn {
                    0% { transform: scale(1); box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 0 0 rgba(168, 85, 247, 0.4); }
                    50% { transform: scale(1.02); box-shadow: 0 0 25px rgba(168, 85, 247, 0.7), 0 0 0 10px rgba(168, 85, 247, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 0 0 rgba(168, 85, 247, 0); }
                }
                .fade-in-up {
                    opacity: 0;
                    transform: translateY(40px);
                    animation: fadeInUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                @keyframes fadeInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes chat-dot {
                    0%, 100% { transform: translateY(0px); opacity: 0.4; }
                    50% { transform: translateY(-5px); opacity: 1; }
                }
                .delay-0 { animation-delay: 0s; }
                .delay-1 { animation-delay: 0.2s; }
                .delay-2 { animation-delay: 0.4s; }
                .delay-3 { animation-delay: 0.6s; }
                .delay-4 { animation-delay: 0.8s; }
                .delay-5 { animation-delay: 1.0s; }
                .delay-6 { animation-delay: 1.2s; }
                .delay-7 { animation-delay: 1.4s; }
                .delay-8 { animation-delay: 1.6s; }
                .delay-9 { animation-delay: 1.8s; }
                .delay-10 { animation-delay: 2.0s; }
                .delay-11 { animation-delay: 2.2s; }
                .delay-12 { animation-delay: 2.4s; }
                .delay-13 { animation-delay: 2.6s; }
                .delay-14 { animation-delay: 2.8s; }
                .delay-15 { animation-delay: 3.0s; }
            `}</style>
            </div>
        </div>
    );
};
