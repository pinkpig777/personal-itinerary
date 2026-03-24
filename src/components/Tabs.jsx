import React from 'react';

export default function Tabs({ activeTab, setActiveTab }) {
  const dates = ['4/3', '4/4', '4/5'];
  
  const getTabLabel = (date) => {
    if (date === '4/3') return 'Fri 4/3';
    if (date === '4/4') return 'Sat 4/4';
    return 'Sun 4/5';
  };

  return (
    <div className="flex justify-around bg-white p-2 shadow-sm sticky top-0 z-10">
      {dates.map(date => (
        <button
          key={date}
          onClick={() => setActiveTab(date)}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeTab === date ? 'bg-red-800 text-white' : 'text-gray-500 hover:bg-red-50'
          }`}
        >
          {getTabLabel(date)}
        </button>
      ))}
    </div>
  );
}
