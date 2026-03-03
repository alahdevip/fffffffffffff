import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './lib/supabase';
import {
    LayoutDashboard, ShoppingBag, Store, DollarSign, FileText,
    Settings, Search, Bell, Moon, ChevronDown, Eye, X,
    RefreshCcw, CheckCircle, Save, ShieldAlert, Activity,
    Target, Users, Terminal, Download, MapPin, User,
    CreditCard, Smartphone, Globe, Lock, Zap, Menu, Ban, Calendar, Clock, Filter, ChevronUp, BarChart3, ArrowDown
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area } from 'recharts';

// --- TYPES ---
interface AdminUser {
    ip: string;
    firstSeen: string;
    lastSeen: string;
    target: string;
    step: string;
    userAgent: string;
    city?: string;
    region?: string;
    postsCount?: number;
    storiesCount?: number;
    events: any[];
    checkout: {
        name?: string;
        email?: string;
        phone?: string;
        cpf?: string;
    };
    cart: {
        main: boolean;
        upsell1: boolean;
        upsell2: boolean;
    };
}

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'live' | 'sales' | 'leads' | 'settings'>('overview');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [rawLogs, setRawLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [soundEnabled, setSoundEnabled] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle

    // FILTERS STATE
    const [filterType, setFilterType] = useState('Todos');
    const [filterProduct, setFilterProduct] = useState('Todos os produtos');
    const [filterPeriod, setFilterPeriod] = useState('Hoje');
    const [overviewDateFilter, setOverviewDateFilter] = useState('');
    const [overviewTimeFilter, setOverviewTimeFilter] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // LEADS FILTER
    const [leadsDateFilter, setLeadsDateFilter] = useState('');
    const [leadsTimeFilter, setLeadsTimeFilter] = useState('');
    const [leadsFilterPeriod, setLeadsFilterPeriod] = useState('Todos');

    const liveTerminalRef = useRef<HTMLDivElement>(null);

    // --- NOTIFICATIONS (PUSH & TOAST) ---
    const [toasts, setToasts] = useState<Array<{ id: number, title: string, message: string, type: 'sale' | 'checkout' }>>([]);

    const addToast = (title: string, message: string, type: 'sale' | 'checkout') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message, type }]);
        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const sendPushNotification = (title: string, body: string, type: 'sale' | 'checkout' = 'sale') => {
        const iconUrl = 'https://i.ibb.co/9m6pG513/f85d6e00-b101-4f91-9aff-0f3b3a3f1d09.png';

        // 1. Visual Toast (In-App)
        addToast(title, body, type);

        // 2. System Notification (Background)
        if (!("Notification" in window)) return;

        // Custom Sound Effect (Cakto/Kiwify Style)
        const playChaChing = () => {
            const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=cha-ching-7053.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        };

        const trigger = () => {
            playChaChing();
            // Tenta vibrar o celular (padrão de "dinheiro": curto, curto, longo)
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

            const notification = new Notification(title, {
                body: body,
                icon: iconUrl,
                badge: iconUrl,
                tag: 'sales-notification',
                requireInteraction: true,
                image: iconUrl,
                vibrate: [100, 50, 100] // Fallback para browsers que suportam vibrate na notification option
            } as any);

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        };

        if (Notification.permission === "granted") {
            trigger();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    trigger();
                }
            });
        }
    };

    // --- DATA FETCHING (SUPABASE REALTIME) ---
    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            // 1. Fetch Logs
            const { data: logs, error } = await supabase
                .from('traffic_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(2000);

            if (error) throw error;

            setRawLogs(logs || []);

            // 2. Process Users (Aggregation)
            const userMap = new Map<string, AdminUser>();

            logs?.forEach((log: any) => {
                const meta = log.metadata || {};
                const key = log.ip || 'unknown';

                const existing = userMap.get(key);
                const currentEvents = existing?.events || [];

                const userData: AdminUser = existing || {
                    ip: log.ip,
                    firstSeen: log.created_at,
                    lastSeen: log.created_at,
                    target: log.target_user,
                    step: meta.step || 'home',
                    userAgent: log.device,
                    city: log.city || meta.city,
                    region: meta.region,
                    postsCount: 0,
                    storiesCount: 0,
                    events: [],
                    checkout: { name: meta.name, email: meta.email, phone: meta.phone, cpf: meta.cpf },
                    cart: { main: false, upsell1: false, upsell2: false }
                };

                if (new Date(log.created_at) > new Date(userData.lastSeen)) {
                    userData.lastSeen = log.created_at;
                    userData.step = meta.step || userData.step;
                    userData.target = log.target_user || userData.target;
                    if (log.city) userData.city = log.city;
                }
                if (new Date(log.created_at) < new Date(userData.firstSeen)) {
                    userData.firstSeen = log.created_at;
                }

                if (meta.name) userData.checkout.name = meta.name;
                if (meta.email) userData.checkout.email = meta.email;
                if (meta.phone) userData.checkout.phone = meta.phone;
                if (meta.cpf) userData.checkout.cpf = meta.cpf;

                if (meta.posts_count) userData.postsCount = meta.posts_count;
                if (meta.stories_count) userData.storiesCount = meta.stories_count;

                if (meta.payment_verified || log.event_type === 'Purchase') {
                    const val = parseFloat(meta.value || '0');
                    if (val > 30) userData.cart.main = true;
                    if (val > 14 && val < 20) userData.cart.upsell1 = true;
                    if (val > 10 && val < 14) userData.cart.upsell2 = true;
                }

                userData.events = [...currentEvents, { ...log, ...meta }];
                userMap.set(key, userData);
            });

            setUsers(Array.from(userMap.values()));

            // 3. Fetch Settings (Direct Supabase)
            try {
                const { data: settingsData, error: settingsError } = await supabase
                    .from('project_settings')
                    .select('*')
                    .eq('id', 'global')
                    .single();

                if (settingsData) {
                    setSettings({
                        prices: settingsData.prices || { main: 27, upsell1: 16, upsell2: 12 },
                        banned_ips: settingsData.banned_ips || []
                    });
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }

        } catch (e) {
            console.error("Sync Error:", e);
        } finally {
            setLoading(false);
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        // 1. Initial Fetch
        fetchData();

        // 2. Setup Realtime Subscription
        const channel = supabase
            .channel('traffic_logs_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'traffic_logs'
                },
                (payload) => {
                    const newLog = payload.new;
                    console.log('⚡ Realtime Event:', newLog);

                    // A. Update Raw Logs immediately
                    setRawLogs(prev => [newLog, ...prev].slice(0, 2000));

                    // B. Play Sound
                    if (soundEnabled) {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3');
                        audio.volume = 0.2;
                        audio.play().catch(() => { });
                    }

                    // C. Trigger Notifications
                    if (newLog.metadata?.payment_verified) {
                        const amount = parseFloat(newLog.metadata.amount || '27');
                        const commission = (amount * 0.9).toFixed(2);
                        sendPushNotification(
                            `🤑 VENDA REALIZADA! + R$ ${commission}`,
                            `Produto: Stalkea Premium\nCliente: ${newLog.metadata.name || 'Anônimo'}`,
                            'sale'
                        );
                    } else if (newLog.event_type === 'InitiateCheckout' && (newLog.metadata?.email || newLog.metadata?.phone)) {
                        sendPushNotification(
                            "🛒 PIX GERADO!",
                            `Cliente preencheu os dados.\nValor: R$ 27,00\nAguardando pagamento...`,
                            'checkout'
                        );
                    }

                    // C. Update Users List (Aggregation)
                    setUsers(prevUsers => {
                        const newUsers = [...prevUsers];
                        const key = newLog.ip || 'unknown';
                        const existingIdx = newUsers.findIndex(u => u.ip === key);
                        const meta = newLog.metadata || {};

                        if (existingIdx >= 0) {
                            // Update existing user
                            const u = newUsers[existingIdx];
                            u.lastSeen = newLog.created_at;
                            u.events.push({ ...newLog, ...meta });
                            if (meta.step) u.step = meta.step;
                            if (newLog.target_user) u.target = newLog.target_user;
                            if (newLog.city) u.city = newLog.city;

                            // Update Checkout Data
                            if (meta.name) u.checkout.name = meta.name;
                            if (meta.email) u.checkout.email = meta.email;
                            if (meta.phone) u.checkout.phone = meta.phone;
                            if (meta.cpf) u.checkout.cpf = meta.cpf;

                            // Update Feed Stats
                            if (meta.posts_count) u.postsCount = meta.posts_count;
                            if (meta.stories_count) u.storiesCount = meta.stories_count;

                            // Update Cart
                            if (meta.payment_verified || newLog.event_type === 'Purchase') {
                                const val = parseFloat(meta.value || '0');
                                if (val > 30) u.cart.main = true;
                                if (val > 14 && val < 20) u.cart.upsell1 = true;
                                if (val > 10 && val < 14) u.cart.upsell2 = true;
                            }

                            // Move to top
                            newUsers.splice(existingIdx, 1);
                            newUsers.unshift(u);
                        } else {
                            // Create new user
                            const newUser: AdminUser = {
                                ip: newLog.ip,
                                firstSeen: newLog.created_at,
                                lastSeen: newLog.created_at,
                                target: newLog.target_user,
                                step: meta.step || 'home',
                                userAgent: newLog.device,
                                city: newLog.city || meta.city,
                                region: meta.region,
                                postsCount: meta.posts_count || 0,
                                storiesCount: meta.stories_count || 0,
                                events: [{ ...newLog, ...meta }],
                                checkout: { name: meta.name, email: meta.email, phone: meta.phone, cpf: meta.cpf },
                                cart: {
                                    main: (meta.payment_verified && parseFloat(meta.value) > 30) || false,
                                    upsell1: (meta.payment_verified && parseFloat(meta.value) > 14 && parseFloat(meta.value) < 20) || false,
                                    upsell2: (meta.payment_verified && parseFloat(meta.value) > 10 && parseFloat(meta.value) < 14) || false
                                }
                            };
                            newUsers.unshift(newUser);
                        }
                        return newUsers;
                    });
                }
            )
            .subscribe();

        // Cleanup
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'live' && liveTerminalRef.current) {
            liveTerminalRef.current.scrollTop = 0;
        }
    }, [rawLogs, activeTab]);

    // --- ACTIONS ---
    const handleSaveSettings = async (newSettings: any) => {
        setSaveStatus('saving');
        try {
            const { error } = await supabase
                .from('project_settings')
                .upsert({
                    id: 'global',
                    prices: newSettings.prices,
                    banned_ips: newSettings.banned_ips
                });

            if (error) throw error;

            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
            fetchData();
        } catch (e) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    const handleBanIP = async (ip: string) => {
        if (!settings) return;
        const currentBans = settings.banned_ips || [];
        if (currentBans.includes(ip)) {
            addToast('IP Já Banido', `O IP ${ip} já está na lista negra.`, 'checkout');
            return;
        }

        const confirm = window.confirm(`TEM CERTEZA QUE DESEJA BANIR O IP ${ip}?\n\nO usuário será desconectado e o site será "destruído" para ele.`);
        if (!confirm) return;

        try {
            const newBans = [...currentBans, ip];
            const { error } = await supabase
                .from('project_settings')
                .upsert({
                    id: 'global',
                    banned_ips: newBans
                });

            if (!error) {
                setSettings({ ...settings, banned_ips: newBans });
                addToast('IP BANIDO COM SUCESSO', `O alvo do IP ${ip} foi eliminado.`, 'sale');
                fetchData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleExportCSV = () => {
        const headers = ["IP", "Cidade", "Primeiro Acesso", "Último Acesso", "Alvo", "Nome", "Email", "Telefone", "Pago?"];
        const rows = users.map(u => [
            u.ip,
            u.city || 'N/A',
            new Date(u.firstSeen).toLocaleString(),
            new Date(u.lastSeen).toLocaleString(),
            u.target,
            u.checkout.name || '',
            u.checkout.email || '',
            u.checkout.phone || '',
            u.cart.main ? 'SIM' : 'NÃO'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `godmode_leads_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- ANALYTICS ---
    const stats = useMemo(() => {
        const prices = settings?.prices || { main: 27, upsell1: 16.9, upsell2: 12 };

        // 1. FILTER USERS
        const filteredUsers = users.filter(u => {
            // A. Period Filter
            const userDate = new Date(u.lastSeen); // Using lastSeen to include recent activity
            const now = new Date();
            let dateMatch = true;

            if (overviewDateFilter) {
                const dateStr = userDate.getFullYear() + '-' +
                    String(userDate.getMonth() + 1).padStart(2, '0') + '-' +
                    String(userDate.getDate()).padStart(2, '0');
                dateMatch = dateStr === overviewDateFilter;
            } else if (filterPeriod === 'Hoje') {
                dateMatch = userDate.getDate() === now.getDate() && userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
            } else if (filterPeriod === 'Ontem') {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                dateMatch = userDate.getDate() === yesterday.getDate() && userDate.getMonth() === yesterday.getMonth() && userDate.getFullYear() === yesterday.getFullYear();
            } else if (filterPeriod === 'Últimos 7 dias') {
                const sevenDaysAgo = new Date(now);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                dateMatch = userDate >= sevenDaysAgo;
            } else if (filterPeriod === 'Últimos 30 dias') {
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                dateMatch = userDate >= thirtyDaysAgo;
            }

            if (dateMatch && overviewTimeFilter) {
                const timeStr = userDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (!timeStr.startsWith(overviewTimeFilter)) dateMatch = false;
            }

            // B. Type Filter
            let typeMatch = true;
            if (filterType === 'Leads') {
                typeMatch = !!(u.checkout.email || u.checkout.phone);
            } else if (filterType === 'Clientes') {
                typeMatch = u.cart.main;
            } else if (filterType === 'Visitantes') {
                typeMatch = !u.cart.main && !u.checkout.email && !u.checkout.phone;
            }

            // C. Product Filter
            let productMatch = true;
            if (filterProduct === 'Acesso Completo') {
                productMatch = u.cart.main;
            } else if (filterProduct === 'Ghost Mode') {
                productMatch = u.cart.upsell1;
            } else if (filterProduct === 'Fila de Espera') {
                productMatch = u.cart.upsell2;
            }

            return dateMatch && typeMatch && productMatch;
        });

        // 2. CALCULATE METRICS
        const revenue = filteredUsers.reduce((acc, u) => {
            let sum = 0;
            // Only count revenue if the user matches the product filter (if specific product selected)
            // or count all if "Todos"
            if (filterProduct === 'Todos os produtos') {
                if (u.cart.main) sum += parseFloat(prices.main);
                if (u.cart.upsell1) sum += parseFloat(prices.upsell1);
                if (u.cart.upsell2) sum += parseFloat(prices.upsell2);
            } else if (filterProduct === 'Acesso Completo' && u.cart.main) {
                sum += parseFloat(prices.main);
            } else if (filterProduct === 'Ghost Mode' && u.cart.upsell1) {
                sum += parseFloat(prices.upsell1);
            } else if (filterProduct === 'Fila de Espera' && u.cart.upsell2) {
                sum += parseFloat(prices.upsell2);
            }
            return acc + sum;
        }, 0);

        const totalVisitors = filteredUsers.length;
        // Pesquisa: Tem um target definido (o @ que foi puxado)
        const searched = filteredUsers.filter(u => u.target && u.target !== 'visitante').length;
        // Checkout: Preencheu nome, email e CPF
        const checkout = filteredUsers.filter(u => u.checkout.name && u.checkout.email && u.checkout.cpf).length;
        // Venda: Pagamento confirmado (Pix pago)
        const paid = filteredUsers.filter(u => u.cart.main).length;

        const convSearch = totalVisitors ? (searched / totalVisitors) * 100 : 0;
        const convCheckout = searched ? (checkout / searched) * 100 : 0;
        const convPaid = checkout ? (paid / checkout) * 100 : 0;

        return { revenue, totalVisitors, searched, checkout, paid, convSearch, convCheckout, convPaid, filteredUsers };
    }, [users, settings, filterType, filterProduct, filterPeriod, overviewDateFilter, overviewTimeFilter]);

    // --- COLORS & THEME ---
    // Cakto Green: #00E05A (approx)
    const BRAND_GREEN = "#10B981"; // Using Tailwind Emerald for now

    return (
        <div className="fixed inset-0 z-[100000] bg-[#121212] text-white flex font-sans overflow-hidden">

            {/* MOBILE SIDEBAR OVERLAY */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* 1. SIDEBAR (Cakto Style) */}
            <aside className={`w-[260px] bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col py-6 px-4 absolute md:relative z-50 h-full transition-transform duration-300 overflow-hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {/* SIDEBAR BACKGROUND CSS */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1a1a1a] to-black opacity-50">
                </div>

                {/* SIDEBAR CONTENT */}
                <div className="relative z-10 flex flex-col h-full w-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-0 mt-2">
                        <img src="https://i.ibb.co/TMpR1DzQ/bc3981f0-07c3-4be7-aa5a-c2023032b960.png" alt="Stalkea Logo" className="w-full h-auto object-contain scale-110" />
                    </div>

                    {/* Faturamento Widget */}
                    <div className="bg-[#18181B]/80 backdrop-blur-md rounded-xl p-4 mb-8 border border-[#27272A] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign size={40} />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-400">Faturamento Hoje</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-white">R$ {stats.revenue.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-800 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[45%]" />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        <SidebarItem
                            icon={<LayoutDashboard />}
                            label="Visão Geral"
                            active={activeTab === 'overview'}
                            onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={<Users />}
                            label="Leads (Pesquisas)"
                            active={activeTab === 'leads'}
                            onClick={() => { setActiveTab('leads'); setSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={<ShoppingBag />}
                            label="Minhas Vendas"
                            active={activeTab === 'sales'}
                            onClick={() => { setActiveTab('sales'); setSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={<Terminal />}
                            label="Terminal ao Vivo"
                            active={activeTab === 'live'}
                            onClick={() => { setActiveTab('live'); setSidebarOpen(false); }}
                            badge="LIVE"
                        />
                        <SidebarItem
                            icon={<BarChart3 />}
                            label="Análise Detalhada"
                            active={activeTab === 'analytics'}
                            onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={<DollarSign />}
                            label="Preços (Simples)"
                            active={activeTab === 'prices'}
                            onClick={() => { setActiveTab('prices'); setSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={<Settings />}
                            label="Configurações"
                            active={activeTab === 'settings'}
                            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
                        />
                    </nav>
                </div>
            </aside>

            {/* 2. MAIN CONTENT */}
            <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden bg-[#121212]">
                {/* MAIN CONTENT BACKGROUND CSS */}
                <div className="absolute inset-0 z-0 bg-radial-gradient from-[#1a1a1a] to-[#050505] opacity-80">
                </div>

                {/* Header */}
                <header className="h-16 border-b border-[#1F1F1F] flex items-center justify-between px-6 bg-[#121212]/50 backdrop-blur-sm sticky top-0 z-20 relative">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-white">Visão Geral</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 bg-[#18181B] border border-[#27272A] rounded-full px-3 py-1.5 text-xs text-gray-400">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            STATUS: ONLINE
                        </div>

                        <button onClick={fetchData} className={`p-2 rounded-lg hover:bg-[#1F1F1F] text-gray-400 transition-all ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`}>
                            <RefreshCcw size={20} />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-20">

                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Filters Row */}
                            <div className="relative z-50 mb-6">
                                {/* Mobile Filter Toggle */}
                                <div className="sm:hidden mb-2">
                                    <button
                                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                                        className="w-full flex items-center justify-between bg-[#18181B] border border-[#27272A] p-3 rounded-xl text-sm font-medium hover:bg-[#27272A] transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Filter size={16} className="text-emerald-500" />
                                            <span>Filtros de Visualização</span>
                                        </div>
                                        {showMobileFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>

                                <div className={`${showMobileFilters ? 'grid' : 'hidden'} sm:grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4`}>
                                    <FilterSelect
                                        label="Tipo"
                                        value={filterType}
                                        options={['Todos', 'Leads', 'Clientes', 'Visitantes']}
                                        onChange={setFilterType}
                                    />
                                    <FilterSelect
                                        label="Período"
                                        value={filterPeriod}
                                        options={['Hoje', 'Ontem', 'Últimos 7 dias', 'Últimos 30 dias', 'Todo o período']}
                                        onChange={setFilterPeriod}
                                    />
                                    <FilterSelect
                                        label="Produtos"
                                        value={filterProduct}
                                        options={['Todos os produtos', 'Acesso Completo', 'Ghost Mode', 'Fila de Espera']}
                                        onChange={setFilterProduct}
                                        className="col-span-2 sm:col-span-1"
                                    />

                                    {/* Manual Date/Time Filter */}
                                    <div className="flex flex-col justify-center col-span-2 sm:col-span-1">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Filtro Específico</span>
                                        <div className="flex items-center gap-2 bg-[#18181B]/80 backdrop-blur-md p-1 rounded-xl border border-[#27272A] h-[46px] hover:border-emerald-500/30 transition-colors">
                                            <div className="relative flex-1">
                                                <input
                                                    type="date"
                                                    value={overviewDateFilter}
                                                    onChange={(e) => setOverviewDateFilter(e.target.value)}
                                                    className="w-full bg-transparent text-xs text-white border-none outline-none pl-8 pr-1 py-1.5 [&::-webkit-calendar-picker-indicator]:invert cursor-pointer h-full"
                                                />
                                                <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                            </div>
                                            <div className="w-px h-4 bg-[#27272A]"></div>
                                            <div className="relative w-[80px]">
                                                <input
                                                    type="time"
                                                    value={overviewTimeFilter}
                                                    onChange={(e) => setOverviewTimeFilter(e.target.value)}
                                                    className="w-full bg-transparent text-xs text-white border-none outline-none pl-7 pr-1 py-1.5 [&::-webkit-calendar-picker-indicator]:invert cursor-pointer h-full"
                                                />
                                                <Clock size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                            </div>
                                            {(overviewDateFilter || overviewTimeFilter) && (
                                                <button
                                                    onClick={() => { setOverviewDateFilter(''); setOverviewTimeFilter(''); }}
                                                    className="px-2 text-red-400 hover:text-red-300 transition-colors"
                                                    title="Limpar"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard
                                    title="Receita Total"
                                    value={`R$ ${stats.revenue.toFixed(2)}`}
                                    subtext="Vendas realizadas"
                                />
                                <MetricCard
                                    title="Vendas"
                                    value={stats.paid}
                                    subtext="Quantidade confirmada"
                                />
                                <MetricCard
                                    title="Visitantes"
                                    value={stats.totalVisitors}
                                    subtext="Tráfego único"
                                />
                                <MetricCard
                                    title="Checkout"
                                    value={stats.checkout}
                                    subtext="Iniciaram compra"
                                />
                            </div>

                            {/* Payment Methods Table */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-[#18181B]/80 backdrop-blur-md border border-[#27272A] rounded-2xl overflow-hidden">
                                    <div className="p-5 border-b border-[#27272A]">
                                        <h3 className="font-bold text-white">Meios de Pagamento</h3>
                                    </div>
                                    <div className="p-0">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-[#121212]">
                                                <tr>
                                                    <th className="px-6 py-3">Método</th>
                                                    <th className="px-6 py-3">Conversão</th>
                                                    <th className="px-6 py-3 text-right">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#27272A]">
                                                <PaymentRow icon={<Zap size={16} />} name="Pix" conversion="100%" value={`R$ ${stats.revenue.toFixed(2)}`} />
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Conversion Funnel */}
                                <div className="bg-[#18181B]/80 backdrop-blur-md border border-[#27272A] rounded-2xl p-5 flex flex-col h-[320px]">
                                    <h3 className="font-bold text-white mb-2">Funil de Conversão (Gráfico)</h3>
                                    <div className="flex-1 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                layout="vertical"
                                                data={[
                                                    { name: 'Visitantes', value: stats.totalVisitors, fill: '#3B82F6', percent: '100%' },
                                                    { name: 'Pesquisa', value: stats.searched, fill: '#A855F7', percent: `${stats.convSearch.toFixed(1)}%` },
                                                    { name: 'Checkout', value: stats.checkout, fill: '#F59E0B', percent: `${stats.convCheckout.toFixed(1)}%` },
                                                    { name: 'Venda', value: stats.paid, fill: '#10B981', percent: `${stats.convPaid.toFixed(1)}%` },
                                                ]}
                                                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" horizontal={false} />
                                                <XAxis type="number" hide />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    stroke="#9CA3AF"
                                                    fontSize={12}
                                                    fontWeight={500}
                                                    width={75}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', color: '#fff', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                    formatter={(value: any, name: any, props: any) => [`${value} (${props.payload.percent})`, 'Usuários']}
                                                />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} background={{ fill: '#27272A', radius: [0, 4, 4, 0] }} label={{ position: 'insideRight', fill: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                                                    {
                                                        [
                                                            { fill: '#3B82F6' },
                                                            { fill: '#A855F7' },
                                                            { fill: '#F59E0B' },
                                                            { fill: '#10B981' },
                                                        ].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))
                                                    }
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: LIVE TERMINAL */}
                    {activeTab === 'live' && (
                        <div className="h-full flex flex-col max-w-6xl mx-auto animate-in fade-in">
                            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
                                <div className="p-4 border-b border-[#27272A] bg-[#121212] flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Terminal size={18} className="text-emerald-500" />
                                        <span className="font-mono text-sm font-bold text-white">TERMINAL_AO_VIVO_V2</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSoundEnabled(!soundEnabled)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${soundEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-[#27272A] text-gray-400'}`}
                                        >
                                            <Bell size={14} className={soundEnabled ? 'animate-pulse' : ''} />
                                            SOM: {soundEnabled ? 'ON' : 'OFF'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                const content = rawLogs.map(l =>
                                                    `[${new Date(l.created_at).toLocaleString()}] ${l.event_type} | IP: ${l.ip} | User: ${l.target_user || 'N/A'} | Device: ${l.device || 'N/A'}`
                                                ).join('\n');
                                                const blob = new Blob([content], { type: 'text/plain' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `stalkeai_logs_${new Date().toISOString().split('T')[0]}.txt`;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] rounded text-xs font-bold text-gray-300 transition-colors"
                                        >
                                            <Download size={14} /> EXPORTAR LOGS (.TXT)
                                        </button>
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                                        </div>
                                    </div>
                                </div>
                                <div ref={liveTerminalRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs custom-scrollbar bg-[#0A0A0A]">
                                    {rawLogs.map((log, i) => (
                                        <div key={log.id || i} className="flex flex-col gap-1.5 bg-[#121212] p-3 rounded-lg border border-[#27272A] mb-2 hover:border-emerald-500/30 transition-all group animate-in slide-in-from-left-2 duration-300">
                                            <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                                                <span className="flex items-center gap-1.5 whitespace-nowrap"><Clock size={10} /> {new Date(log.created_at).toLocaleString()}</span>
                                                <span className="flex items-center gap-1.5 whitespace-nowrap ml-2"><Globe size={10} /> {log.ip}</span>
                                            </div>

                                            <div className="flex items-center gap-3 w-full overflow-hidden">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${log.event_type === 'Purchase' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    log.event_type === 'InitiateCheckout' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        log.event_type === 'cta' ? 'bg-white/10 text-white border-white/40' :
                                                            log.event_type.includes('click') || log.event_type.includes('view') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    }`}>
                                                    {log.event_type}
                                                </span>
                                                <span className="text-sm text-white font-mono font-medium truncate flex-1" title={log.target_user}>
                                                    {log.target_user || 'Visitante'}
                                                </span>
                                            </div>

                                            {/* RICH METADATA DISPLAY */}
                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {Object.entries(log.metadata)
                                                        .filter(([key]) => !['step', 'fbc', 'fbp', 'payment_verified', 'city', 'region'].includes(key))
                                                        .map(([key, val]) => (
                                                            <span key={key} className="text-[10px] font-mono text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1">
                                                                <span className="text-gray-600 font-bold">{key}:</span>
                                                                <span className="text-emerald-400">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                                                            </span>
                                                        ))
                                                    }
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-gray-400 mt-1 pt-2 border-t border-[#27272A]">
                                                <span className="flex items-center gap-1.5 max-w-full" title={log.device}>
                                                    <Smartphone size={10} className="shrink-0 text-gray-500" />
                                                    <span className="truncate max-w-[150px] sm:max-w-[300px] md:max-w-lg">
                                                        {log.device || 'N/A'}
                                                    </span>
                                                </span>
                                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                                    <MapPin size={10} className="shrink-0 text-gray-500" />
                                                    {log.city || 'N/A'}{log.metadata?.region ? `, ${log.metadata.region}` : ''}
                                                </span>
                                                {log.metadata?.step && (
                                                    <span className="flex items-center gap-1.5 px-1.5 py-0.5 bg-[#27272A] rounded text-gray-300 whitespace-nowrap border border-[#3F3F46]">
                                                        Step: {log.metadata.step}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: DEEP ANALYTICS */}
                    {activeTab === 'analytics' && (() => {
                        const rageClicks = rawLogs.filter(l => l.event_type === 'rage_click');
                        const jsErrors = rawLogs.filter(l => l.event_type === 'js_error');
                        const paymentErrors = rawLogs.filter(l => l.event_type === 'payment_error');
                        const partialLeads = rawLogs.filter(l => l.event_type === 'form_partial_lead');
                        const scrollDepths = rawLogs.filter(l => l.event_type === 'scroll_depth').map(l => l.metadata?.depth || 0);
                        const avgScroll = scrollDepths.length ? (scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length).toFixed(0) : 0;

                        return (
                            <div className="h-full flex flex-col max-w-6xl mx-auto animate-in fade-in space-y-6 overflow-y-auto pb-10">
                                {/* Header */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            <BarChart3 className="text-purple-500" /> Análise Detalhada
                                        </h2>
                                        <p className="text-gray-400 text-sm">Inteligência comportamental e erros técnicos</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={fetchData} className="p-2 bg-[#18181B] border border-[#27272A] rounded-lg hover:bg-[#27272A] transition-colors">
                                            <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                </div>

                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Activity size={40} />
                                        </div>
                                        <p className="text-gray-500 text-xs font-bold uppercase">Cliques de Raiva</p>
                                        <h3 className="text-2xl font-black text-white mt-1">{rageClicks.length}</h3>
                                        <p className="text-[10px] text-gray-500 mt-2">Cliques de frustração</p>
                                    </div>
                                    <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <ShieldAlert size={40} />
                                        </div>
                                        <p className="text-gray-500 text-xs font-bold uppercase">Erros (JS/Pay)</p>
                                        <h3 className="text-2xl font-black text-white mt-1">{jsErrors.length + paymentErrors.length}</h3>
                                        <p className="text-[10px] text-gray-500 mt-2">{paymentErrors.length} erros de pagto</p>
                                    </div>
                                    <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <ArrowDown size={40} />
                                        </div>
                                        <p className="text-gray-500 text-xs font-bold uppercase">Scroll Médio</p>
                                        <h3 className="text-2xl font-black text-white mt-1">{avgScroll}%</h3>
                                        <p className="text-[10px] text-gray-500 mt-2">Profundidade de leitura</p>
                                    </div>
                                    <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Users size={40} />
                                        </div>
                                        <p className="text-gray-500 text-xs font-bold uppercase">Leads Parciais</p>
                                        <h3 className="text-2xl font-black text-emerald-400 mt-1">{partialLeads.length}</h3>
                                        <p className="text-[10px] text-gray-500 mt-2">Recuperáveis (Digitou e saiu)</p>
                                    </div>
                                </div>

                                {/* Engagement Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden p-5">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                            <Activity size={14} className="text-blue-500" /> Cliques por Aba
                                        </h4>
                                        <div className="space-y-3">
                                            {['feed', 'search', 'notifications', 'messages', 'reels'].map(tab => {
                                                const count = rawLogs.filter(l => l.event_type === 'nav_tab_click' && l.metadata?.tab === tab).length;
                                                const total = rawLogs.filter(l => l.event_type === 'nav_tab_click').length || 1;
                                                const percent = (count / total) * 100;
                                                return (
                                                    <div key={tab} className="space-y-1">
                                                        <div className="flex justify-between text-[10px] font-bold">
                                                            <span className="text-gray-400 uppercase">{tab}</span>
                                                            <span className="text-white">{count}</span>
                                                        </div>
                                                        <div className="w-full h-1 bg-[#121212] rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500" style={{ width: `${percent}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden p-5">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                            <Globe size={14} className="text-purple-500" /> Interações Feed
                                        </h4>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Likes', events: ['like', 'post_like_click'] },
                                                { label: 'Salvos', events: ['bookmark', 'post_bookmark_click'] },
                                                { label: 'Stories Clicados', events: ['story_click'] },
                                                { label: 'VIP Modal Views', events: ['vip_modal_view'] }
                                            ].map(item => {
                                                const count = rawLogs.filter(l =>
                                                    item.events.includes(l.event_type) ||
                                                    (l.event_type === 'post_interaction' && item.events.includes(l.metadata?.interaction))
                                                ).length;
                                                return (
                                                    <div key={item.label} className="flex justify-between items-center bg-[#121212] p-3 rounded-lg border border-[#27272A]">
                                                        <span className="text-xs text-gray-400">{item.label}</span>
                                                        <span className="text-sm font-bold text-white">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden p-5">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                            <Users size={14} className="text-emerald-500" /> Heatmap de Local
                                        </h4>
                                        <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                                            {(() => {
                                                const cities = new Map<string, number>();
                                                rawLogs.forEach(l => {
                                                    if (l.city) cities.set(l.city, (cities.get(l.city) || 0) + 1);
                                                });
                                                return Array.from(cities.entries())
                                                    .sort((a, b) => b[1] - a[1])
                                                    .slice(0, 10)
                                                    .map(([city, count]) => (
                                                        <div key={city} className="flex justify-between items-center text-[10px]">
                                                            <span className="text-gray-400">{city}</span>
                                                            <span className="text-emerald-500 font-bold">{count}</span>
                                                        </div>
                                                    ));
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Leads Recuperação Table */}
                                <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden">
                                    <div className="p-4 border-b border-[#27272A] flex justify-between items-center bg-[#121212]">
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            <Users size={16} className="text-emerald-500" /> Leads para Recuperação (Últimos 50)
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#0A0A0A] text-gray-400 text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">Data</th>
                                                    <th className="px-4 py-3">Campo</th>
                                                    <th className="px-4 py-3">Valor (Lead)</th>
                                                    <th className="px-4 py-3">IP / Local</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#27272A]">
                                                {partialLeads.slice(0, 50).map((lead, i) => (
                                                    <tr key={i} className="hover:bg-[#27272A]/50 transition-colors">
                                                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(lead.created_at).toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-blue-400 font-mono text-xs">{lead.metadata?.field}</td>
                                                        <td className="px-4 py-3 text-white font-mono">{lead.metadata?.value}</td>
                                                        <td className="px-4 py-3 text-gray-500 text-xs">{lead.ip} ({lead.city})</td>
                                                    </tr>
                                                ))}
                                                {partialLeads.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">Nenhum lead parcial capturado ainda.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Errors & Frustrations */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Rage Clicks */}
                                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden">
                                        <div className="p-4 border-b border-[#27272A] bg-[#121212]">
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                <Activity size={16} className="text-red-500" /> Cliques de Raiva (Frustração)
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {rageClicks.map((click, i) => (
                                                <div key={i} className="flex justify-between items-center p-2 bg-[#27272A]/50 rounded text-xs border border-transparent hover:border-red-500/30">
                                                    <span className="text-gray-300 font-mono">{click.metadata?.element || 'Elemento desconhecido'}</span>
                                                    <span className="text-gray-500">{new Date(click.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            ))}
                                            {rageClicks.length === 0 && <p className="text-gray-500 text-center text-sm py-4">Sem registros de rage click.</p>}
                                        </div>
                                    </div>

                                    {/* Technical Errors */}
                                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden">
                                        <div className="p-4 border-b border-[#27272A] bg-[#121212]">
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                <ShieldAlert size={16} className="text-amber-500" /> Erros Técnicos
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {[...jsErrors, ...paymentErrors].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((err, i) => (
                                                <div key={i} className="p-2 bg-[#27272A]/50 rounded text-xs border-l-2 border-red-500">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="font-bold text-red-400">{err.event_type}</span>
                                                        <span className="text-gray-500">{new Date(err.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                    <p className="text-gray-300 break-all font-mono">
                                                        {err.metadata?.message || err.metadata?.error || JSON.stringify(err.metadata)}
                                                    </p>
                                                </div>
                                            ))}
                                            {(jsErrors.length + paymentErrors.length) === 0 && <p className="text-gray-500 text-center text-sm py-4">Sistema estável. Sem erros.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* TAB: SALES (Minhas Vendas) */}
                    {activeTab === 'sales' && (
                        <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Minhas Vendas (Confirmadas)</h2>
                                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] rounded-lg text-sm font-medium transition-colors">
                                    <Download size={16} /> Exportar CSV
                                </button>
                            </div>

                            <div className="space-y-3">
                                {users.filter(u => u.cart.main).map((user, idx) => (
                                    <div key={idx} className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 flex flex-col md:flex-row items-center gap-6 hover:border-emerald-500/30 transition-colors group">

                                        {/* Icon/Avatar */}
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500">
                                            <DollarSign size={20} />
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 w-full text-center md:text-left">
                                            <h4 className="font-bold text-white flex items-center justify-center md:justify-start gap-2">
                                                {user.checkout.name || 'Cliente'}
                                                <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">PAGO</span>
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">{user.checkout.email || 'Email não capturado'}</p>
                                        </div>

                                        {/* Metrics */}
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <span className="block text-[10px] uppercase text-gray-600 font-bold">Valor</span>
                                                <span className="text-emerald-400 font-bold">R$ {settings?.prices?.main || '27.00'}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-[10px] uppercase text-gray-600 font-bold">Local</span>
                                                <span className="text-gray-300">{user.city || 'BR'}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-[10px] uppercase text-gray-600 font-bold">Alvo</span>
                                                <span className="text-purple-400 font-medium">@{user.target || '-'}</span>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <button className="p-2 text-gray-600 hover:text-emerald-500 transition-colors">
                                            <CheckCircle size={18} />
                                        </button>
                                    </div>
                                ))}
                                {users.filter(u => u.cart.main).length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>Nenhuma venda confirmada ainda.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: LEADS (Pesquisas) */}
                    {activeTab === 'leads' && (
                        <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <h2 className="text-xl font-bold">Leads (Pesquisas de @)</h2>
                                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                                    {/* Filters */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#121212] p-2 sm:p-1 rounded-lg border border-[#27272A]">
                                        {/* Period Select */}
                                        <select
                                            value={leadsFilterPeriod}
                                            onChange={(e) => {
                                                setLeadsFilterPeriod(e.target.value);
                                                // Clear manual filters when period changes
                                                if (e.target.value !== 'Personalizado') {
                                                    setLeadsDateFilter('');
                                                    setLeadsTimeFilter('');
                                                }
                                            }}
                                            className="bg-[#18181B] sm:bg-transparent text-xs font-medium text-gray-300 border border-[#27272A] sm:border-none rounded sm:rounded-none outline-none pl-2 pr-1 py-2 sm:py-1.5 cursor-pointer hover:text-white transition-colors w-full sm:w-auto"
                                        >
                                            <option value="Todos" className="text-black">Todos</option>
                                            <option value="Hoje" className="text-black">Hoje</option>
                                            <option value="Ontem" className="text-black">Ontem</option>
                                            <option value="Últimos 7 dias" className="text-black">Últimos 7 dias</option>
                                            <option value="Últimos 10 meses" className="text-black">Últimos 10 meses</option>
                                        </select>

                                        <div className="hidden sm:block w-px h-4 bg-[#27272A]"></div>

                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:flex-none">
                                                <input
                                                    type="date"
                                                    value={leadsDateFilter}
                                                    onChange={(e) => {
                                                        setLeadsDateFilter(e.target.value);
                                                        setLeadsFilterPeriod('Personalizado');
                                                    }}
                                                    className="w-full sm:w-auto bg-[#18181B] sm:bg-transparent text-xs text-white border border-[#27272A] sm:border-none rounded sm:rounded-none outline-none pl-8 pr-2 py-2 sm:py-1.5 [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                                                />
                                                <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                            </div>

                                            <div className="hidden sm:block w-px h-4 bg-[#27272A]"></div>

                                            <div className="relative flex-1 sm:flex-none">
                                                <input
                                                    type="time"
                                                    value={leadsTimeFilter}
                                                    onChange={(e) => {
                                                        setLeadsTimeFilter(e.target.value);
                                                        setLeadsFilterPeriod('Personalizado');
                                                    }}
                                                    className="w-full sm:w-auto bg-[#18181B] sm:bg-transparent text-xs text-white border border-[#27272A] sm:border-none rounded sm:rounded-none outline-none pl-8 pr-2 py-2 sm:py-1.5 [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                                                />
                                                <Clock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>

                                        {(leadsDateFilter || leadsTimeFilter || leadsFilterPeriod !== 'Todos') && (
                                            <button
                                                onClick={() => {
                                                    setLeadsDateFilter('');
                                                    setLeadsTimeFilter('');
                                                    setLeadsFilterPeriod('Todos');
                                                }}
                                                className="px-2 text-xs text-red-400 hover:text-red-300 font-bold transition-colors hidden sm:block"
                                                title="Limpar filtros"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}

                                        {/* Mobile Clear Button */}
                                        {(leadsDateFilter || leadsTimeFilter || leadsFilterPeriod !== 'Todos') && (
                                            <button
                                                onClick={() => {
                                                    setLeadsDateFilter('');
                                                    setLeadsTimeFilter('');
                                                    setLeadsFilterPeriod('Todos');
                                                }}
                                                className="flex items-center justify-center gap-2 p-2 text-xs text-red-400 bg-[#18181B] border border-[#27272A] rounded font-bold sm:hidden w-full"
                                            >
                                                <X size={12} /> Limpar Filtros
                                            </button>
                                        )}
                                    </div>

                                    <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 px-4 py-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] rounded-lg text-sm font-medium transition-colors w-full md:w-auto">
                                        <Download size={16} /> Exportar CSV
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {users.filter(u => {
                                    if (!u.target || u.target === 'visitante' || u.cart.main) return false;

                                    const userDate = new Date(u.lastSeen);
                                    const now = new Date();

                                    // 1. Manual Date/Time Filter (Priority)
                                    if (leadsDateFilter) {
                                        const dateStr = userDate.getFullYear() + '-' +
                                            String(userDate.getMonth() + 1).padStart(2, '0') + '-' +
                                            String(userDate.getDate()).padStart(2, '0');
                                        if (dateStr !== leadsDateFilter) return false;
                                    } else if (leadsFilterPeriod !== 'Todos') {
                                        // 2. Period Filter
                                        if (leadsFilterPeriod === 'Hoje') {
                                            if (userDate.getDate() !== now.getDate() ||
                                                userDate.getMonth() !== now.getMonth() ||
                                                userDate.getFullYear() !== now.getFullYear()) return false;
                                        } else if (leadsFilterPeriod === 'Ontem') {
                                            const yesterday = new Date(now);
                                            yesterday.setDate(yesterday.getDate() - 1);
                                            if (userDate.getDate() !== yesterday.getDate() ||
                                                userDate.getMonth() !== yesterday.getMonth() ||
                                                userDate.getFullYear() !== yesterday.getFullYear()) return false;
                                        } else if (leadsFilterPeriod === 'Últimos 7 dias') {
                                            const limit = new Date(now);
                                            limit.setDate(limit.getDate() - 7);
                                            if (userDate < limit) return false;
                                        } else if (leadsFilterPeriod === 'Últimos 10 meses') {
                                            const limit = new Date(now);
                                            limit.setMonth(limit.getMonth() - 10);
                                            if (userDate < limit) return false;
                                        }
                                    }

                                    if (leadsTimeFilter) {
                                        const timeStr = new Date(u.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        if (!timeStr.startsWith(leadsTimeFilter)) return false;
                                    }

                                    return true;
                                }).map((user, idx) => (
                                    <div key={idx} className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-purple-500/30 transition-all group relative">

                                        {/* 1. Avatar & Identificação */}
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            {/* Avatar Initials */}
                                            <div className="w-12 h-12 rounded-full shrink-0 bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/20 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {user.checkout.name ? user.checkout.name.substring(0, 2).toUpperCase() : 'VI'}
                                            </div>

                                            {/* Name & Email (Mobile Friendly) */}
                                            <div className="flex-1 md:hidden">
                                                <h4 className="font-bold text-white text-base leading-tight">
                                                    {user.checkout.name || 'Visitante Anônimo'}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                    <span className="flex items-center gap-1 text-gray-300">
                                                        <MapPin size={10} className="text-emerald-500" />
                                                        {user.city && user.city !== 'Desconhecido' ? user.city : user.ip}
                                                    </span>
                                                    {user.region && <span className="text-[10px] text-gray-600">({user.region})</span>}
                                                </div>
                                                {/* Mobile Date/Time */}
                                                <div className="flex items-center gap-2 text-[10px] text-purple-400 mt-1 font-mono">
                                                    <Calendar size={10} />
                                                    {new Date(user.lastSeen).toLocaleString()}
                                                </div>
                                            </div>

                                            {/* Mobile Action */}
                                            <div className="md:hidden flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); handleBanIP(user.ip); }} className="p-2 text-red-500 hover:text-red-400 bg-[#27272A] rounded-lg">
                                                    <Ban size={18} />
                                                </button>
                                                <button className="p-2 text-gray-500 hover:text-white bg-[#27272A] rounded-lg">
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* 2. Desktop Info (Name, Email, Location) */}
                                        <div className="hidden md:block flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-white text-base">
                                                    {user.checkout.name || 'Visitante Anônimo'}
                                                </h4>
                                                {user.checkout.email && (
                                                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        COM EMAIL
                                                    </span>
                                                )}
                                                {user.checkout.cpf && (
                                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        CPF
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20" title="Localização">
                                                    <MapPin size={10} /> {user.city && user.city !== 'Desconhecido' ? `${user.city}${user.region ? `, ${user.region}` : ''}` : 'Localização Desconhecida'}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-gray-600" title={`IP: ${user.ip}`}>
                                                    <Globe size={10} /> {user.ip}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                <span className="flex items-center gap-1 text-purple-400 font-medium">
                                                    <Calendar size={12} /> {new Date(user.lastSeen).toLocaleString()}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                <span className="flex items-center gap-1">
                                                    <Activity size={12} /> {(() => {
                                                        const diff = new Date(user.lastSeen).getTime() - new Date(user.firstSeen).getTime();
                                                        const mins = Math.floor(diff / 60000);
                                                        const secs = Math.floor((diff % 60000) / 1000);
                                                        return `${mins}m ${secs}s`;
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="mt-1.5 flex gap-3 text-xs text-gray-600">
                                                {user.checkout.email && <span>{user.checkout.email}</span>}
                                                {user.checkout.phone && <span>• {user.checkout.phone}</span>}
                                                {user.checkout.cpf && <span>• {user.checkout.cpf}</span>}
                                            </div>
                                        </div>

                                        {/* 3. Target Search (O que ele buscou) */}
                                        <div className="w-full md:w-auto bg-[#121212] md:bg-transparent p-3 md:p-0 rounded-lg border border-[#27272A] md:border-none flex flex-col md:items-end gap-2">
                                            <div className="flex flex-col md:items-end">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pesquisou</span>
                                                <span className="text-purple-400 font-bold text-base md:text-lg">@{user.target}</span>
                                            </div>

                                            {/* 📊 Feed Stats (Posts/Stories) */}
                                            {(user.postsCount > 0 || user.storiesCount > 0) && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                                                    <span>{user.postsCount} Posts</span>
                                                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                                    <span>{user.storiesCount} Stories</span>
                                                </div>
                                            )}

                                            {/* Mobile Status Tag */}
                                            <div className="md:hidden px-2 py-1 rounded bg-gray-800 border border-gray-700 text-[10px] font-bold text-gray-400 self-start mt-2">
                                                {user.step.toUpperCase()}
                                            </div>
                                        </div>

                                        {/* 4. Desktop Status & Action */}
                                        <div className="hidden md:flex items-center gap-6">
                                            <div className="text-right">
                                                <span className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</span>
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Status Badge */}
                                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${user.cart.main ? 'bg-emerald-500 text-black border-emerald-500' :
                                                        user.step === 'cta' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            user.step === 'checkout' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                                'bg-gray-800 text-gray-400 border-gray-700'
                                                        }`}>
                                                        {user.cart.main ? 'CLIENTE' :
                                                            user.step === 'cta' ? 'CTA ATIVO' :
                                                                user.step === 'checkout' ? 'CHECKOUT' :
                                                                    user.step.toUpperCase()}
                                                    </span>

                                                    {/* Upsell Indicators */}
                                                    {(user.cart.upsell1 || user.cart.upsell2) && (
                                                        <div className="flex gap-1 ml-1">
                                                            {user.cart.upsell1 && (
                                                                <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[8px] font-bold text-white border border-purple-400" title="Ghost Mode (R$ 16)">G</div>
                                                            )}
                                                            {user.cart.upsell2 && (
                                                                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white border border-blue-400" title="Fila (R$ 12)">F</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="w-px h-8 bg-[#27272A]"></div>

                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); handleBanIP(user.ip); }} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Banir IP">
                                                    <Ban size={20} />
                                                </button>
                                                <button className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all">
                                                    <Eye size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {users.filter(u => {
                                    if (!u.target || u.target === 'visitante' || u.cart.main) return false;

                                    if (leadsDateFilter) {
                                        const dateObj = new Date(u.lastSeen);
                                        const dateStr = dateObj.getFullYear() + '-' +
                                            String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                                            String(dateObj.getDate()).padStart(2, '0');
                                        if (dateStr !== leadsDateFilter) return false;
                                    }

                                    if (leadsTimeFilter) {
                                        const timeStr = new Date(u.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        if (!timeStr.startsWith(leadsTimeFilter)) return false;
                                    }

                                    return true;
                                }).length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            <Users size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Nenhum lead encontrado ainda.</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    {/* TAB: PRICES */}
                    {activeTab === 'prices' && settings && (
                        <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95">
                            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 md:p-8">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                                    <DollarSign className="text-emerald-500" /> Controle de Preços Simples
                                </h3>
                                <p className="text-sm text-gray-400 mb-6">
                                    Alterações aqui refletem instantaneamente no site principal.
                                </p>
                                <div className="space-y-4">
                                    <SettingInput label="Preço Principal (R$)" value={settings.prices.main} onChange={(v: string) => setSettings({ ...settings, prices: { ...settings.prices, main: v } })} />
                                    <SettingInput label="Upsell Ghost Mode (R$)" value={settings.prices.upsell1} onChange={(v: string) => setSettings({ ...settings, prices: { ...settings.prices, upsell1: v } })} />
                                    <SettingInput label="Upsell Fila de Espera (R$)" value={settings.prices.upsell2} onChange={(v: string) => setSettings({ ...settings, prices: { ...settings.prices, upsell2: v } })} />

                                    <button
                                        onClick={() => handleSaveSettings(settings)}
                                        disabled={saveStatus === 'saving'}
                                        className={`w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-6 ${saveStatus === 'success' ? 'bg-emerald-500 text-black' :
                                            saveStatus === 'error' ? 'bg-red-500 text-white' :
                                                'bg-white text-black hover:bg-gray-200'
                                            }`}
                                    >
                                        {saveStatus === 'saving' ? <RefreshCcw className="animate-spin" /> :
                                            saveStatus === 'success' ? <CheckCircle /> : <Save />}
                                        {saveStatus === 'saving' ? 'Salvando...' :
                                            saveStatus === 'success' ? 'Salvo com sucesso!' :
                                                'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: SETTINGS */}
                    {activeTab === 'settings' && settings && (
                        <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95">
                            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 md:p-8">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                                    <Bell className="text-emerald-500" /> Notificações
                                </h3>
                                <button
                                    onClick={() => {
                                        sendPushNotification("🤑 VENDA REALIZADA! + R$ 33,30", "Produto: Stalkea Premium\nCliente: Teste do Painel", 'sale');
                                    }}
                                    className="w-full py-3 bg-blue-500/10 text-blue-400 font-bold rounded-xl hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Bell size={18} />
                                    Simular Venda Aprovada
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Clique para verificar se seu navegador permite alertas de vendas.
                                </p>
                            </div>



                            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 md:p-8">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                                    <DollarSign className="text-emerald-500" /> Controle de Preços
                                </h3>
                                <div className="space-y-4">
                                    <SettingInput label="Preço Principal (R$)" value={settings.prices.main} onChange={(v: string) => setSettings({ ...settings, prices: { ...settings.prices, main: v } })} />
                                    <SettingInput label="Upsell Ghost Mode (R$)" value={settings.prices.upsell1} onChange={(v: string) => setSettings({ ...settings, prices: { ...settings.prices, upsell1: v } })} />
                                    <SettingInput label="Upsell Fila de Espera (R$)" value={settings.prices.upsell2} onChange={(v: string) => setSettings({ ...settings, prices: { ...settings.prices, upsell2: v } })} />

                                    <button
                                        onClick={() => handleSaveSettings(settings)}
                                        disabled={saveStatus === 'saving'}
                                        className={`w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-6 ${saveStatus === 'success' ? 'bg-emerald-500 text-black' :
                                            saveStatus === 'error' ? 'bg-red-500 text-white' :
                                                'bg-white text-black hover:bg-gray-200'
                                            }`}
                                    >
                                        {saveStatus === 'saving' ? <RefreshCcw className="animate-spin" /> :
                                            saveStatus === 'success' ? <CheckCircle /> : <Save />}
                                        {saveStatus === 'saving' ? 'Salvando...' :
                                            saveStatus === 'success' ? 'Salvo com sucesso!' :
                                                'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 md:p-8 border-l-4 border-l-red-500">
                                <h3 className="text-lg font-bold mb-6 text-red-500 flex items-center gap-2">
                                    <ShieldAlert /> Zona de Perigo
                                </h3>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">IPs Banidos</label>
                                <textarea
                                    className="w-full h-32 bg-[#121212] border border-[#27272A] rounded-xl p-4 text-xs font-mono text-red-400 focus:border-red-500 outline-none"
                                    defaultValue={settings.banned_ips?.join('\n')}
                                    onChange={(e) => setSettings({ ...settings, banned_ips: e.target.value.split('\n').filter((x: string) => x.trim()) })}
                                />
                                <button onClick={() => handleSaveSettings(settings)} className="w-full py-3 mt-4 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-all">
                                    Atualizar Bloqueios
                                </button>
                            </div>
                        </div>
                    )}

                </main>
            </div>
            {/* TOASTS CONTAINER (ROXOPAY STYLE) */}
            <div className="fixed top-6 right-6 z-[100001] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto w-[340px] bg-[#0f0f0f] border border-[#222] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-4 flex gap-3 animate-in slide-in-from-right duration-300 relative overflow-hidden group"
                    >
                        {/* Glow Effect */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1 ${toast.type === 'sale' ? 'bg-[#00E05A] shadow-[0_0_20px_#00E05A]' : 'bg-amber-500 shadow-[0_0_20px_#F59E0B]'}`} />

                        {/* Icon */}
                        <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-[#333] bg-black">
                            <img src="https://i.ibb.co/9m6pG513/f85d6e00-b101-4f91-9aff-0f3b3a3f1d09.png" alt="RoxoPay" className="w-full h-full object-cover" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-white leading-tight mb-1">
                                {toast.title}
                            </h4>
                            <p className="text-xs text-[#888] font-medium leading-snug">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

// --- SUBCOMPONENTS ---

const SidebarItem = ({ icon, label, active, onClick, badge }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${active
            ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            : 'text-gray-400 hover:text-white hover:bg-[#1F1F1F]'
            }`}
    >
        {React.cloneElement(icon, { size: 20 })}
        <span className="text-sm">{label}</span>
        {badge && (
            <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${active ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-500'
                }`}>
                {badge}
            </span>
        )}
    </button>
);

const FilterSelect = ({ label, value, options, onChange, className }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={`bg-[#18181B]/80 backdrop-blur-md border border-[#27272A] rounded-xl p-3 flex flex-col justify-center relative cursor-pointer hover:border-emerald-500/30 transition-colors ${className} ${isOpen ? 'z-[100]' : 'z-auto'}`} onClick={() => setIsOpen(!isOpen)}>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</span>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{value}</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    {options.map((opt: string) => (
                        <div
                            key={opt}
                            className={`px-4 py-3 text-sm transition-colors flex items-center justify-between ${value === opt ? 'bg-emerald-500/10 text-emerald-500 font-bold' : 'text-gray-300 hover:bg-[#27272A] hover:text-white'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(opt);
                                setIsOpen(false);
                            }}
                        >
                            {opt}
                            {value === opt && <CheckCircle size={14} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ title, value, subtext }: any) => (
    <div className="bg-[#18181B]/80 backdrop-blur-md border border-[#27272A] rounded-xl p-5 flex flex-col justify-between h-[140px] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex justify-between items-start">
            <span className="text-gray-400 text-sm font-medium">{title}</span>
            <div className="w-8 h-8 rounded-full bg-[#121212] flex items-center justify-center text-gray-500 group-hover:text-emerald-500 transition-colors">
                <Eye size={16} />
            </div>
        </div>
        <div>
            <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {subtext}
            </p>
        </div>
    </div>
);

const PaymentRow = ({ icon, name, conversion, value }: any) => (
    <tr className="hover:bg-white/[0.02] transition-colors">
        <td className="px-6 py-4 flex items-center gap-3 text-white font-medium">
            <div className="text-gray-400">{icon}</div>
            {name}
        </td>
        <td className="px-6 py-4 text-gray-400">{conversion}</td>
        <td className="px-6 py-4 text-right font-bold text-emerald-500">{value}</td>
    </tr>
);

const FunnelItem = ({ label, count, percent, color }: any) => (
    <div>
        <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white font-medium">{label}</span>
            <span className="text-gray-400">{count} ({percent.toFixed(1)}%)</span>
        </div>
        <div className="w-full h-2 bg-[#121212] rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${Math.max(percent, 5)}%` }} />
        </div>
    </div>
);

const SettingInput = ({ label, value, onChange }: any) => (
    <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
            <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#121212] border border-[#27272A] rounded-xl pl-10 pr-4 py-3 text-white font-medium focus:border-emerald-500 outline-none transition-colors"
                placeholder="0.00"
            />
        </div>
    </div>
);

export default App;
