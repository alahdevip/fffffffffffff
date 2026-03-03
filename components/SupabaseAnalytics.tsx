import { useEffect, useRef } from 'react';
import { supabase } from '../src/lib/supabase';

// Helper to get device info safely
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const battery = (navigator as any).getBattery ? (navigator as any).getBattery() : null;

    return {
        ua,
        screen: `${window.screen.width}x${window.screen.height}`,
        connectionType: connection ? connection.effectiveType : 'unknown',
        rtt: connection ? connection.rtt : null,
        saveData: connection ? connection.saveData : false,
        // Battery is async, handled separately or just skipped for initial sync
    };
};

// Helper to get UTMs
const getUTMs = () => {
    const params = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
        const val = params.get(key);
        if (val) utms[key] = val;
    });
    return utms;
};

export const SupabaseAnalytics = () => {
    const scrollDepth = useRef(0);
    const clickCount = useRef(0);
    const rageClicks = useRef<{ x: number, y: number, time: number }[]>([]);
    const sessionStart = useRef(Date.now());

    useEffect(() => {
        // 1. Initial Session Data (Device, UTMs, Referrer)
        const sendSessionStart = async () => {
            const deviceInfo = getDeviceInfo();
            const utms = getUTMs();
            
            // Try to get battery info
            let batteryLevel = null;
            if ((navigator as any).getBattery) {
                try {
                    const battery = await (navigator as any).getBattery();
                    batteryLevel = battery.level;
                } catch (e) {}
            }

            // Performance (Navigation Timing)
            const perf = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
            const loadTime = perf ? perf.loadEventEnd - perf.startTime : 0;

            await supabase.from('traffic_logs').insert({
                event_type: 'session_start',
                ip: 'auto', // Handled by backend or client logic if passed
                target_user: 'system', // Generic or current user
                device: deviceInfo.ua,
                metadata: {
                    ...deviceInfo,
                    ...utms,
                    referrer: document.referrer,
                    batteryLevel,
                    loadTime,
                    path: window.location.pathname
                }
            });
        };
        
        sendSessionStart();

        // 2. Scroll Depth Tracker
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (scrollTop / docHeight) * 100;
            
            if (scrolled > scrollDepth.current) {
                // Check for milestones
                const milestones = [25, 50, 75, 90, 100];
                const passed = milestones.filter(m => scrolled >= m && scrollDepth.current < m);
                
                if (passed.length > 0) {
                    const maxPassed = Math.max(...passed);
                    supabase.from('traffic_logs').insert({
                        event_type: 'scroll_depth',
                        metadata: { depth: maxPassed, path: window.location.pathname }
                    }).then(() => {});
                }
                scrollDepth.current = scrolled;
            }
        };

        // Throttle scroll
        let scrollTimeout: any;
        const throttledScroll = () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    handleScroll();
                    scrollTimeout = null;
                }, 500);
            }
        };
        window.addEventListener('scroll', throttledScroll);

        // 3. Rage Clicks & Heatmap (Simplified)
        const handleClick = (e: MouseEvent) => {
            const now = Date.now();
            const { clientX, clientY } = e;

            // Heatmap: Sample 10% of clicks or critical elements
            // For now, just logging "click" event is too heavy. 
            // We'll focus on Rage Clicks: 3+ clicks in same area within 1s
            rageClicks.current.push({ x: clientX, y: clientY, time: now });
            
            // Cleanup old clicks
            rageClicks.current = rageClicks.current.filter(c => now - c.time < 1000);

            // Check for rage
            const nearbyClicks = rageClicks.current.filter(c => 
                Math.abs(c.x - clientX) < 20 && Math.abs(c.y - clientY) < 20
            );

            if (nearbyClicks.length >= 3) {
                // Debounce sending rage click
                if (rageClicks.current.length === 3) { // Only send on the 3rd click to avoid spam
                    supabase.from('traffic_logs').insert({
                        event_type: 'rage_click',
                        metadata: { 
                            x: clientX, 
                            y: clientY, 
                            element: (e.target as HTMLElement).tagName,
                            path: window.location.pathname 
                        }
                    }).then(() => {});
                }
            }
        };
        window.addEventListener('click', handleClick);

        // 4. JS Errors
        const handleError = (event: ErrorEvent) => {
            supabase.from('traffic_logs').insert({
                event_type: 'js_error',
                metadata: {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error?.stack
                }
            }).then(() => {});
        };
        window.addEventListener('error', handleError);

        // Cleanup
        return () => {
            window.removeEventListener('scroll', throttledScroll);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('error', handleError);
            
            // Send session end / time on page
            const timeOnPage = (Date.now() - sessionStart.current) / 1000;
            supabase.from('traffic_logs').insert({
                event_type: 'session_end',
                metadata: { timeOnPage, maxScroll: scrollDepth.current }
            }).then(() => {});
        };
    }, []);

    return null; // Renderless component
};
