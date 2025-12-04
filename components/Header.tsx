import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="pt-2 pb-4 flex justify-center items-center px-4" role="banner">
      <div className="w-full max-w-2xl text-center animate-in slide-in-from-top-4 fade-in duration-700">
        <div className="
          relative overflow-hidden
          bg-gradient-to-b from-white to-indigo-50/40
          border border-white/60
          rounded-[2.5rem]
          p-8 md:p-10
          shadow-[0_20px_40px_-20px_rgba(99,102,241,0.15)]
        ">
          {/* Decorative background blob */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl -z-10" aria-hidden="true"></div>

           {/* Decorative floating icons - Hidden from screen readers */}
           <div className="flex justify-center gap-8 mb-6 text-5xl animate-float" aria-hidden="true">
            <span className="transform -rotate-12 inline-block filter drop-shadow-sm cursor-default hover:scale-110 transition-transform">🛒</span>
            <span className="transform rotate-12 inline-block delay-100 filter drop-shadow-sm cursor-default hover:scale-110 transition-transform">🥑</span>
            <span className="transform -rotate-6 inline-block delay-200 filter drop-shadow-sm cursor-default hover:scale-110 transition-transform">🧀</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 mb-4 tracking-tight leading-[1.15]">
            <span className="text-[#6366f1]">רשימת</span>{' '}
            <span className="text-slate-800 relative inline-block">
              קניות
              {/* Decorative underline */}
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-200" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.6" />
              </svg>
            </span>
            <br className="block sm:hidden" aria-hidden="true" />
            {' '}
            <span className="text-[#4f46e5] block sm:inline mt-2 sm:mt-0">משותפת</span>
          </h1>
          
          <p className="text-slate-500 font-medium text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            מנהלים ביחד את הקניות שלנו בזמן אמת ובכיף
          </p>
        </div>
      </div>
    </header>
  );
};