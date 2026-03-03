import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const CreativeGhost: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'done'>('idle');
    const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);

    const ffmpegRef = useRef(new FFmpeg());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addLog = (msg: string) => {
        setLogs(prev => [msg, ...prev].slice(0, 10));
    };

    const loadFFmpeg = async () => {
        setStatus('loading');
        addLog("⚙️ Carregando motor de camuflagem...");
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('log', ({ message }) => {
            if (message.includes('frame=')) {
                // Tenta extrair progresso básico dos logs do ffmpeg
                addLog(`⚙️ Processando: ${message.substring(0, 40)}...`);
            }
        });

        ffmpeg.on('progress', ({ progress }) => {
            setProgress(progress * 100);
        });

        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        addLog("✅ Motor Pronto para Full Ghosting.");
        setStatus('idle');
    };

    useEffect(() => {
        loadFFmpeg();
    }, []);

    const processVideoReal = async () => {
        if (!file) return;

        setIsProcessing(true);
        setStatus('processing');
        setProgress(0);
        setLogs([]);

        const ffmpeg = ffmpegRef.current;
        const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
        const outputName = `ghost_${Math.random().toString(36).substring(7)}.mp4`;

        try {
            addLog("📥 Importando arquivo original...");
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            addLog("🧹 Iniciando REAL GHOSTING (Metadata + Pixels + Audio)...");

            // COMANDO FULL GHOSTING:
            // 1. Zoom de 2% (crop)
            // 2. Rotação randômica de 0.2 graus
            // 3. Modificação leve de cor (eq)
            // 4. Injeção de Hash (metadata forcing)
            // 5. Normalização de áudio para mudar ondas
            const randomRotation = (Math.random() * 0.4 - 0.2).toFixed(2);
            const randomContrast = (1 + (Math.random() * 0.04 - 0.02)).toFixed(2);

            await ffmpeg.exec([
                '-i', inputName,
                '-vf', `scale=iw*1.02:-1,crop=iw/1.02:ih/1.02,rotate=${randomRotation}*PI/180,eq=contrast=${randomContrast}:brightness=0.01`,
                '-af', 'volume=1.01',
                '-map_metadata', '-1', // Destrói metadados
                '-metadata', `comment=${Math.random().toString(36)}`, // Injeta novo hash
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-crf', '23',
                outputName
            ]);

            addLog("📤 Gerando arquivo final indetectável...");
            const data = await ffmpeg.readFile(outputName);
            const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'video/mp4' }));

            setProcessedVideoUrl(url);
            addLog("✅ CAMUFLAGEM FULL CONCLUÍDA!");
            setStatus('done');
        } catch (error) {
            console.error(error);
            addLog("❌ ERRO NO PROCESSAMENTO. Tente um vídeo menor.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadProcessed = () => {
        if (!processedVideoUrl) return;
        const a = document.createElement('a');
        a.href = processedVideoUrl;
        a.download = `full_ghost_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 font-sans selection:bg-purple-500/30">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                            CREATIVE GHOST <span className="text-xs font-mono text-white/40 border border-white/10 px-2 py-1 rounded ml-2 uppercase tracking-widest">v2.0 FULL</span>
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium italic">Seu vídeo, agora invisível para qualquer robô.</p>
                    </div>
                    {status === 'loading' && (
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Carregando Motor...</span>
                        </div>
                    )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left: Controls */}
                    <div className="space-y-6">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative h-64 border-2 border-dashed rounded-[2.5rem] transition-all duration-500 flex items-center justify-center cursor-pointer overflow-hidden group
                                ${file ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10 hover:border-purple-500/30 hover:bg-white/5'}`}
                        >
                            {file ? (
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                                    </div>
                                    <p className="font-bold text-lg truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                    </div>
                                    <p className="font-bold text-gray-300">Escolha o Criativo</p>
                                    <p className="text-sm text-gray-500 mt-1">Sua privacidade é total. Processado localmente.</p>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                                accept="video/*"
                            />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                            <h3 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-6">Módulos de Limpeza Real</h3>
                            <div className="space-y-5">
                                {[
                                    { label: 'Metadata Wipe (EXIF/GPS/Device)', status: 'Ativo' },
                                    { label: 'Pixel Shifting & Random Zoom', status: 'Ativo' },
                                    { label: 'WAV/Audio Deep Morphing', status: 'Ativo' },
                                    { label: 'MD5 Block-Salt Injection', status: 'Ativo' },
                                ].map((p, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <span className="text-sm text-gray-400 font-medium group-hover:text-white transition-colors">{p.label}</span>
                                        <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-md uppercase tracking-tighter">Ready</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                            <h3 className="text-xs font-black text-yellow-400 uppercase tracking-[0.2em] mb-6">DEBUG: Versão do Feed</h3>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => {
                                        localStorage.setItem('stalkea_feed_version', 'old');
                                        alert('Feed Antigo Selecionado (Com Bugs de Redirect). Recarregando...');
                                        window.location.reload();
                                    }}
                                    className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-between px-6
                                        ${typeof window !== 'undefined' && localStorage.getItem('stalkea_feed_version') !== 'new' 
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                                            : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10'}`}
                                >
                                    <span>Feed Antigo (Bug)</span>
                                    {typeof window !== 'undefined' && localStorage.getItem('stalkea_feed_version') !== 'new' && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    )}
                                </button>
                                <button 
                                    onClick={() => {
                                        localStorage.setItem('stalkea_feed_version', 'new');
                                        alert('Feed Novo Selecionado (Sem Redirects). Recarregando...');
                                        window.location.reload();
                                    }}
                                    className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-between px-6
                                        ${typeof window !== 'undefined' && localStorage.getItem('stalkea_feed_version') === 'new' 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                                            : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10'}`}
                                >
                                    <span>Feed Novo (Clean)</span>
                                    {typeof window !== 'undefined' && localStorage.getItem('stalkea_feed_version') === 'new' && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={status === 'done' ? downloadProcessed : processVideoReal}
                            disabled={!file || isProcessing || status === 'loading'}
                            className={`w-full py-6 rounded-[1.5rem] font-black text-lg uppercase tracking-[0.2em] transition-all duration-500 transform active:scale-95 flex items-center justify-center gap-3
                                ${status === 'done'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 shadow-[0_10px_40px_rgba(16,185,129,0.3)]'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_10px_40px_rgba(124,58,237,0.3)] disabled:opacity-30 disabled:grayscale'}`}
                        >
                            {isProcessing ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processando {Math.round(progress)}%</span>
                                </div>
                            ) : status === 'done' ? (
                                "Baixar Vídeo Indetectável"
                            ) : (
                                "Executar Full Camuflagem"
                            )}
                        </button>
                    </div>

                    {/* Right: Console/Logs */}
                    <div className="flex flex-col h-full min-h-[500px]">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] flex-1 p-8 flex flex-col shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300 ease-out shadow-[0_0_15px_#a855f7]"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center gap-2 mb-8">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
                                </div>
                                <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] ml-auto">Ghost-Console (FFmpeg)</span>
                            </div>

                            <div className="flex-1 font-mono text-xs space-y-4 overflow-y-auto pr-4 custom-scrollbar">
                                {logs.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                                        <p>Aguardando comando...</p>
                                    </div>
                                )}
                                {logs.map((log, i) => (
                                    <p key={i} className={`flex items-start gap-4 ${i === 0 ? 'text-purple-400' : 'text-gray-600'}`}>
                                        <span className="text-white/5 font-black">{'>'}</span>
                                        <span className={`${i === 0 ? 'font-bold' : ''} leading-relaxed`}>{log}</span>
                                    </p>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <div className="flex items-center gap-5 text-gray-500">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] uppercase font-black tracking-widest text-white/30">Status do Motor</span>
                                        <span className="text-xs font-mono text-green-500 active-glow">ESTÁVEL</span>
                                    </div>
                                    <div className="w-px h-8 bg-white/5"></div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] uppercase font-black tracking-widest text-white/30">Criptografia</span>
                                        <span className="text-xs font-mono text-blue-400">RANDOM-SALT</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <footer className="mt-16 text-center text-gray-700 text-[9px] font-bold uppercase tracking-[0.6em]">
                    Developed for Professional Advertisers • Private Sandbox Mode
                </footer>

            </div>

            <style>{`
                .active-glow { text-shadow: 0 0 10px rgba(34, 197, 94, 0.4); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.4); }
            `}</style>
        </div>
    );
};
