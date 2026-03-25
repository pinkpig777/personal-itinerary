import React from 'react';

export default function Tabs({ activeTab, setActiveTab }) {
  const dates = ['4/3', '4/4', '4/5'];
  
  const getTabLabel = (date) => {
    if (date === '4/3') return 'Fri 4/3';
    if (date === '4/4') return 'Sat 4/4';
    return 'Sun 4/5';
  };

  return (
    <div className="flex justify-around bg-texas-sand/95 backdrop-blur-sm p-3 shadow-sm border-b border-cowboy-leather/20 sticky top-0 z-10">
      {dates.map(date => (
        <button
          key={date}
          onClick={() => setActiveTab(date)}
          className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none ${
            activeTab === date 
              ? 'bg-aggie-maroon text-texas-sand shadow-[0_4px_10px_rgba(80,0,0,0.3)] scale-105' 
              : 'text-cowboy-leather hover:bg-cowboy-leather/10'
          }`}
        >
          {getTabLabel(date)}
        </button>
      ))}
    </div>
  );
}
