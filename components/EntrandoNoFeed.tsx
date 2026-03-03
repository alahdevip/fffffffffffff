import React, { useEffect, useState } from 'react';

export const EntrandoNoFeed: React.FC = () => {
  const [loadingText, setLoadingText] = useState('Conectando...');

  useEffect(() => {
    const texts = ['Conectando...', 'Entrando...', 'Carregando Feed...'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      setLoadingText(texts[currentIndex]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
      <div className="flex flex-col items-center animate-pulse">
        <img
          src="/instagram-logo.svg"
          alt="Instagram"
          className="w-48 invert" // Invert to make it white if it's black, or just use filter
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-medium tracking-wide animate-pulse">
          {loadingText}
        </p>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-1 opacity-50">
        <span className="text-gray-500 text-xs font-medium">from</span>
        <div className="flex items-center gap-1.5">
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" alt="Meta" className="h-3 w-auto opacity-70 filter invert" />
        </div>
      </div>
    </div>
  );
};
