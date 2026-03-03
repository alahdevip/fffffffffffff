
import React, { useEffect, useRef } from 'react';

export const MatrixBackground: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Use parent dimensions if not fixed full screen
    const updateSize = () => {
      if (className?.includes('absolute') || className?.includes('relative')) {
         const parent = canvas.parentElement;
         if (parent) {
            width = canvas.width = parent.clientWidth;
            height = canvas.height = parent.clientHeight;
         } else {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
         }
      } else {
         width = canvas.width = window.innerWidth;
         height = canvas.height = window.innerHeight;
      }
    };

    let width = 0;
    let height = 0;
    updateSize();

    // 📱 Detectar Mobile para otimização
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    // Caracteres: Mix de Katakana e Alfanumérico
    const chars = 'アカサタナハマヤラワ0123456789STALKEA_AI_SECURITY_V4';
    const charArray = chars.split('');

    const fontSize = 16;
    // 🚀 Reduzir colunas em mobile (menos partículas = melhor performance)
    const columnDivisor = isMobile ? fontSize * 2 : fontSize;
    const columns = Math.floor(width / columnDivisor);

    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    let animationFrameId: number;
    let lastFrameTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const draw = () => {
      // Fundo preto sólido com baixa opacidade no preenchimento para criar o rastro
      ctx.fillStyle = 'rgba(5, 5, 5, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${fontSize}px monospace`;

      // Batches para otimização de renderização (minimiza trocas de contexto do canvas)
      const normalDrops: {text: string, x: number, y: number}[] = [];
      const strongDrops: {text: string, x: number, y: number}[] = [];
      const glitchDrops: {text: string, x: number, y: number}[] = [];

      for (let i = 0; i < drops.length; i++) {
        // Seleciona caractere aleatório
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * columnDivisor;
        const y = drops[i] * fontSize;

        const isGlitch = Math.random() > 0.98;
        const isStrong = Math.random() > 0.9;

        if (isGlitch) {
          const xOffset = (!isMobile) ? (Math.random() - 0.5) * 10 : 0;
          glitchDrops.push({ text, x: x + xOffset, y });
        } else if (isStrong) {
          strongDrops.push({ text, x, y });
        } else {
          normalDrops.push({ text, x, y });
        }

        if (y > height && Math.random() > 0.97) {
          drops[i] = 0;
        }

        drops[i] += 0.8;
      }

      // Desenhar em lotes
      if (normalDrops.length > 0) {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.45)'; // Purple
        ctx.shadowBlur = 0;
        for (const d of normalDrops) ctx.fillText(d.text, d.x, d.y);
      }

      if (strongDrops.length > 0) {
        ctx.fillStyle = '#a855f7'; // Purple
        if (!isMobile) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#a855f7';
        }
        for (const d of strongDrops) ctx.fillText(d.text, d.x, d.y);
      }

      if (glitchDrops.length > 0) {
        ctx.fillStyle = '#d8b4fe'; // Light Purple
        if (!isMobile) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#d8b4fe';
        }
        for (const d of glitchDrops) ctx.fillText(d.text, d.x, d.y);
      }
    };

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const deltaTime = currentTime - lastFrameTime;
      if (deltaTime >= frameInterval) {
        draw();
        lastFrameTime = currentTime - (deltaTime % frameInterval);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      updateSize();
      // Recalcula colunas no resize
      const newColumnDivisor = isMobile ? fontSize * 2 : fontSize;
      const newColumns = Math.floor(width / newColumnDivisor);
      if (newColumns > drops.length) {
        for (let i = drops.length; i < newColumns; i++) {
          drops[i] = Math.random() * -100;
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`matrix-bg z-0 pointer-events-none opacity-30 ${className || 'fixed inset-0'}`}
      style={{ filter: 'contrast(1.1) brightness(1.05)', willChange: 'transform' }}
    />
  );
};
