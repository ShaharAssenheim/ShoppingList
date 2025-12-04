import React, { useState } from 'react';

interface ItemInputProps {
  onAdd: (name: string) => void;
  isBusy: boolean;
}

export const ItemInput: React.FC<ItemInputProps> = ({ onAdd, isBusy }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 w-full sticky top-4 z-20 md:static">
      <div className="bg-white/90 backdrop-blur-xl p-1.5 pl-2 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 flex items-center gap-2 transition-all focus-within:shadow-[0_8px_30px_rgb(99,102,241,0.15)] focus-within:border-indigo-100 ring-1 ring-slate-900/5">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="הקלד/י שם מוצר..."
          className="flex-1 bg-transparent p-3 pr-4 text-lg focus:outline-none placeholder-slate-400 text-slate-700 w-full min-w-0"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className={`
            relative overflow-hidden
            bg-[#6366f1] hover:bg-[#4f46e5] disabled:bg-slate-100 disabled:text-slate-300 text-white
            transition-all duration-300 shadow-md shadow-indigo-200 hover:shadow-indigo-300 active:scale-95
            flex items-center justify-center shrink-0
            /* Mobile: Fixed square shape */
            h-12 w-12 rounded-[1.2rem]
            /* Desktop: Auto width pill shape */
            sm:h-auto sm:w-auto sm:px-6 sm:py-3 sm:rounded-xl
          `}
        >
          {/* Text label - Desktop only */}
          <span className="hidden sm:inline font-bold text-lg ml-2">הוסף</span>

          {/* Icon/Spinner container */}
          <div className="flex items-center justify-center">
            {isBusy ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              // Plus icon - Larger on mobile to fill the square, normal on desktop
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-5 sm:h-5">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>
      </div>
    </form>
  );
};
