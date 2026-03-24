import React from 'react';

export default function FloatingActionButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-red-800 text-white w-14 h-14 rounded-full shadow-lg text-3xl flex items-center justify-center pb-1 hover:bg-red-700 transition-colors z-20"
    >
      +
    </button>
  );
}
