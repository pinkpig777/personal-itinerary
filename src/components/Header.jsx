import React from 'react';

export default function Header() {
  return (
    <header className="bg-aggie-maroon text-texas-sand p-6 shadow-[0_4px_20px_rgba(80,0,0,0.4)] rounded-b-2xl border-b-4 border-cowboy-leather relative overflow-hidden">
      {/* Subtle texture/pattern effect could be added here in future, using CSS gradients for now */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cowboy-leather via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <h1 className="text-4xl font-western tracking-wider drop-shadow-md text-white">Howdy, C-Stat!</h1>
        <p className="text-texas-sand/90 font-sans text-sm mt-2 font-bold tracking-widest uppercase">April 3 - April 5, 2026</p>
      </div>
    </header>
  );
}
