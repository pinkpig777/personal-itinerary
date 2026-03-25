import React from 'react';

export default function FloatingActionButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-aggie-maroon text-texas-sand w-16 h-16 rounded-full shadow-[0_4px_15px_rgba(80,0,0,0.5)] text-4xl flex items-center justify-center pb-1 hover:bg-[#3a0000] hover:scale-105 hover:rotate-90 transition-all duration-300 z-20 border-2 border-cowboy-leather/30"
    >
      +
    </button>
  );
}
