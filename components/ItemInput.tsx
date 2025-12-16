import React, { useState, useEffect, useRef } from 'react';

interface ItemInputProps {
  onAdd: (name: string) => void;
  isBusy: boolean;
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ItemInput: React.FC<ItemInputProps> = ({ onAdd, isBusy }) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [autoAddEnabled, setAutoAddEnabled] = useState(true); // Auto-add by default
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize Speech Recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'he-IL'; // Hebrew language
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        console.log('[Voice] Recognized:', transcript);
        
        if (!transcript) return;
        
        setInputValue(transcript);
        setIsListening(false);
        
        // Auto-add if enabled: Show briefly then add
        if (autoAddEnabled) {
          console.log('[Voice] Auto-adding:', transcript);
          // Show the item briefly (500ms) before adding
          setTimeout(() => {
            onAdd(transcript);
            setInputValue('');
          }, 500);
        }
        // If auto-add disabled, just fill the input for manual review
      };
      
      recognition.onerror = (event: any) => {
        console.error('[Voice] Error:', event.error);
        setIsListening(false);
        
        // Show user-friendly error messages
        if (event.error === 'no-speech') {
          console.log('[Voice] No speech detected');
        } else if (event.error === 'not-allowed') {
          alert('נא לאפשר גישה למיקרופון בהגדרות הדפדפן');
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      // Stop listening
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Start listening
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log('[Voice] Listening...');
      } catch (error) {
        console.error('[Voice] Failed to start:', error);
      }
    }
  };

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
          placeholder="הקלד/י או דבר/י שם מוצר..."
          className="flex-1 bg-transparent p-3 pr-4 text-lg focus:outline-none placeholder-slate-400 text-slate-700 w-full min-w-0"
        />
        
        {/* Voice Input Button - Only show if supported */}
        {isSupported && (
          <>
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`
                relative overflow-hidden flex-shrink-0
                h-12 w-12 rounded-[1.2rem]
                flex items-center justify-center
                transition-all duration-300 active:scale-95
                ${isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 animate-pulse' 
                  : autoAddEnabled 
                    ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }
              `}
              title={isListening ? 'מקליט... תפסיק לדבר כדי להוסיף' : autoAddEnabled ? 'הקלטה אוטומטית (לחץ ארוך להשבתה)' : 'הקלטה ידנית (לחץ ארוך להפעלה)'}
              aria-label={isListening ? 'עצור הקלטה' : 'הקלטה קולית'}
              onMouseDown={(e) => {
                // Long press to toggle auto-add mode
                const timer = setTimeout(() => {
                  setAutoAddEnabled(!autoAddEnabled);
                  // Haptic feedback if available
                  if (navigator.vibrate) {
                    navigator.vibrate(50);
                  }
                }, 800);
                (e.target as any).longPressTimer = timer;
              }}
              onMouseUp={(e) => {
                clearTimeout((e.target as any).longPressTimer);
              }}
              onTouchStart={(e) => {
                const timer = setTimeout(() => {
                  setAutoAddEnabled(!autoAddEnabled);
                  if (navigator.vibrate) {
                    navigator.vibrate(50);
                  }
                }, 800);
                (e.target as any).longPressTimer = timer;
              }}
              onTouchEnd={(e) => {
                clearTimeout((e.target as any).longPressTimer);
              }}
            >
              {isListening ? (
                // Recording animation
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                  </svg>
                  {/* Pulsing rings */}
                  <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
                </div>
              ) : (
                // Microphone icon with auto-add indicator
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                  </svg>
                  {/* Auto-add indicator */}
                  {autoAddEnabled && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
              )}
            </button>
          </>
        )}
        
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
