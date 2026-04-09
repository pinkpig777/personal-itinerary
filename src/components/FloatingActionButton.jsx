import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function FloatingActionButton({ onClick }) {
  const { theme } = useTheme();

  return (
    <button 
      onClick={onClick}
      style={{
        backgroundColor: theme.background,
        color: theme.primary,
        borderColor: theme.secondary,
        boxShadow: `-4px 4px 0px 0px #333333`
      }}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-md text-4xl flex items-center justify-center pb-1 hover:scale-105 transition-transform duration-200 z-20 border-2"
    >
      +
    </button>
  );
}
