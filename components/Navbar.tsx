
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-xl italic select-none">S</span>
          </div>
          <span className="text-white font-black text-xl tracking-tighter select-none">STALKEA<span className="text-purple-500">AI</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Como funciona</a>
          <a href="#" className="hover:text-white transition-colors">Segurança</a>
          <a href="#" className="hover:text-white transition-colors">Preços</a>
        </div>

        <div className="w-[100px] md:hidden"></div>
      </div>
    </nav>
  );
};
