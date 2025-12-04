import React, { useState } from 'react';
import { ShoppingItem } from '../types';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ShoppingItemRow: React.FC<ShoppingItemRowProps> = ({ item, onToggle, onDelete }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExiting(true);
    
    // Wait for the animation (500ms) to finish before actually deleting from state
    setTimeout(() => {
      onDelete(item.id);
    }, 500);
  };

  return (
    <div 
      className={`group relative flex items-center justify-between bg-white border rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-sm ${
        isExiting 
          ? 'opacity-0 scale-90 max-h-0 mb-0 py-0 border-transparent translate-y-4 pointer-events-none' 
          : 'opacity-100 max-h-24 mb-3 p-3 translate-y-0'
      } ${
        item.isCompleted 
          ? 'bg-slate-50 border-transparent opacity-60 scale-[0.97]' 
          : `border-slate-100 scale-100 ${!isExiting ? 'hover:border-[#8B9AF9]/50 hover:shadow-[0_8px_20px_-6px_rgba(99,102,241,0.15)] hover:-translate-y-[2px] hover:scale-[1.02] active:scale-[0.99]' : ''}`
      }`}
    >
      {/* Click handler wrapper for the main content */}
      <div 
        className="flex-1 flex items-center gap-4 cursor-pointer select-none py-1 pr-1"
        onClick={() => !isExiting && onToggle(item.id)}
      >
        {/* Emoji Icon - Placed on the Right (Start in RTL) */}
        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-2xl transition-all duration-500 ${
            item.isCompleted 
                ? 'bg-slate-200/50 grayscale opacity-70 scale-90' 
                : 'bg-[#F0F4FF] group-hover:scale-110 shadow-sm group-hover:shadow-indigo-100'
        }`}>
            {item.isAnalysing ? (
              <span className="animate-spin text-lg">⏳</span>
            ) : (
              <span className={`filter transition-all duration-500 ${item.isCompleted ? 'blur-[0.5px]' : 'drop-shadow-sm'}`}>{item.emoji}</span>
            )}
        </div>

        {/* Text Content */}
        <div className="flex flex-col transition-opacity duration-300">
          <span className={`text-lg font-bold leading-tight transition-all duration-300 decoration-2 underline-offset-4 ${
              item.isCompleted 
                ? 'line-through text-slate-400 decoration-slate-300' 
                : 'text-slate-800 decoration-transparent'
            }`}>
            {item.name}
          </span>
          <span className={`text-xs font-medium mt-0.5 transition-colors duration-300 ${
              item.isCompleted ? 'text-slate-300' : 'text-slate-400'
          }`}>{item.category}</span>
        </div>
      </div>

      {/* Delete button - Pushed to the far Left */}
      <button
        onClick={handleDeleteClick}
        disabled={isExiting}
        className="ml-2 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 active:scale-95 disabled:cursor-not-allowed"
        title="מחק פריט"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    </div>
  );
};
